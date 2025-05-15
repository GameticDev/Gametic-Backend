import { Request, Response } from "express";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import User from "../Model/userModel";
import { deleteUserService, toggleBlockUser, updateUser } from "../Service/adminServices";

export const getAllUsers = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const users = await User.find();

    return res.status(200).json({
      message: "All Users fetched succesfully",
      users,
    });
  }
);

export const updateUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isBlocked: updatedUser.isBlocked,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};

export const blockUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const deletedUser = await deleteUserService(userId);
    
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};