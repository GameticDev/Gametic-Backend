// import { Request, Response } from "express";
// import mongoose from "mongoose";
// import Turff, { TurffData } from "../../Model/turfModel";
// import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
// import Match, { MatchPost } from "../../Model/matchPostModel";
// import { Booking } from "../../Model/bookingModel";
// import Razorpay from "razorpay";
// import { configDotenv } from "dotenv";

// type TurfType =
//   | "football"
//   | "cricket"
//   | "multi-sport"
//   | "swimming"
//   | "basketball"
//   | "badminton"
//   | "tennis"
//   | "volleyball"
//   | "hockey";

// configDotenv();

// interface AuthenticatedRequest extends Request {
//   user?: {
//     userId: string;
//     role: string | undefined;
//   };
// }

// interface CreateMatchRequestBody {
//   userId: string;
//   title: string;
//   sports:
//     | "football"
//     | "cricket"
//     | "basketball"
//     | "badminton"
//     | "tennis"
//     | "volleyball"
//     | "hockey";
//   maxPlayers: number;
//   turfId: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   paymentPerPerson: number;
// }

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// const isValidTimeFormat = (time: string): boolean => {
//   const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//   return timeRegex.test(time);
// };

// const isSlotBooked = (
//   turf: TurffData,
//   date: string,
//   startTime: string,
//   endTime: string
// ): boolean => {
//   const bookedSlots = turf.bookedSlot.find((slot) => slot.date === date);
//   if (!bookedSlots) return false;

//   const requestedStart = new Date(`1970-01-01T${startTime}:00`);
//   const requestedEnd = new Date(`1970-01-01T${endTime}:00`);

//   return bookedSlots.slots.some((slot) => {
//     const slotStart = new Date(`1970-01-01T${slot.start}:00`);
//     const slotEnd = new Date(`1970-01-01T${slot.end}:00`);
//     return (
//       (requestedStart >= slotStart && requestedStart < slotEnd) ||
//       (requestedEnd > slotStart && requestedEnd <= slotEnd) ||
//       (requestedStart <= slotStart && requestedEnd >= slotEnd)
//     );
//   });
// };

// export const getAllMatches = asyncErrorhandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { page = "1", limit = "10", search = "" } = req.query;

//     const pageNum = parseInt(page as string, 10);
//     const limitNum = parseInt(limit as string, 10);

//     if (isNaN(pageNum) || pageNum < 1) {
//       res.status(400).json({ message: "Invalid page number" });
//       return;
//     }
//     if (isNaN(limitNum) || limitNum < 1) {
//       res.status(400).json({ message: "Invalid limit" });
//       return;
//     }

//     const query: any = {
//       status: { $in: ["open", "full"] },
//     };

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { sports: { $regex: search, $options: "i" } },
//         { "turfId.name": { $regex: search, $options: "i" } },
//         { "turfId.location": { $regex: search, $options: "i" } },
//       ];
//     }

//     const matches: MatchPost[] = await Match.find(query)
//       .populate("userId", "name username")
//       .populate("turfId", "name city area location")
//       .skip((pageNum - 1) * limitNum)
//       .limit(limitNum);

//     const totalMatches = await Match.countDocuments(query);

//     res.status(200).json({
//       message: "Matches retrieved successfully",
//       matches,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total: totalMatches,
//         totalPages: Math.ceil(totalMatches / limitNum),
//       },
//     });
//   }
// );

// export const getMatchById = asyncErrorhandler(
//   async (req: Request, res: Response) => {
//     const { matchId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(matchId)) {
//       res.status(400).json({ message: "Invalid match ID" });
//       return;
//     }

//     const match: MatchPost | null = await Match.findById(matchId)
//       .populate("userId", "name username")
//       .populate("turfId", "name location")
//       .populate("joinedPlayers", "name username");

//     if (!match) {
//       res.status(404).json({ message: "Match not found" });
//       return;
//     }

//     res.status(200).json({
//       message: "Match retrieved successfully",
//       match,
//     });
//   }
// );

