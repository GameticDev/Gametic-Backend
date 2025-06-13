import { Request, Response } from "express";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import { matchPostService  , cancledMatchService} from "../Service/matchPostService";
import { CustomError } from "../utils/customError";
import Match from "../Model/matchPostModel";
import asyncHandler from "../Middleware/asyncHandler";
import { AuthenticatedRequest } from "../Middleware/auth";


export const addPost=asyncErrorhandler(async(req:Request,res:Response)=>{
    const data=req.body;

    if(!data){
        throw new CustomError("data not found",404)
    }
    const post=await matchPostService(data)
    return res.status(200).json({
        message:"new Match post created",
        post
    })
})


export const deletePost=asyncErrorhandler(async(req:Request,res:Response)=>{
    const{id}=req.params;
    if(!id){
        throw new CustomError("id is not defined",404)
    }
    const post=await Match.findByIdAndUpdate(id,{isDelete:true},{new:true})

    return res.status(400).json({
        message:"post deleted successfully",
        post
    })

})

export const getAllPost = asyncErrorhandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const total = await Match.countDocuments();
    const posts = await Match.find().skip(skip).limit(limit);

    return res.status(200).json({
        message: "All match posts fetched successfully",
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        posts,
    });
});


// export const getPostById=asyncErrorhandler(async(req:Request,res:Response)=>{
//     const {id}=req.params
//     if(!id){
//         throw new CustomError("id is missing")
//     }

//     const post=await Match.findById(id)
//     return res.status(200).json({
//         message:"post fetched successfully",
//         post
//     })
// })

export const getPostById = asyncErrorhandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate("userId", "name avatar")
    .populate("joinedPlayers", "name avatar")
    .populate("turfId", "name location");

  if (!match) throw new CustomError("Match post not found", 404);

  res.status(200).json({ match });
});

export const joinMatchPost = asyncErrorhandler(async (req, res) => {
  const userId = req.body.userId;
  const match = await Match.findById(req.params.id);

  if (!match) throw new CustomError("Match not found", 404);

  // Check if already joined
  const alreadyJoined = match.joinedPlayers.includes(userId);

  if (alreadyJoined) {
    throw new CustomError("You have already joined this match", 400);
  }

  // Check if full
  if (match.joinedPlayers.length >= match.maxPlayers) {
    match.status = "full";
    await match.save();
    throw new CustomError("Match is already full", 400);
  }

  // Join match
  match.joinedPlayers.push(userId);

  // Update status if now full
  if (match.joinedPlayers.length === match.maxPlayers) {
    match.status = "full";
  }

  await match.save();

  res.status(200).json({ message: "Successfully joined match", joinedPlayers: match.joinedPlayers });
});

// export const cancelMatch =  asyncErrorhandler(async (req : AuthenticatedRequest, res) => {
//   const matchId = req.params 
//   const userId = req.user?.userId

//   await cancledMatchService(matchId , userId)
//   res.status(200).json({
//     message : "Successfully cancelled your participation"
//   })
// })