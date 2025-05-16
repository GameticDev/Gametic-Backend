import { Request, Response } from "express";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import User from "../Model/userModel";
import {
  deleteUserService,
  toggleBlockUser,
  updateUser,
} from "../Service/adminServices";

export const getAllUsers = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const totalusers = await User.countDocuments();
    const totalActiveUser = await User.countDocuments({ isBlocked: false });
    const totalBannedUsers = await User.countDocuments({ isBlocked: true });
    const users = await User.find({ role: { $ne: "admin" } })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      message: "All Users fetched succesfully",
      users,
      totalusers,
      totalBannedUsers,
      totalActiveUser,
    });
  }
);

export const updateUsers = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const updateData = req.body;
    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isBlocked: updatedUser.isBlocked,
      },
    });
  }
);

export const blockUser = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const updatedUser = await toggleBlockUser(userId);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: `User ${
        updatedUser.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        isBlocked: updatedUser.isBlocked,
      },
    });
  }
);

export const deleteUser = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const deletedUser = await deleteUserService(userId);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  }
);
