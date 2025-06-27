import { Request, Response } from "express";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import { AuthenticatedRequest } from "../../Middleware/auth";
import { CustomError } from "../../utils/customError";
import chatModal from "../../Model/chatModal";
import Match from "../../Model/matchPostModel";


export const sendMessage = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { roomId, senderId, message } = req.body;

    console.log(roomId , senderId , "dfghj");
    
    if (!roomId || !senderId || !message) {
      throw new CustomError("All fields are required", 400);
    }

    if (req.user?.userId !== senderId) {
      throw new CustomError("Unauthorized sender", 403);
    }

    const match = await Match.findOne({ _id: roomId });

    
    if (!match) {
      throw new CustomError("Match (room) not found", 404);
    }

    const isJoined = match.joinedPlayers.some(
      (playerId) => playerId.toString() === senderId
    );

    if (!isJoined) {
      throw new CustomError("You are not joined in this match", 403);
    }

    
    // const chat = await chatModal.create({ roomId, senderId, message });

    // return res.status(200).json({ chat });
  }
);


export const getMessage = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const chat = await chatModal
      .find({ roomId })
      .populate({
        path: "senderId",
        select: "username _id", 
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({ chat });
  }
);


export const getJoinedPlayers = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const joinedOnlyMatches = await Match.find({
      joinedPlayers: userId,
      userId: { $ne: userId },
    }).select("title joinedPlayers");

    res.status(200).json({ players: joinedOnlyMatches });
  }
);