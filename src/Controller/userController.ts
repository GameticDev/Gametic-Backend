import { Request, Response } from "express";
import { RegisterUserInput } from "../Type/user";
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
    });

    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const user = await registerUserSarvice({ username, email, password });

    res.status(201).json({
      message: `🎉 User ${username} registered successfully!`,
      user,
    });
  }
);