// export const hostMatch = asyncErrorhandler(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const {
//       title,
//       sports,
//       maxPlayers,
//       turfId,
//       date,
//       startTime,
//       endTime,
//       paymentPerPerson,
//     } = req.body as CreateMatchRequestBody;

//     if (
//       !title ||
//       !sports ||
//       !maxPlayers ||
//       !turfId ||
//       !date ||
//       !startTime ||
//       !endTime ||
//       !paymentPerPerson
//     ) {
//       res.status(400).json({ message: "All fields are required" });
//       return;
//     }

//     if (!mongoose.Types.ObjectId.isValid(turfId)) {
//       res.status(400).json({ message: "Invalid turf ID" });
//       return;
//     }

//     if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
//       res.status(400).json({ message: "Invalid time format. Use HH:MM" });
//       return;
//     }

//     if (isNaN(Date.parse(date))) {
//       res.status(400).json({ message: "Invalid date format" });
//       return;
//     }

//     if (maxPlayers < 1) {
//       res.status(400).json({ message: "Maximum players must be at least 1" });
//       return;
//     }

//     if (paymentPerPerson < 0) {
//       res
//         .status(400)
//         .json({ message: "Payment per person cannot be negative" });
//       return;
//     }

//     const turf = await Turff.findOne({
//       _id: turfId,
//       status: "active",
//       isDelete: false,
//     });
//     if (!turf) {
//       res.status(404).json({ message: "Turf not found or inactive" });
//       return;
//     }

//     if (turf.turfType !== sports && turf.turfType !== "multi-sport") {
//       res.status(400).json({ message: "Sports type does not match turf type" });
//       return;
//     }

//     if (isSlotBooked(turf, date, startTime, endTime)) {
//       res.status(400).json({ message: "Requested slot is already booked" });
//       return;
//     }

//     const userId = req.user?.userId;
//     if (!userId) {
//       res.status(401).json({ message: "User not authenticated" });
//       return;
//     }

//     const amount = turf.hourlyRate;

//     // Create new booking for the match
//     const newBooking: Booking = {
//       userId: new mongoose.Types.ObjectId(userId),
//       date: new Date(date),
//       startTime,
//       endTime,
//       status: "pending",
//       paymentStatus: "pending",
//       amount,
//       createdAt: new Date(),
//       bookingType: "host",
//     } as Booking;

//     turf.bookings.push(newBooking);

//     const bookedSlotIndex = turf.bookedSlot.findIndex(
//       (slot) => slot.date === date
//     );
//     if (bookedSlotIndex >= 0) {
//       turf.bookedSlot[bookedSlotIndex].slots.push({
//         start: startTime,
//         end: endTime,
//       });
//     } else {
//       turf.bookedSlot.push({
//         date,
//         slots: [{ start: startTime, end: endTime }],
//       });
//     }

//     const newMatch: MatchPost = new Match({
//       userId,
//       title,
//       sports,
//       maxPlayers,
//       joinedPlayers: [userId],
//       turfId,
//       date: new Date(date),
//       startTime,
//       endTime,
//       paymentPerPerson,
//       location: turf.location,
//       status: maxPlayers === 1 ? "full" : "open",
//     });

//     await Promise.all([newMatch.save(), turf.save()]);

//     res.status(201).json({
//       message: "Match created and venue booked successfully",
//       match: newMatch,
//       booking: newBooking,
//     });
//   }
// );

// export const joinMatch = asyncErrorhandler(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { matchId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(matchId)) {
//       res.status(400).json({ message: "Invalid match ID" });
//       return;
//     }

//     const userId = req.user?.userId;
//     if (!userId) {
//       res.status(401).json({ message: "User not authenticated" });
//       return;
//     }

//     const match = await Match.findById(matchId);
//     if (!match) {
//       res.status(404).json({ message: "Match not found" });
//       return;
//     }

//     if (match.status !== "open") {
//       res.status(400).json({ message: "Match is not open for joining" });
//       return;
//     }

//     if (match.joinedPlayers.some((player) => player.equals(userId))) {
//       res.status(400).json({ message: "User has already joined this match" });
//       return;
//     }

