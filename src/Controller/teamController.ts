import { Request, Response } from "express";
import User from "../Model/userModel";
import { createTeamService } from "../Service/teamService";
import { CustomError } from "../utils/customError";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import mongoose from "mongoose";
import {sendEmailService} from '../utils/sentInvitation'
import Team from "../Model/teamModel";
import { AuthenticatedRequest } from "../Middleware/auth";


export const createTeam = asyncErrorhandler(async (req:AuthenticatedRequest , res: Response) => {
  const { name, sport, memberEmails} = req.body;

  const { userId } = req.user!;



 
  
const teamManager=new mongoose.Types.ObjectId(userId);


  // if (!teamManager) {
  //   throw new CustomError('Unauthorized: teamManager ID missing');
  // }

  if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
    throw new CustomError('At least one member email is required');
  }

  // Fetch users by email (only _id and email fields)
const users = await User.find({ email: { $in: memberEmails } }, '_id email');



const memberIds = users.map((u) => u._id);

  const team = await createTeamService(name, sport, memberIds, teamManager);



await sendEmailService(memberEmails);

  return res.status(201).json({
    message: 'Team created successfully',
    team,
    addedMembers: users.map((u) => ({ id: u._id, email: u.email })),
  });
});


export const TeamById=asyncErrorhandler(async(req:Request,res:Response)=>{
    const{id}=req.params;
    if(!id){
      throw new CustomError(" Team id not found",404)
    }
    const team=await Team.findById(id)
     .populate('members','name email')

     if(!team){
      throw new CustomError("Team not found",404)
     }

     return res.status(200).json({
      message:"Team fetched successfully",
      team
     })

})