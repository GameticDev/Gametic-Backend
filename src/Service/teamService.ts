import mongoose from "mongoose";
import Team from "../Model/teamModel";

export const createTeamService = async (
  name: string,
  sport: string,
  updatedMembers: string[],
  teamManager: mongoose.Types.ObjectId,
  tournamentData: mongoose.Types.ObjectId
) => {
  if (!name || !sport || !Array.isArray(updatedMembers) || !tournamentData) {
    throw new Error("Invalid input parameters");
  }

  const team = new Team({
    name,
    sport,
    teamManager,
    members: updatedMembers,
    tournament: tournamentData,
  });

  await team.save();
  return team;
};
