import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { CustomError } from "../utils/customError"; // Adjust path as needed

const manageError: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(err);

  if (err instanceof CustomError) {
    res.status(err.statusCode || 404).json({
      status: "fail",
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    status: "fail",
    message: err instanceof Error ? err.message : "Internal Server Error",
  });
};

export default manageError;