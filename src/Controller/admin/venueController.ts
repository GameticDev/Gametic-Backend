import { Request, Response } from "express";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import Turff from "../../Model/turfModel";

export const getAllVenues = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;
    const turfType = req.query.type as string | undefined;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    const query: Partial<{
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
      turfType: string;
    }> = {};


    if (turfType) {
      query.turfType = turfType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { turfType: { $regex: search, $options: "i" } },
      ];
    }

    const totalVenues = await Turff.countDocuments(query);
    const totalActiveVenues = await Turff.countDocuments({
      ...query,
    });

    const venues = await Turff.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      message: "All Venues fetched successfully",
      venues,
      totalVenues,
      totalActiveVenues,
    });
  }
);
