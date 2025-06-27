import { Request, Response } from "express";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import { CustomError } from "../utils/customError";
import tournamentService from "../Service/tournamentService";
import mongoose from "mongoose";
import Tournament from "../Model/tournamentModel";
import { AuthenticatedRequest } from "../Middleware/auth";
import User from "../Model/userModel";
import Notification from "../Model/notificationModel";
import { getIO } from "../socket";
import Turff from "../Model/turfModel";
import User from "../Model/userModel";
import Notification from "../Model/notificationModel";
import { getIO } from "../socket";
import Turff from "../Model/turfModel";

export const createTournamentPost = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      description,
      sport,
      turf,
      dateFrom,
      dateTo,
      maxTeams,
      maxPlayers,
      entryFee,
      prizePool,
      status,
    } = req.body;
    const { userId } = req.user!;

    const organizer = new mongoose.Types.ObjectId(userId);
    const turff = new mongoose.Types.ObjectId(turf);
export const createTournamentPost = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      description,
      sport,
      turf,
      dateFrom,
      dateTo,
      maxTeams,
      maxPlayers,
      entryFee,
      prizePool,
      status,
    } = req.body;
    const { userId } = req.user!;

    const organizer = new mongoose.Types.ObjectId(userId);
    const turff = new mongoose.Types.ObjectId(turf);

    // Validate inputs
    if (!title || typeof title !== "string") {
      throw new CustomError("Title is required and must be a string");
    }
    if (!description || typeof description !== "string") {
      throw new CustomError("Description is required and must be a string");
    }
    if (!sport || typeof sport !== "string") {
      throw new CustomError("Sport is required and must be a string");
    }
    if (!dateFrom || isNaN(new Date(dateFrom).getTime())) {
      throw new CustomError("Valid start date (dateFrom) is required");
    }
    if (!dateTo || isNaN(new Date(dateTo).getTime())) {
      throw new CustomError("Valid end date (dateTo) is required");
    }
    if (!maxTeams) {
      throw new CustomError("maxTeams is required");
    }
    if (!maxPlayers) {
      throw new CustomError("maxPlayers is required");
    }
    if (entryFee == null) {
      throw new CustomError("entryFee is required");
    }
    if (prizePool == null) {
      throw new CustomError("PrizePool is required");
    // Validate inputs
    if (!title || typeof title !== "string") {
      throw new CustomError("Title is required and must be a string");
    }
    if (!description || typeof description !== "string") {
      throw new CustomError("Description is required and must be a string");
    }
    if (!sport || typeof sport !== "string") {
      throw new CustomError("Sport is required and must be a string");
    }
    if (!dateFrom || isNaN(new Date(dateFrom).getTime())) {
      throw new CustomError("Valid start date (dateFrom) is required");
    }
    if (!dateTo || isNaN(new Date(dateTo).getTime())) {
      throw new CustomError("Valid end date (dateTo) is required");
    }
    if (!maxTeams) {
      throw new CustomError("maxTeams is required");
    }
    if (!maxPlayers) {
      throw new CustomError("maxPlayers is required");
    }
    if (entryFee == null) {
      throw new CustomError("entryFee is required");
    }
    if (prizePool == null) {
      throw new CustomError("PrizePool is required");
    }
    if (!turff) {
      throw new CustomError("turf required");
    }
    if (!req.file) {
      throw new CustomError("Image file is required");
    }

    const turfDoc = await Turff.findOne({
      _id: turff,
    });
    if (!turfDoc) {
      throw new CustomError("Turf not found or inactive", 404);
    }

    const imagePath = req.file.path || req.file.filename;

    // Create the tournament
    const tournament = await tournamentService({
      title,
      description,
      sport,
      turf: turff,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      organizer,
      maxTeams,
      maxPlayers,
      joinedTeams: [],
      entryFee,
      prizePool,
      status: status || "upcoming",
      image: imagePath,
    });

    // Fetch users in the turf's location
    const usersInLocation = await User.find({
      preferredLocation: turfDoc.location, // Use turfDoc.location
      _id: { $ne: userId },
      isBlocked: false,
    }).select("_id");

    // Create notifications for users
    const notificationPromises = usersInLocation.map((user) =>
      new Notification({
        title: "New Tournament Available!",
        message: `A new ${sport} tournament titled "${title}" is scheduled from ${dateFrom} to ${dateTo}
        Registration is now open!`,
        type: "tournament",
        userId: user._id,
        tournamentId: tournament._id,
        isRead: false,
      }).save()
    );

    await Promise.all(notificationPromises);

    // Emit socket.io notification
    const io = getIO();
    io.to(`location:${turfDoc.location}`).emit("newNotification", {
      // Use turfDoc.location
      title: "New Tournament Available!",
      message: `A new ${sport} tournament titled "${title}" is scheduled from ${dateFrom} to ${dateTo} Registration is now open!!`,
      type: "tournament",
      tournamentId: tournament._id,
    });
    if (!turff) {
      throw new CustomError("turf required");
    }
    if (!req.file) {
      throw new CustomError("Image file is required");
    }

    const turfDoc = await Turff.findOne({
      _id: turff,
    });
    if (!turfDoc) {
      throw new CustomError("Turf not found or inactive", 404);
    }

    const imagePath = req.file.path || req.file.filename;

    // Create the tournament
    const tournament = await tournamentService({
      title,
      description,
      sport,
      turf: turff,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      organizer,
      maxTeams,
      maxPlayers,
      joinedTeams: [],
      entryFee,
      prizePool,
      status: status || "upcoming",
      image: imagePath,
    });

    // Fetch users in the turf's location
    const usersInLocation = await User.find({
      preferredLocation: turfDoc.location, // Use turfDoc.location
      _id: { $ne: userId },
      isBlocked: false,
    }).select("_id");

    // Create notifications for users
    const notificationPromises = usersInLocation.map((user) =>
      new Notification({
        title: "New Tournament Available!",
        message: `A new ${sport} tournament titled "${title}" is scheduled from ${dateFrom} to ${dateTo}
        Registration is now open!`,
        type: "tournament",
        userId: user._id,
        tournamentId: tournament._id,
        isRead: false,
      }).save()
    );

    await Promise.all(notificationPromises);

    // Emit socket.io notification
    const io = getIO();
    io.to(`location:${turfDoc.location}`).emit("newNotification", {
      // Use turfDoc.location
      title: "New Tournament Available!",
      message: `A new ${sport} tournament titled "${title}" is scheduled from ${dateFrom} to ${dateTo} Registration is now open!!`,
      type: "tournament",
      tournamentId: tournament._id,
    });

    return res.status(201).json({
      message: "Tournament created successfully",
      tournament,
    });
  }
);
export const getAllTournamentPost = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "12",
      search = "",
      sport = "",
      location = "",
    } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (sport) {
      query.sport = { $regex: sport, $options: "i" };
    }

    if (location) {
      query["turf"] = {
        $or: [
          { location: { $regex: location, $options: "i" } },
          { area: { $regex: location, $options: "i" } },
          { city: { $regex: location, $options: "i" } },
        ],
      };
    }
    const tournaments = await Tournament.find(query)
      .populate("turf", "location name area city")
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalTournaments = await Tournament.countDocuments(query);

    const totalPages = Math.ceil(totalTournaments / limitNumber);
    return res.status(201).json({
      message: "Tournament created successfully",
      tournament,
    });
  }
);
export const getAllTournamentPost = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "12",
      search = "",
      sport = "",
      location = "",
    } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (sport) {
      query.sport = { $regex: sport, $options: "i" };
    }

    if (location) {
      query["turf"] = {
        $or: [
          { location: { $regex: location, $options: "i" } },
          { area: { $regex: location, $options: "i" } },
          { city: { $regex: location, $options: "i" } },
        ],
      };
    }
    const tournaments = await Tournament.find(query)
      .populate("turf", "location name area city")
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalTournaments = await Tournament.countDocuments(query);

    const totalPages = Math.ceil(totalTournaments / limitNumber);
    return res.status(200).json({
      message: "All Tournament Posts successfully fetched",
      data: {
        tournaments,
        total: totalTournaments,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalPages,
        },
      },
    });
  }
);

