import { NextFunction, Request, Response } from "express";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import { Locations, ILocation } from "../../Model/locationModel";
import { CustomError } from "../../utils/customError";

export const createLocation = asyncErrorhandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, code, state, headquarters } = req.body;
    const errors: string[] = [];

    if (!name) errors.push("District name is required");
    if (!code) errors.push("District code is required");
    if (!state) errors.push("State is required");
    if (!headquarters) errors.push("Headquarters is required");

    if (errors.length > 0) {
      return next(new CustomError(errors.join("; "), 400));
    }

    const locationData: Partial<ILocation> = {
      name,
      code,
      state,
      headquarters,
      isActive: req.body.isActive ?? true,
    };

    const location = await Locations.create(locationData);

    res.status(201).json({
      success: true,
      data: location,
      message: "Location created successfully",
    });
  }
);
