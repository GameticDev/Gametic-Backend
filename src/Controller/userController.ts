import { Request, Response } from "express";
import { RegisterUserInput } from "../Type/user";

import { loginValidation, registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";
import asyncHandler from "../Middleware/asyncHandler";
import { loginService, registerUserSarvice } from "../Service/userService";
import { CustomError } from "../utils/customError";

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response): Promise<void> => {
    const { username, email, password , role} = req.body;

import { registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";
import asyncHandler from "../Middleware/asyncHandler";
import { registerUserSarvice } from "../Service/userService";

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response): Promise<void> => {
    const { username, email, password } = req.body;


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

    const user = await registerUserSarvice({ username, email, password });

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
    maxAge: 3 * 24 * 60 * 60 * 1000, 
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

