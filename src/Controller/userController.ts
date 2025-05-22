import { Request, Response } from "express";
import { RegisterUserInput, UserPayload } from "../Type/user";
import { loginValidation, registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";
import asyncHandler from "../Middleware/asyncHandler";
import {
  loginService,
  registerUserService,
  logoutService,
} from "../Service/userService";
import { CustomError } from "../utils/customError";
import User from "../Model/userModel";
import crypto from "crypto";
import { sendOtp } from "../utils/sentEmail";
import { OAuth2Client } from "google-auth-library";
import { generateRefreshToken, generateToken } from "../utils/generateToken";

export const registerUser = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response
  ): Promise<void> => {
    const { username, email, password, role } = req.body;

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

    const user = await registerUserService({
      username,
      email,
      password,
      role,
      picture: "",
      sign: "",
    });

    res.status(201).json({
      message: ` User ${username} registered successfully!`,
      user,
    });
  }
);

export const loginUser = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response
  ): Promise<void> => {
    const { email, password } = req.body;
    const { error }: { error?: ValidationError } = loginValidation.validate({
      email,
      password,
    });
    if (error) throw new CustomError(error.details[0].message, 400);

    const { accessToken, refreshToken, user } = await loginService({
      email,
      password,
    });

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

export const logOut = asyncHandler(async (req, res) => {
  await logoutService();

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

  res.status(200).json({ message: "user logout successfully" });
});

export const generateOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;


    const otp = crypto.randomInt(100000, 999999).toString();

    await sendOtp(email, otp);

    res.status(201).json({ message: "OTP sent to email" });
  }
); 

export const verifyOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (
      user.otp !== otp ||
      !user.expiresAt ||
      user.expiresAt.getTime() < Date.now()
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.otp = "";
    user.expiresAt = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  }
);

export const googleAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log("controller in google auth...");
    console.log("Request body:", req.body);

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const { credential } = req.body;

    if (!credential) {
      console.log("No credential provided");
      res.status(400).json({ message: "Google credential is required" });
      return;
    }
    res.cookie('test', 'hello', { httpOnly: false });

    try {
      console.log("Verifying id_token...");
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        console.log("No email in payload");
        res.status(400).json({ message: "Invalid Google token payload" });
        return;
      }

      const { email, picture, name } = payload;
      console.log("Google fetched payload:", { email, name, picture });

      const user = await registerUserService({
        username: name || "Google User",
        email: email || "default@example.com",
        role: "user",
        password: "",
        picture: picture || "",
        sign: "google",
      });

      console.log("Google user created:", user);

      const userRole: "user" | "owner" | "admin" = user.role ?? "user";
      const userEmail: string = user.email ?? "default@example.com";
      const userUsername: string = user.username ?? "Google User";

      const tokenPayload: UserPayload = {
        _id: user.id,
        email: userEmail,
        role: userRole,
        picture: user.picture ?? "",
        username: userUsername,
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      console.log(accessToken)
      console.log(refreshToken)

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

      res.status(201).json({
        message: "Google Auth successful",
        user
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(401).json({ message: "Invalid or expired Google token" });
    }
  }
);
