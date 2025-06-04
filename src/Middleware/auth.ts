import { verify, JwtPayload } from "jsonwebtoken";
import { NextFunction, Request } from "express";
import { CustomError } from "../utils/customError";
import { Response } from "express";


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}


interface CustomJwtPayload extends JwtPayload {
  userId: string;
  role: string;
}

const verifyUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies["accessToken"];

  if (!token) {
    return next(new CustomError("Unauthorized: No token provided", 401));
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const payload = verify(token, secret) as CustomJwtPayload;

    if (payload.role !== "user") {
      return next(new CustomError("Forbidden: User role required", 403));
    }

    // Attach user data to req.user
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return next(new CustomError("Unauthorized: Invalid token", 401));
  }
};

// Middleware to verify a user with 'admin' role
const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies["accessToken"]; // Consistent cookie name

  if (!token) {
    return next(new CustomError("Unauthorized: No token provided", 401));
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const payload = verify(token, secret) as CustomJwtPayload;

    if (payload.role !== "admin") {
      return next(new CustomError("Forbidden: Admin role required", 403));
    }

    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return next(new CustomError("Unauthorized: Invalid token", 401));
  }
};

// Middleware to verify a user with 'owner' role
const verifyOwner = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies["accessToken"]; // Consistent cookie name

  if (!token) {
    return next(new CustomError("Unauthorized: No token provided", 401));
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const payload = verify(token, secret) as CustomJwtPayload;

    if (payload.role !== "owner") {
      return next(new CustomError("Forbidden: Owner role required", 403));
    }

    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return next(new CustomError("Unauthorized: Invalid token", 401));
  }
};

export { verifyUser, verifyAdmin, verifyOwner };



// const verifyToken = (
//   requiredRole: "user" | "admin" | "owner"
// ): ((req: AuthenticatedRequest, res: Response, next: NextFunction) => void) => {
//   return (req, res, next) => {
//     const token = req.cookies["accessToken"];
//     if (!token) {
//       return next(new CustomError("Unauthorized: No token provided", 401));
//     }

//     try {
//       const secret = process.env.JWT_SECRET || "your-secret-key";
//       const payload = verify(token, secret) as CustomJwtPayload;

//       if (payload.role !== requiredRole) {
//         return next(
//           new CustomError(`Forbidden: ${requiredRole} role required`, 403)
//         );
//       }

//       req.user = { userId: payload.userId, role: payload.role };
//       next();
//     } catch (error) {
//       console.error("JWT verification failed:", error);
//       return next(new CustomError("Unauthorized: Invalid token", 401));
//     }
//   };
// };

// export const verifyUser = verifyToken("user");
// export const verifyAdmin = verifyToken("admin");
// export const verifyOwner = verifyToken("owner");
