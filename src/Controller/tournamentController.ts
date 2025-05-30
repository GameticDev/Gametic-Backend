import { Request, Response } from "express";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import { CustomError } from "../utils/customError";
import tournamentService from "../Service/tournamentService";
import mongoose from "mongoose";
import Tournament from "../Model/tournamentModel";



export const createTournamentPost = asyncErrorhandler(async (req: Request, res: Response) => {
    console.log(req.body,"hiuuiihjiujij")
  const {
    title,
    description,
    sport,
    location,
    dateFrom,
    dateTo,
    maxTeams,
    entryFee,
    joinedTeams,
    prizePool,
    createdBy,
    
  } = req.body;

//   const file = req.file;
// console.log(file,"fileeeeeeeee")
//   if (!file) {
//     throw new CustomError("Image file is missing", 400);
//   }

// //   const createdBy = req.user?._id; // assumes you are using auth middleware
//  if (!file) {
//     throw new CustomError("Image file is missing", 400);
//   }

  // ✅ Normalize joinedTeams into an array
  let parsedJoinedTeams: mongoose.Types.ObjectId[] = [];

  if (joinedTeams) {
    const raw = Array.isArray(joinedTeams) ? joinedTeams : [joinedTeams];

    parsedJoinedTeams = raw.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(`Invalid Team ID: ${id}`, 400);
      }
      return new mongoose.Types.ObjectId(id);
    });
  }
  const tournamentData = {
    title,
    description,
    sport,
    location,
    dateFrom: new Date(dateFrom),
    dateTo: new Date(dateTo),
    maxTeams: Number(maxTeams),
    entryFee: Number(entryFee),
    prizePool: Number(prizePool),
     joinedTeams: parsedJoinedTeams,
     createdBy:createdBy
    // image: file.path || file.filename,
  };

  const post = await tournamentService(tournamentData);

  return res.status(201).json({
    message: "Tournament created successfully",
    post
  });
});

export const getAllTournamentPost=asyncErrorhandler(async(req:Request,res:Response)=>{

    const post=await Tournament.find()
    return res.status(200).json({
        message:"All TournamnetPOst successfully fetched",
        post
    })
})