export const tournamentById = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new CustomError("id is not available", 404);
    }
    const data = await Tournament.findById(id)
      .populate({
        path: "joinedTeams",
        populate: {
          path: "teamManager",
          select: " username email",
        },
      })
      .populate("turf", "name location city area");
export const tournamentById = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new CustomError("id is not available", 404);
    }
    const data = await Tournament.findById(id)
      .populate({
        path: "joinedTeams",
        populate: {
          path: "teamManager",
          select: " username email",
        },
      })
      .populate("turf", "name location city area");

    return res.status(200).json({
      message: "Tournament post Fetched successfully",
      data,
    });
  }
);
    return res.status(200).json({
      message: "Tournament post Fetched successfully",
      data,
    });
  }
);

export const joinTeamToTournament = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { teamId } = req.body;
export const joinTeamToTournament = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      throw new CustomError("invalid Team id", 404);
    }
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      throw new CustomError("Tournament not found");
    }
    if (tournament.joinedTeams.includes(teamId)) {
      throw new CustomError("Team already joined", 400);
    }
    if (!teamId) {
      throw new CustomError("invalid Team id", 404);
    }
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      throw new CustomError("Tournament not found");
    }
    if (tournament.joinedTeams.includes(teamId)) {
      throw new CustomError("Team already joined", 400);
    }

    await Tournament.updateOne({ _id: id }, { $push: { joinedTeams: teamId } });
    await Tournament.updateOne({ _id: id }, { $push: { joinedTeams: teamId } });

    return res.status(200).json({
      message: "Team added to Tournament",
    });
  }
);

    return res.status(200).json({
      message: "Team added to Tournament",
    });
  }
);
