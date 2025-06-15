import { Types } from "mongoose";
import Match, { MatchPost } from "../Model/matchPostModel";
import { CustomError } from "../utils/customError";

export const matchPostService = async (data: MatchPost) => {
  const {
    userId,
    title,
    sports,
    maxPlayers,
    joinedPlayers,
    turfId,
    date,
    startTime,
    endTime,
    paymentPerPerson,
    location,
    status,
  } = data;

  const newPost = new Match({
    userId,
    title,
    sports,
    maxPlayers,
    joinedPlayers,
    turfId,
    date,
    startTime,
    endTime,
    paymentPerPerson,
    location,
    status,
  });

  return await newPost.save();
};

export const cancledMatchService = async (matchId: string, userId: string) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw new CustomError("Match not Found");
  }

  if (match.userId.toString() === userId.toString()) {
    throw new CustomError("Host cannot cancel as a player");
  }
  const isJoined = match.joinedPlayers
    .map((id) => id.toString())
    .includes(userId);

    if(!isJoined){
        throw new CustomError("You have not joined this match")
    }

    match.joinedPlayers = match.joinedPlayers.filter(
  (id: Types.ObjectId) => id.toString() !== userId.toString()
);

await match.save()
};
