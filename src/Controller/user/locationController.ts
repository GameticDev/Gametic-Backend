import { NextFunction, Request, Response } from "express";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import User from "../../Model/userModel";
import { CustomError } from "../../utils/customError";
import { Locations } from "../../Model/locationModel";
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string | undefined;
  };
}

interface LocationQuery {
  search?: string;
}
export const updatePreferredLocation = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { preferredLocation } = req.body;
    const user = req.user;

    if (!user) {
      return next(new CustomError("User not authenticated", 401));
    }
    console.log(user.role);

    if (user.role !== "user") {
      return next(
        new CustomError(
          "Only users with role 'user' can set preferred location",
          403
        )
      );
    }

    if (!preferredLocation || typeof preferredLocation !== "string") {
      return next(
        new CustomError("Preferred location must be a non-empty string", 400)
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { preferredLocation },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        preferredLocation: updatedUser.preferredLocation,
      },
    });
  }
);

// export const getLocations = asyncErrorhandler(
//   async (
//     req: Request<{}, {}, {}, LocationQuery>,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const search = req.query.search as string | undefined;

//     const query: Partial<{
//       $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
//       turfType: string;
//     }> = {};
//     if (search) {
//       query.$or = [{ name: { $regex: search, $options: "i" } }];
//     }

//     const totalLocations = await Locations.countDocuments(query);

//     const locations = await Locations.find(query)
//       .select("name state")
//       .sort({ name: 1 })
//       .lean();

//     if (!locations.length) {
//       return next(new CustomError("No locations found", 404));
//     }

//     return res.status(200).json({
//       message: "All locations fetched successfully",
//       locations: locations.map((loc) => ({
//         name: loc.name,
//         state: loc.state,
//       })),
//       totalLocations,
//     });
//   }
// );


export const getLocations = asyncErrorhandler(
  async (
    req: Request<{}, {}, {}, LocationQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const search = req.query.search as string | undefined;

    if (!search || search.trim() === "") {
      return res.status(200).json({
        message: "No search term provided",
        locations: [],
        totalLocations: 0,
      });
    }

    const query: Partial<{
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
      turfType: string;
    }> = {
      $or: [{ name: { $regex: search, $options: "i" } }],
    };

    const totalLocations = await Locations.countDocuments(query);

    const locations = await Locations.find(query)
      .select("name state")
      .sort({ name: 1 })
      .lean();

    if (!locations.length) {
      return next(new CustomError("No locations found", 404));
    }

    return res.status(200).json({
      message: "All locations fetched successfully",
      locations: locations.map((loc) => ({
        name: loc.name,
        state: loc.state,
      })),
      totalLocations,
    });
  }
);