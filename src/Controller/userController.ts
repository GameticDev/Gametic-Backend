import mongoose from "mongoose";
import asyncHandler from "../Middleware/asyncHandler";
import { Request, Response} from 'express';
import { RegisterUserInput } from "../Type/user";
import { registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";

export const registerUser  = async (req: Request<{}, {}, RegisterUserInput>, res: Response) => {
    const { username, email, password } = req.body;
  const { error }: { error?: ValidationError } = registerValidation.validate({
    username,
    email,
    password,
  });
  
  if(error){
    return res.status(400).json({ message: 'User already exists with this email.'})
  }

 const User = await 
}
