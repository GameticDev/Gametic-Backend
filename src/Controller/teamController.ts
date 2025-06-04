import { Request, Response } from "express";
import User from "../Model/userModel";
import { createTeamService } from "../Service/teamService";
import { CustomError } from "../utils/customError";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";

export const createTeam = asyncErrorhandler(async (req: Request, res: Response) => {
  const { name, sport, memberEmails, teamManager } = req.body;
  console.log(req.body,'hiiii')



  // if (!teamManager) {
  //   throw new CustomError('Unauthorized: teamManager ID missing');
  // }

  // if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
  //   throw new CustomError('At least one member email is required');
  // }

  // Fetch users by email (only _id and email fields)
  const users = await User.find({ email: { $in: memberEmails } }, '_id email').exec();

  if (users.length !== memberEmails.length) {
    throw new CustomError('Some member emails are invalid or not registered');
  }

  const memberIds = users.map((u) => u._id);

  const team = await createTeamService(name, sport, memberIds, teamManager);

  return res.status(201).json({
    message: 'Team created successfully',
    team,
    addedMembers: users.map((u) => ({ id: u._id, email: u.email })),
  });
});
