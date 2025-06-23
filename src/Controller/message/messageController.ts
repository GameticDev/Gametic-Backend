import { Request, Response } from "express";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import { AuthenticatedRequest } from "../../Middleware/auth";
import { CustomError } from "../../utils/customError";
import chatModal from "../../Model/chatModal";
import asyncHandler from "../../Middleware/asyncHandler";
import Match from "../../Model/matchPostModel";


export const sendMessage = asyncErrorhandler(async (req: AuthenticatedRequest, res: Response) => {
    const {roomId , senderId , message } = req.body 
    
    if(req.user?.userId !== senderId ){
        throw new CustomError("you not joined this match")
    }
    
    const chat = await chatModal.create({roomId , senderId , message})
    await chat.save()
    return res.status(200).json({chat})
})

export const getMessage = asyncErrorhandler(async (req: AuthenticatedRequest, res: Response) => {
    const {roomId} = req.params
    const chat = await chatModal.find({roomId})
   return res.status(200).json({chat})

})

export const getJoinedPlayers = asyncErrorhandler(async (req: AuthenticatedRequest, res: Response) => { 
    const id  = req.user?.userId
      const joinedOnlyMatches = await Match.find({
    joinedPlayers: id,
    userId: { $ne: id },
  }).select("title  joinedPlayers")
  res.status(200).json({players:joinedOnlyMatches})
})