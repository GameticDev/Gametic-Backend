import { Request, Response } from "express";
import { RegisterUserInput } from "../Type/user";
import { loginValidation, registerValidation } from "../utils/userValidation";
import { ValidationError } from "joi";
import asyncHandler from "../Middleware/asyncHandler";
import {
  loginService,
  googleRegister,
  logoutService,
} from "../Service/userService";
import { CustomError } from "../utils/customError";
import User from "../Model/userModel";
import crypto from "crypto";
import { sendOtp } from "../utils/sentEmail";
import OtpModel from "../Model/otpModal"
const { OAuth2Client } = require("google-auth-library");

// export const registerUser = asyncHandler(
//   async (
//     req: Request<{}, {}, RegisterUserInput>,
//     res: Response
//   ): Promise<void> => {
//     const { username, email, password, role } = req.body;

//     const { error }: { error?: ValidationError } = registerValidation.validate({
//       username,
//       email,
//       password,
//       role,

//     });

//     if (error) {
//       res.status(400).json({ message: error.details[0].message });
//       return;
//     }

//     const user = await googleRegister({ username, email, password, role , picture :"" , sing : ""  });

//     res.status(201).json({
//       message: ` User ${username} registered successfully!`,
//       user,
//     });
//   }
// );

const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};


export const emailVerification = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError("User already exists");
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await sendOtp(email, otp);

    // Remove any existing OTPs for this email before saving new one
    await OtpModel.deleteMany({ email });

    await OtpModel.create({ email, otp, expiresAt });

    res.status(201).json({ message: "OTP sent to email" });
  }
);

export const verifyOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    console.log(typeof otp , email ,"asdfghjkl;sdfghj");
    
    const existingOtp = await OtpModel.findOne({ email });

    if (!existingOtp) {
      res.status(400).json({ message: "No OTP request found" });
      return;
    }

    if (Date.now() > existingOtp.expiresAt.getTime()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    if (existingOtp.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    await OtpModel.deleteOne({ email });

    res.status(200).json({ message: "OTP verified successfully" });
  }
);




export const registerUser = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserInput>,
    res: Response
  ): Promise<void> => {
    const { email, username, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
       res.status(400).json({ message: "User already exists" });
    }

    const newUser = await googleRegister({
      email,
      username,
      password ,
      picture : "",
      role : "",
      sing : "",
    });

    res.status(201).json({ message: "User registered successfully", });
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

// export const generateOtp = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       res.status(400).json({
//         message: "User not found",
//       });
//       return;
//     }

//     const otp = crypto.randomInt(100000, 999999).toString();
//     user.otp = otp;
//     user.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
//     await user.save();

//     await sendOtp(email, otp);

//     res.status(201).json({ message: "OTP sent to email" });
//   }
// );

// export const verifyOtp = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       res.status(400).json({ message: "User not found" });
//       return;
//     }

//     if (
//       user.otp !== otp ||
//       !user.expiresAt ||
//       user.expiresAt.getTime() < Date.now()
//     ) {
//       res.status(400).json({ message: "Invalid dd or expired OTP" });
//       return;
//     }

//     user.otp = "";
//     user.expiresAt = null;
//     await user.save();

//     res.status(200).json({ message: "OTP verified successfully" });
//   }
// );

export const googleAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log("controller in google auth..............");

    // console.log("req.body", req.body);

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const body = req.body;

    if (!body) {
      res.status(404).json({ message: "Body not found" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Get payload from verified token
    const payload = ticket.getPayload();

    // Now we can trust this data as it's verified by Google
    const { email, picture, name } = payload;

    console.log("google fetched payload", email);

    const user = await googleRegister({
      username: name,
      email,
      role: "user",
      password: "",
      picture,
      sing: "google",
    });

    console.log("google user created ", user);

    res.status(201).json({ message: "Googe Auth done", data: user });
    return;
  }
);
