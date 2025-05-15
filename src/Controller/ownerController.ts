import { Request, Response } from "express";
import asyncHandler from "../Middleware/asyncHandler";
import { CustomError } from "../utils/customError";
import { turfService } from "../Service/ownerService";

export const createTurf=asyncHandler(async(req:Request,res:Response)=>{
    const data=req.body;
    const files=req.files as (Express.Multer.File & { path: string })[];
    if(!data||!files ){
        throw  new CustomError("data or file not found",404)
    }
      const imageUrls = files.map((file) => file.path);

    const Turf=await turfService(data,imageUrls)

    return res.status(200).json({
        message:"Turff added successfully",
        Turf
    })
})


// export const deleteTurf=asyncHandler(async(req:Request,res:Response)=>{
//     const{id}=req.params;
//     if(!id){
//         throw new CustomError("id not found",404)
//     }
    
// })