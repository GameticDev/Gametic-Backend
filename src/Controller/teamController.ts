import { Request, Response } from "express";
import User from "../Model/userModel";
import { createTeamService } from "../Service/teamService";
import { CustomError } from "../utils/customError";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import { AuthenticatedRequest } from "../Middleware/auth";
import mongoose from "mongoose";
import Tournament from "../Model/tournamentModel";
import Razorpay from "razorpay";
import { getIO } from "../socket";
import Notification from "../Model/notificationModel";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createTeamOrder = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, sport, maxMembers, members, tournament } = req.body;
    const { userId } = req.user!;
    const teamManager = new mongoose.Types.ObjectId(userId);
    const tournamentId = new mongoose.Types.ObjectId(tournament);

    // Validation
    if (!name || !sport || !maxMembers || !tournament) {
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    const tournamentData = await Tournament.findById(tournamentId).exec();
    if (!tournamentData) {
      res.status(404).json({ message: "Tournament not found" });
      return;
    }

    if (tournamentData.joinedTeams.length >= tournamentData.maxTeams) {
      res
        .status(400)
        .json({ message: "Tournament has reached maximum team capacity" });
      return;
    }

    if (tournamentData.status !== "upcoming") {
      res.status(400).json({ message: "Can only join upcoming tournaments" });
      return;
    }

    if (maxMembers > tournamentData.maxPlayers) {
      res.status(400).json({
        message: `Team size exceeds tournament's max players (${tournamentData.maxPlayers})`,
      });
      return;
    }

    const manager = await User.findById(userId, "username").exec();
    if (!manager || !manager.username) {
      res.status(404).json({ message: "Team manager name not found" });
      return;
    }
    const managerName = manager.username;

    let updatedMembers: string[] = [managerName];
    if (members) {
      const invalidNames = members.filter(
        (member: string) => !member || typeof member !== "string"
      );
      if (invalidNames.length > 0) {
        res
          .status(400)
          .json({ message: "All members must be non-empty strings" });
        return;
      }
      updatedMembers = [...new Set([managerName, ...members])];
    }

    if (updatedMembers.length !== maxMembers) {
      res.status(400).json({
        message: `Number of members (${updatedMembers.length}) must exactly match maxMembers (${maxMembers})`,
      });
      return;
    }

    const amount = tournamentData.entryFee || 0; // Adjust based on your schema

    if (amount <= 0) {
      res.status(400).json({ message: "Invalid tournament registration fee" });
      return;
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: `team_join_${Date.now()}`,
        notes: {
          userId,
          tournamentId: tournamentId.toString(),
          teamName: name,
          sport,
          maxMembers,
          type: "team_registration",
        },
      };

      const order = await razorpay.orders.create(options);

      // Instead of creating the team immediately, return the order details
      res.status(200).json({
        success: true,
        order,
        amount,
        currency: "INR",
        key_id: process.env.RAZORPAY_KEY_ID,
        teamDetails: {
          name,
          sport,
          maxMembers,
          members: updatedMembers,
          teamManager,
          tournamentId,
        },
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
      return;
    }
  }
);




export const createTeamAndJoin = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, sport, maxMembers, members, tournament } = req.body;
    const { userId } = req.user!;
    const teamManager = new mongoose.Types.ObjectId(userId);
    const tournamentId = new mongoose.Types.ObjectId(tournament);

    const tournamentData = await Tournament.findById(tournamentId).exec();
    if (!tournamentData) {
      throw new CustomError("Tournament not found", 404);
    }
    if (tournamentData.joinedTeams.length >= tournamentData.maxTeams) {
      throw new CustomError(
        "Tournament has reached maximum team capacity",
        400
      );
    }
    if (tournamentData.status !== "upcoming") {
      throw new CustomError("Can only join upcoming tournaments", 400);
    }
    if (maxMembers > tournamentData.maxPlayers) {
      throw new CustomError(
        `Team size exceeds tournament's max players (${tournamentData.maxPlayers})`,
        400
      );
    }

    const manager = await User.findById(userId, "username").exec();
    if (!manager || !manager.username) {
      throw new CustomError("Team manager name not found", 404);
    }
    const managerName = manager.username;

    let updatedMembers: string[] = [managerName];
    if (members) {
      const invalidNames = members.filter(
        (member: string) => !member || typeof member !== "string"
      );
      if (invalidNames.length > 0) {
        throw new CustomError("All members must be non-empty strings", 400);
      }
      updatedMembers = [...new Set([managerName, ...members])];
    }

    if (updatedMembers.length !== maxMembers) {
      throw new CustomError(
        `Number of members (${updatedMembers.length}) must exactly match maxMembers (${maxMembers})`,
        400
      );
    }

    const team = await createTeamService(
      name,
      sport,
      updatedMembers,
      teamManager,
      tournamentId
    );

    await Tournament.findByIdAndUpdate(
      tournamentId,
      { $addToSet: { joinedTeams: team._id } },
      { new: true }
    ).exec();

    // Find tournament organizer
    const tournamentOrganizer = await User.findById(tournamentData.organizer).select("username");
    if (!tournamentOrganizer) {
      throw new CustomError("Tournament organizer not found", 400);
    }

    // Create notification for tournament organizer
    const notification = new Notification({
      title: "New Team Joined Your Tournament!",
      message: `${managerName} has created and joined team "${name}" to your tournament "${tournamentData.title}".`,
      type: "tournament",
      userId: tournamentData.organizer,
      tournamentId: tournamentData._id,
      isRead: false,
    });

    await notification.save();

    // Emit socket.io notification
    const io = getIO();
    io.to(`user:${tournamentData.organizer}`).emit("newNotification", {
      title: "New Team Joined Your Tournament!",
      message: `${managerName} has created and joined team "${name}" to your tournament "${tournamentData.title}".`,
      type: "tournament",
      tournamentId: tournamentData._id,
    });

    return res.status(201).json({
      message: "Team created and joined tournament successfully",
      team,
      addedMembers: updatedMembers.map((name: string) => ({ name })),
      tournament: tournamentId,
    });
  }
);