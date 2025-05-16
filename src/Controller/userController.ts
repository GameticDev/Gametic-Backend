import { Request, Response } from "express";
import { RegisterUserInput } from "../Type/user";
import { loginValidation, registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";
import asyncHandler from "../Middleware/asyncHandler";
import { loginService, registerUserSarvice , logoutService } from "../Service/userService";
import { CustomError } from "../utils/customError";
import User from "../Model/userModel";
import crypto from "crypto";
import {sendOtp} from '../utils/sentEmail'

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response): Promise<void> => {
    const { username, email, password , role} = req.body;

    const { error }: { error?: ValidationError } = registerValidation.validate({
      username,
      email,
      password,
      role,
    });

    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const user = await registerUserSarvice({ username, email, password , role });

    res.status(201).json({
      message: ` User ${username} registered successfully!`,
      user,
    });
  }
);


export const loginUser = asyncHandler(async (req: Request<{}, {}, RegisterUserInput>, res: Response): Promise<void> => {
    const  { email , password } =  req.body;
    const {error}: { error?: ValidationError } = loginValidation.validate({
        email , password
    })
    if (error) throw new CustomError(error.details[0].message, 400);

    const { accessToken, refreshToken, user } =  await loginService({email , password})

    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge:  50 * 60 * 1000, 
    path: "/",
    sameSite: "none",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: "/",
    sameSite: "none",
  });
    res.status(200).json({
    message: `Login successful! Welcome back,`,
    user,
  });
})


export const logOut = asyncHandler(async (req,res) => {
   
  await logoutService()

    res.clearCookie('accessToken',{
    httpOnly:true,
    secure:true,
    sameSite:'none',
    path:'/'
  })

  res.clearCookie('refreshToken',{
    httpOnly:true,
    secure:true,
    sameSite:'none',
    path:'/'
  })

  res.status(200).json({message : "user logout successfully"})
})






export const generateOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({
      message: 'User not found',
    });
    return;
  }

const otp = crypto.randomInt(100000, 999999).toString();
user.otp = otp;
user.expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
await user.save();


  await sendOtp(email, otp);

  res.status(201).json({ message: 'OTP sent to email' });
});




export const verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }

if (user.otp !== otp || !user.expiresAt || user.expiresAt.getTime() < Date.now()) {
  res.status(400).json({ message: 'Invalid or expired OTP' });
  return;
}

  user.otp = '';
  user.expiresAt = null
  await user.save();

  res.status(200).json({ message: 'OTP verified successfully' });
});