//     if (match.joinedPlayers.length >= match.maxPlayers) {
//       res.status(400).json({ message: "Match is full" });
//       return;
//     }
//     const userObjectId = new mongoose.Types.ObjectId(userId);
//     match.joinedPlayers.push(userObjectId);

//     if (match.joinedPlayers.length === match.maxPlayers) {
//       match.status = "full";
//     }

//     await match.save();

//     res.status(200).json({ message: "Successfully joined the match", match });
//   }
// );

// export const getVenueBySports = asyncErrorhandler(
//   async (req: Request, res: Response) => {
//     const { sportType } = req.query;

//     if (!sportType || typeof sportType !== 'string') {
//       return res.status(400).json({
//         success: false,
//         error: 'Sport type is required and must be a string',
//       });
//     }

//     const validTypes: TurfType[] = [
//       'football',
//       'cricket',
//       'multi-sport',
//       'swimming',
//       'basketball',
//       'badminton',
//       'tennis',
//       'volleyball',
//       'hockey',
//     ];
//     if (!validTypes.includes(sportType as TurfType)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid sport type',
//       });
//     }

//     // Fetch turfs
//     const turfs: TurffData[] = await Turff.find({
//       turfType: sportType,
//       status: 'active',
//       isDelete: false,
//     }).select('name city area location images hourlyRate averageRating bookedSlot');

//     if (turfs.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: 'No turfs found for the specified sport type',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: turfs,
//     });
//   }
// );



import { Request, Response } from "express";
import mongoose from "mongoose";
import Turff, { TurffData } from "../../Model/turfModel";
import { asyncErrorhandler } from "../../Middleware/asyncErrorHandler";
import Match, { MatchPost } from "../../Model/matchPostModel";
import { Booking } from "../../Model/bookingModel";
import Razorpay from "razorpay";
import crypto from "crypto";
import { configDotenv } from "dotenv";

type TurfType =
  | "football"
  | "cricket"
  | "multi-sport"
  | "swimming"
  | "basketball"
  | "badminton"
  | "tennis"
  | "volleyball"
  | "hockey";

configDotenv();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string | undefined;
  };
}

interface CreateMatchRequestBody {
  userId: string;
  title: string;
  sports:
    | "football"
    | "cricket"
    | "basketball"
    | "badminton"
    | "tennis"
    | "volleyball"
    | "hockey";
  maxPlayers: number;
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  paymentPerPerson: number;
}

interface PaymentVerificationBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  matchId?: string;
  bookingId?: string;
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

const isSlotBooked = (
  turf: TurffData,
  date: string,
  startTime: string,
  endTime: string
): boolean => {
  const bookedSlots = turf.bookedSlot.find((slot) => slot.date === date);
  if (!bookedSlots) return false;

  const requestedStart = new Date(`1970-01-01T${startTime}:00`);
  const requestedEnd = new Date(`1970-01-01T${endTime}:00`);

  return bookedSlots.slots.some((slot) => {
    const slotStart = new Date(`1970-01-01T${slot.start}:00`);
    const slotEnd = new Date(`1970-01-01T${slot.end}:00`);
    return (
      (requestedStart >= slotStart && requestedStart < slotEnd) ||
      (requestedEnd > slotStart && requestedEnd <= slotEnd) ||
      (requestedStart <= slotStart && requestedEnd >= slotEnd)
    );
  });
};

