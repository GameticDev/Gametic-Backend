import { NextFunction, Request, Response } from "express";
import { RegisterUserInput, UserPayload } from "../../Type/user";
import { ValidationError } from "joi";
import { loginValidation } from "../../utils/userValidation";
import { CustomError } from "../../utils/customError";
import asyncHandler from "../../Middleware/asyncHandler";
import { generateRefreshToken, generateToken } from "../../utils/generateToken";
import User from "../../Model/userModel";

export const loginAdmin = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;
    const { error }: { error?: ValidationError } = loginValidation.validate({
      email,
      password,
    });
    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    if (user.role === "user") {
      return next(new CustomError("invalid email address", 403));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new CustomError("Invalid password", 401));
    }

    const payload: UserPayload = {
      _id: user._id.toString(),
      email: user.email,
      role: user?.role || "user",
      picture: user.picture || "",
      username: user.username,
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 50 * 60 * 1000,
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
  }
);
