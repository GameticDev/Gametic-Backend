import { NextFunction, Request, Response } from "express";
import { RegisterUserInput, UserPayload } from "../Type/user";
import { loginValidation, registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";
import asyncHandler from "../Middleware/asyncHandler";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import {
  getLoginedUserDetails,
  loginService,
  registerUserService,
} from "../Service/userService";
import { CustomError } from "../utils/customError";
import User from "../Model/userModel";
import crypto from "crypto";
import { sendOtp } from "../utils/sentEmail";
import { OAuth2Client } from "google-auth-library";
import { generateRefreshToken, generateToken } from "../utils/generateToken";
import OtpModel from "../Model/otpModel";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string | undefined;
  };
}

export const registerUser = asyncErrorhandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, email, password, role } = req.body;

    const { error }: { error?: ValidationError } = registerValidation.validate({
      username,
      email,
      password,
      role,
    });

    if (error) {
      return next(new CustomError(error.details[0].message, 400));
    }

    const existingUser = await User.findOne({ $or: [{ username }] });
    if (existingUser) {
      return next(new CustomError("Username already exists", 400));
    }

    const user = await registerUserService({
      username,
      email,
      password,
      role,
      picture: "",
      sign: "local",
    });

    const tokenPayload: UserPayload = {
      _id: user.id,
      email: user.email || "",
      role: user.role || "user",
      picture: user.picture ?? "",
      username: user.username || "",
    };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

    res.status(201).json({
      message: `User ${username} registered successfully!`,
      user,
      role: user.role,
      accessToken,
      refreshToken,
    });
  }
);

export const loginUser = asyncErrorhandler(
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

    const { accessToken, refreshToken, user } = await loginService({
      email,
      password,
    });

    res.cookie("role", user.role, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login successful! Welcome back",
      user,
    });
  }
);

export const logOut = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({ message: "User logged out successfully" });
  }
);

export const emailVerification = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new CustomError("User already exists", 404));
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      await sendOtp(email, otp);
    } catch (error) {
      console.error("Error sending OTP:", error);
      return next(new CustomError("Failed to send OTP", 500));
    }

    await OtpModel.deleteMany({ email });
    await OtpModel.create({ email, otp, expiresAt });

    res.status(201).json({ message: "OTP sent to email" });
  }
);

export const verifyOtp = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, otp } = req.body;

    const existingOtp = await OtpModel.findOne({ email });
    if (!existingOtp) {
      return next(new CustomError("No email verification requested", 400));
    }

    if (Date.now() > existingOtp.expiresAt.getTime()) {
      return next(new CustomError("OTP expired", 400));
    }

    if (existingOtp.otp !== otp) {
      return next(new CustomError("Invalid OTP", 400));
    }

    await OtpModel.deleteOne({ email });

    res.status(200).json({ message: "OTP verified successfully" });
  }
);

export const googleAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ message: "Google credential is required" });
      return;
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        res.status(400).json({ message: "Invalid Google token payload" });
        return;
      }

      const { email, picture, name } = payload;

      const user = await registerUserService({
        username: name || "Google User",
        email: email || "default@example.com",
        role: "user",
        password: "",
        picture: picture || "",
        sign: "google",
      });

      const tokenPayload: UserPayload = {
        _id: user.id,
        email: user.email ?? "default@example.com",
        role: user.role ?? "user",
        picture: user.picture ?? "",
        username: user.username ?? "Google User",
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.cookie("role", user.role ?? "user", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
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

      res.status(201).json({
        message: "Google Auth successful",
        user,
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(401).json({ message: "Invalid or expired Google token" });
    }
  }
);

export const updateUser = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user?.userId;
    const { username, phone } = req.body;
    const file = req.file;

    if (!userId) {
      throw new CustomError("User not authenticated", 401);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID", 400);
    }

    const updateData: {
      picture?: string;
      username?: string;
      phone?: string;
    } = {};

    if (username) {
      if (typeof username !== "string" || username.trim().length < 3) {
        throw new CustomError(
          "Username must be a string with at least 3 characters",
          400
        );
      }
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new CustomError("Username is already taken", 400);
      }
      updateData.username = username.trim();
    }

    if (phone) {
      if (typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
        throw new CustomError(
          "Phone number must be a valid 10-digit number",
          400
        );
      }
      updateData.phone = phone;
    }

    if (file) {
      updateData.picture = file.path;
    }

    if (Object.keys(updateData).length === 0) {
      throw new CustomError("No valid fields provided for update", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      throw new CustomError("User not found", 404);
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        phone: updatedUser.phone,
        image: updatedUser.picture,
      },
    });
  }
);

export const LoginedUserDetails = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new CustomError("User not authenticated", 401);
    }

    const user = await getLoginedUserDetails(userId);

    res.status(200).json({
      user,
    });
  }
);