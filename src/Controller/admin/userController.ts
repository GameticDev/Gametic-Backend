import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../Middleware/asyncHandler";
import { CustomError } from "../../utils/customError";
import Turff from "../../Model/turfModel";
import Match from "../../Model/matchPostModel";

export const AdminAllBookingsAndMatches = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all matches (both hosted and joined)
    const allMatches = await Match.find({
      date: { $gte: today },
    })
      .populate("userId", "username email")
      .populate("joinedPlayers", "username email")
      .populate("turfId", "name");

    if (!allMatches || allMatches.length === 0) {
      throw new CustomError("No matches found", 404);
    }

    // Separate hosted and joined matches
    const hostedMatches = allMatches.filter(match => match.userId);
    const joinedMatches = allMatches.filter(match => match.joinedPlayers.length > 0);

    // Fetch all bookings
    const bookings = await Turff.aggregate([
      {
        $match: {
          "bookings.bookingType": "normal",
          "bookings.date": { $gte: today },
        },
      },
      { $unwind: "$bookings" },
      {
        $match: {
          "bookings.bookingType": "normal",
          "bookings.date": { $gte: today },
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

    if (!bookings || bookings.length === 0) {
      throw new CustomError("No bookings found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        hostedMatches,
        joinedMatches,
        bookings,
        totalBookings: bookings.length,
        totalMatches: allMatches.length,
      },
    });
  }
);