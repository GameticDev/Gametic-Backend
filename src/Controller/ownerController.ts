import { Request, Response } from "express";
import asyncHandler from "../Middleware/asyncHandler";
import { CustomError } from "../utils/customError";
import { deleteTurfService, editTurfService, turfService } from "../Service/ownerService";
import Turff from "../Model/turfModel";

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


export const deleteTurf=asyncHandler(async(req:Request,res:Response)=>{
    const{id}=req.params;
    if(!id){
        throw new CustomError("id not found",404)
    }
    const Turf=await deleteTurfService(id)

    return res.status(200).json({
        message:"Turf deleted successfully",
        Turf
    })
})


export const editTurf=asyncHandler(async(req:Request,res:Response)=>{
    const data=req.body;

    const{id}=req.params;
    
if(!data||!id){
        throw new CustomError("data or id not found",404)
    }
    const turf=await editTurfService(id,data)

    return res.status(200).json({
        message:"Turf Edited successfully",
        turf
    })
})

export const turfById=asyncHandler(async(req:Request,res:Response)=>{

    const{id}=req.params;
    if(!id){
        throw new CustomError("id not found",404)
    }
    const Turf=await Turff.findById(id)
    return res.status(200).json({
        message:"single turff fetched successfully",
        Turf
    })
})


export const getAllturf=asyncHandler(async(req:Request,res:Response)=>{
    
    const allTurf=await Turff.find()

    return res.status(200).json({
        message:"All Turff details fetched successfully",
        allTurf
    })
})