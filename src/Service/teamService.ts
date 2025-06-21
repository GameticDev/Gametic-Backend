import mongoose from 'mongoose';
import User from '../Model/userModel';
import Team from '../Model/teamModel';

export const createTeamService = async (
  name: string,
  sport: string,
  memberIds: mongoose.Types.ObjectId[],
  teamManager: mongoose.Types.ObjectId
)   => {
  // Basic input validation
  if (!name || !sport || !Array.isArray(memberIds)) {
    throw new Error('Invalid input parameters');
  }

  // 1. Remove duplicates and filter out undefined/null memberIds
  const uniqueMembers = [
    ...new Set(
      memberIds
        .filter(id => id !== undefined && id !== null)
        .map(id => id.toString())
    ),
  ];

  // 2. Check if teamManager is in memberIds
  // if (uniqueMembers.includes(teamManager.toString())) {
  //   throw new Error('Team leader cannot be a member of the team');
  // }

  // 3. Check all users exist
  // const users = await User.find({ _id: { $in: uniqueMembers } });
  // if (users.length !== uniqueMembers.length) {
  //   throw new Error('One or more member IDs are invalid');
  // }

  // 4. Check if any member is already in another team
  const existingTeams = await Team.find({
    members: { $in: uniqueMembers },
  });

  if (existingTeams.length > 0) {
    // Flatten members arrays from all teams
    const alreadyInTeam = existingTeams
      .flatMap(team => team.members)
      .map(id => id.toString());

    const duplicateMembers = uniqueMembers.filter(id =>
      alreadyInTeam.includes(id)
    );

    if (duplicateMembers.length > 0) {
      throw new Error(
        `Some members are already part of another team: ${duplicateMembers.join(
          ', '
        )}`
      );
    }
  }

  // 5. Create and save the new team
  const team = new Team({
    name,
    sport,
    teamManager,
    members: uniqueMembers,
  });

  await team.save();
  return team;
};
