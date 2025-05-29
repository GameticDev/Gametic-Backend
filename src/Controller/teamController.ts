import { Request, Response } from 'express';
import { asyncErrorhandler } from '../Middleware/asyncErrorHandler';
import { createTeamService } from '../Service/teamService';
import mongoose from 'mongoose';

export const createTeam = asyncErrorhandler(async (req: Request, res: Response) => {
  const { name, sport, memberIds, teamManager } = req.body;

  if (!teamManager) {
    return res.status(401).json({ message: 'Unauthorized: teamManager ID missing' });
  }

  const team = await createTeamService(name, sport, memberIds, teamManager);

  return res.status(201).json({
    message: 'Team created successfully',
    team,
  });
});
