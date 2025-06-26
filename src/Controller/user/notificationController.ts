import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../Middleware/auth";
import Notification, {
  INotificationDocument,
} from "../../Model/notificationModel";
import { CustomError } from "../../utils/customError";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import mongoose from "mongoose";

export const getUserNotifications = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new CustomError("User not authenticated", 401));
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const notifications: INotificationDocument[] = await Notification.find({
      userId,
      createdAt: {
        $gte: sevenDaysAgo,
        $lte: now,
      },
    })
      .select("title message type matchId tournamentId isRead createdAt")
      .sort({ createdAt: -1 }) 
      .lean(); 

    res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
      totalNotifications: notifications.length,
    });
  }
);


export const markNotificationAsRead = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return next(new CustomError("User not authenticated", 401));
    }

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return next(new CustomError("Invalid notification ID", 400));
    }

    const notification: INotificationDocument | null = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return next(new CustomError("Notification not found or not authorized", 404));
    }

    if (notification.isRead) {
      return res.status(200).json({
        message: "Notification is already marked as read",
        notification,
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read successfully",
      notification,
    });
  }
);

export const markAllNotificationsAsRead = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new CustomError("User not authenticated", 401));
    }

    const updateResult = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: "All notifications marked as read successfully",
      modifiedCount: updateResult.modifiedCount,
    });
  }
);