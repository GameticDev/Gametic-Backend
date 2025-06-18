import mongoose from "mongoose";
import { Booking } from "../Model/bookingModel";
import Match from "../Model/matchPostModel";
import Turff from "../Model/turfModel";
import User, { IUserDocument } from "../Model/userModel";
import {
  RegisterUserInput,
  LoginUserInput,
  UserPayload,
  UpdateUserData,
} from "../Type/user";
import { CustomError } from "../utils/customError";
import { generateToken, generateRefreshToken } from "../utils/generateToken";

// Register User
export const registerUserService = async ({
  username,
  email,
  password,
  role,
  picture,
  sign,
}: RegisterUserInput): Promise<Partial<IUserDocument>> => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    if (sign === "google" && existingUser.sign === "google") {
      return {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        picture: existingUser.picture,
        role: existingUser.role,
        sign: existingUser.sign,
      };
    }
    throw new CustomError("User already exists with this email", 400);
  }

  const userData: Partial<IUserDocument> = {
    username,
    email: email.toLowerCase(),
    role,
    picture,
    sign,
  };

  if (sign !== "google") {
    userData.password = password;
  }

  const user = await User.create(userData);

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    picture: user.picture,
    role: user.role,
    sign: user.sign,
  };
};

// Login User
export const loginService = async ({ email, password }: LoginUserInput) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.isBlocked) {
    throw new CustomError(
      "Your account is blocked. Please contact Admin for assistance.",
      403
    );
  }

  if (user.sign === "google") {
    throw new CustomError(
      "This account is linked to Google. Please sign in using your Google account.",
      400
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new CustomError("Invalid password", 401);
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

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      picture: user.picture || "",
    },
  };
};

// Logout Service
export const logoutService = () => {
  return true;
};

// Update User
export const updateUserService = async (
  userId: string,
  data: UpdateUserData,
  file?: Express.Multer.File
) => {
  const user = await User.findById(userId);
  if (!user) return "User not found";

  if (data.username) user.username = data.username;
  if (data.password) user.password = data.password;
  if (file?.path) user.picture = file.path;

  await user.save();
  return user;
};

// Get Logged-In User Details
export const getLoginedUserDetails = async (id: string) => {
  const user = await User.findById(id).select(
    "_id email username picture role preferredLocation"
  );

  if (!user) {
    throw new CustomError("user not found", 404);
  }

  const joinedOnlyMatches = await Match.find({
    joinedPlayers: id,
    userId: { $ne: id },
  })
    .populate("userId", "username email")
    .populate("joinedPlayers", "username email");

  const hostedMatches = await Match.find({
    userId: id,
  })
    .populate("userId", "username email")
    .populate("joinedPlayers", "username email");

  const bookings = await Turff.aggregate([
      {
        $match: {
          "bookings.userId": new mongoose.Types.ObjectId(id),
          "bookings.bookingType": "normal",
        },
      },
      { $unwind: "$bookings" },
      {
        $match: {
          "bookings.userId": new mongoose.Types.ObjectId(id),
          "bookings.bookingType": "normal",
        },
      },
      {
        $project: {
          _id: "$bookings._id",
          userId: "$bookings.userId",
          date: "$bookings.date",
          startTime: "$bookings.startTime",
          endTime: "$bookings.endTime",
          status: "$bookings.status",
          paymentStatus: "$bookings.paymentStatus",
          amount: "$bookings.amount",
          createdAt: "$bookings.createdAt",
          bookingType: "$bookings.bookingType",
          paymentId: "$bookings.paymentId",
          turf: {
            _id: "$_id",
            name: "$name",
            city: "$city",
            area: "$area",
            location: "$location",
            turfType: "$turfType",
          },
        },
      },
    ]);


  return {
    user,
    hostedMatches,
    joinedOnlyMatches,
    bookings,
    preferredLocation: user.preferredLocation,
  };
};