// Create Razorpay order for hosting a match
export const createHostingOrder = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      sports,
      maxPlayers,
      turfId,
      date,
      startTime,
      endTime,
      paymentPerPerson,
    } = req.body as CreateMatchRequestBody;

    // Validation (same as before)
    if (
      !title ||
      !sports ||
      !maxPlayers ||
      !turfId ||
      !date ||
      !startTime ||
      !endTime ||
      !paymentPerPerson
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(turfId)) {
      res.status(400).json({ message: "Invalid turf ID" });
      return;
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      res.status(400).json({ message: "Invalid time format. Use HH:MM" });
      return;
    }

    if (isNaN(Date.parse(date))) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (maxPlayers < 1) {
      res.status(400).json({ message: "Maximum players must be at least 1" });
      return;
    }

    if (paymentPerPerson < 0) {
      res
        .status(400)
        .json({ message: "Payment per person cannot be negative" });
      return;
    }

    const turf = await Turff.findOne({
      _id: turfId,
      status: "active",
      isDelete: false,
    });
    if (!turf) {
      res.status(404).json({ message: "Turf not found or inactive" });
      return;
    }

    if (turf.turfType !== sports && turf.turfType !== "multi-sport") {
      res.status(400).json({ message: "Sports type does not match turf type" });
      return;
    }

    if (isSlotBooked(turf, date, startTime, endTime)) {
      res.status(400).json({ message: "Requested slot is already booked" });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const amount = turf.hourlyRate;

    // Create Razorpay order
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: `host_${Date.now()}`,
        notes: {
          userId,
          turfId,
          title,
          sports,
          date,
          startTime,
          endTime,
          maxPlayers: maxPlayers.toString(),
          paymentPerPerson: paymentPerPerson.toString(),
          type: "hosting"
        },
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        order,
        amount,
        currency: "INR",
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  }
);

// Create Razorpay order for joining a match
export const createJoinOrder = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      res.status(400).json({ message: "Invalid match ID" });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }

    if (match.status !== "open") {
      res.status(400).json({ message: "Match is not open for joining" });
      return;
    }

    if (match.joinedPlayers.some((player) => player.equals(userId))) {
      res.status(400).json({ message: "User has already joined this match" });
      return;
    }

    if (match.joinedPlayers.length >= match.maxPlayers) {
      res.status(400).json({ message: "Match is full" });
      return;
    }

    const amount = match.paymentPerPerson;

    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: `join_${matchId}_${Date.now()}`,
        notes: {
          userId,
          matchId,
          type: "joining"
        },
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        order,
        amount,
        currency: "INR",
        key_id: process.env.RAZORPAY_KEY_ID,
        match: {
          title: match.title,
          sports: match.sports,
          date: match.date,
          startTime: match.startTime,
          endTime: match.endTime,
        }
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  }
);

// Verify payment and complete joining
export const verifyJoinPayment = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      matchId,
    } = req.body as PaymentVerificationBody;

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: "Invalid payment signature" });
      return;
    }

    try {
      const match = await Match.findById(matchId);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      if (match.status !== "open") {
        res.status(400).json({ message: "Match is not open for joining" });
        return;
      }

      if (match.joinedPlayers.some((player) => player.equals(userId))) {
        res.status(400).json({ message: "User has already joined this match" });
        return;
      }

      if (match.joinedPlayers.length >= match.maxPlayers) {
        res.status(400).json({ message: "Match is full" });
        return;
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      match.joinedPlayers.push(userObjectId);

      if (match.joinedPlayers.length === match.maxPlayers) {
        match.status = "full";
      }

      await match.save();

      res.status(200).json({ 
        success: true,
        message: "Payment verified and successfully joined the match", 
        match 
      });
    } catch (error) {
      console.error("Error verifying join payment:", error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  }
);

// Keep your existing functions
export const getAllMatches = asyncErrorhandler(
  async (req: Request, res: Response): Promise<void> => {
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({ message: "Invalid page number" });
      return;
    }
    if (isNaN(limitNum) || limitNum < 1) {
      res.status(400).json({ message: "Invalid limit" });
      return;
    }

    const query: any = {
      status: { $in: ["open", "full"] },
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { sports: { $regex: search, $options: "i" } },
        { "turfId.name": { $regex: search, $options: "i" } },
        { "turfId.location": { $regex: search, $options: "i" } },
      ];
    }

    const matches: MatchPost[] = await Match.find(query)
      .populate("userId", "name username")
      .populate("turfId", "name city area location")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalMatches = await Match.countDocuments(query);

    res.status(200).json({
      message: "Matches retrieved successfully",
      matches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalMatches,
        totalPages: Math.ceil(totalMatches / limitNum),
      },
    });
  }
);

export const getMatchById = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      res.status(400).json({ message: "Invalid match ID" });
      return;
    }

    const match: MatchPost | null = await Match.findById(matchId)
      .populate("userId", "name username")
      .populate("turfId", "name location")
      .populate("joinedPlayers", "name username");

    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }

    res.status(200).json({
      message: "Match retrieved successfully",
      match,
    });
  }
);

export const getVenueBySports = asyncErrorhandler(
  async (req: Request, res: Response) => {
    const { sportType } = req.query;

    if (!sportType || typeof sportType !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Sport type is required and must be a string',
      });
    }

    const validTypes: TurfType[] = [
      'football',
      'cricket',
      'multi-sport',
      'swimming',
      'basketball',
      'badminton',
      'tennis',
      'volleyball',
      'hockey',
    ];
    if (!validTypes.includes(sportType as TurfType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sport type',
      });
    }

    const turfs: TurffData[] = await Turff.find({
      turfType: sportType,
      status: 'active',
      isDelete: false,
    }).select('name city area location images hourlyRate averageRating bookedSlot');

    if (turfs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No turfs found for the specified sport type',
      });
    }

    return res.status(200).json({
      success: true,
      data: turfs,
    });
  }
);

export const hostMatch = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      sports,
      maxPlayers,
      turfId,
      date,
      startTime,
      endTime,
      paymentPerPerson,
    } = req.body as CreateMatchRequestBody;
    console.log(req.body)

    if (
      !title ||
      !sports ||
      !maxPlayers ||
      !turfId ||
      !date ||
      !startTime ||
      !endTime ||
      !paymentPerPerson
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(turfId)) {
      res.status(400).json({ message: "Invalid turf ID" });
      return;
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      res.status(400).json({ message: "Invalid time format. Use HH:MM" });
      return;
    }

    if (isNaN(Date.parse(date))) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (maxPlayers < 1) {
      res.status(400).json({ message: "Maximum players must be at least 1" });
      return;
    }

    if (paymentPerPerson < 0) {
      res
        .status(400)
        .json({ message: "Payment per person cannot be negative" });
      return;
    }

    const turf = await Turff.findOne({
      _id: turfId,
      status: "active",
      isDelete: false,
    });
    if (!turf) {
      res.status(404).json({ message: "Turf not found or inactive" });
      return;
    }

    if (turf.turfType !== sports && turf.turfType !== "multi-sport") {
      res.status(400).json({ message: "Sports type does not match turf type" });
      return;
    }

    if (isSlotBooked(turf, date, startTime, endTime)) {
      res.status(400).json({ message: "Requested slot is already booked" });
      return;
    }

    // Get user ID from authenticated user (assuming auth middleware)
    const userId = req.user?.userId; // Adjust based on your auth middleware
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const amount = turf.hourlyRate;

    // Create new booking for the match
    const newBooking: Booking = {
      userId: new mongoose.Types.ObjectId(userId),
      date: new Date(date),
      startTime,
      endTime,
      status: "pending",
      paymentStatus: "paid",
      amount,
      createdAt: new Date(),
      bookingType: "host",
    } as Booking;

    turf.bookings.push(newBooking);

    const bookedSlotIndex = turf.bookedSlot.findIndex(
      (slot) => slot.date === date
    );
    if (bookedSlotIndex >= 0) {
      turf.bookedSlot[bookedSlotIndex].slots.push({
        start: startTime,
        end: endTime,
      });
    } else {
      turf.bookedSlot.push({
        date,
        slots: [{ start: startTime, end: endTime }],
      });
    }

    const newMatch: MatchPost = new Match({
      userId,
      title,
      sports,
      maxPlayers,
      joinedPlayers: [userId],
      turfId,
      date: new Date(date),
      startTime,
      endTime,
      paymentPerPerson,
      location: turf.location,
      status: maxPlayers === 1 ? "full" : "open",
    });

    await Promise.all([newMatch.save(), turf.save()]);

    res
      .status(201)
      .json({
        message: "Match created and venue booked successfully",
        match: newMatch,
        booking: newBooking,
      });
  }
);


export const joinMatch = asyncErrorhandler(
  async (req: AuthenticatedRequest, res: Response) => {
    res.status(400).json({ 
      message: "This endpoint is deprecated. Please use the new payment flow: /create-join-order and /verify-join-payment" 
    });
  }
);