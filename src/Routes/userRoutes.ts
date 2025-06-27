import express from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
  logOut,
  googleAuth,
  emailVerification,
  updateUser,
  LoginedUserDetails,
} from "../Controller/userController";

import {
  addPost,
  cancelMatch,
  deletePost,
  getAllPost,
  getPostById,
  joinMatchPost,
} from "../Controller/matchPostController";

import {
  createTeamAndJoin,
  createTeamOrder,
} from "../Controller/teamController";

import {
  createHostingOrder,
  createJoinOrder,
  getAllMatches,
  getMatchById,
  getVenueBySports,
  hostMatch,
  joinMatch,
  verifyJoinPayment,
} from "../Controller/user/matchHostController";

import {
  bookVenue,
  createBookingOrder,
  getAllVenuesforUser,
  getVenueByIdforUser,
} from "../Controller/user/venueController";

import {
  createTournamentPost,
  getAllTournamentPost,
  joinTeamToTournament,
  tournamentById,
} from "../Controller/tournamentController";

import {
  getLocations,
  updatePreferredLocation,
} from "../Controller/user/locationController";

import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../Controller/user/notificationController";

import { sendMessage, getMessage } from "../Controller/message/messageController";

import upload from "../Middleware/uploadMulter";
import { authMiddleware } from "../Middleware/auth";

const router = express.Router();

// ✅ Auth & User
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check", loginUser);
router.post("/logout", logOut);
router.post("/emailverification", emailVerification);
router.post("/verifyotp", verifyOtp);
router.post("/auth/google", googleAuth);
router.get("/user", authMiddleware, LoginedUserDetails);

// ✅ Match Post
router.post("/addMatch", addPost);
router.get("/getAllPost", authMiddleware, getAllPost);
router.get("/postById/:id", getPostById);
router.post("/postById/:id/join", joinMatchPost);
router.patch("/deletepost/:id", deletePost);

// ✅ Match Host / Join / Payment
router.get("/all-matches", getAllMatches);
router.get("/match/:matchId", getMatchById);
router.post("/host-match", authMiddleware, hostMatch);
router.post("/join-match/:matchId", authMiddleware, joinMatch);
router.delete("/:matchId/leave", authMiddleware, cancelMatch);
router.post("/create-hosting-order", authMiddleware, createHostingOrder);
router.post("/create-join-order/:matchId", authMiddleware, createJoinOrder);
router.post("/verify-join-payment", authMiddleware, verifyJoinPayment);

// ✅ Venues
router.post("/venue-booking", authMiddleware, bookVenue);
router.post("/create-booking-order", authMiddleware, createBookingOrder);
router.get("/getAllVenues", getAllVenuesforUser);
router.get("/veunesById/:turfId", getVenueByIdforUser);
router.get("/turfby-sport", getVenueBySports);

// ✅ Location
router.patch("/update-location", authMiddleware, updatePreferredLocation);
router.get("/getLocations", getLocations);

// ✅ Notifications
router.get("/allNotification", authMiddleware, getUserNotifications);
router.patch("/markRead/:notificationId", authMiddleware, markNotificationAsRead);
router.patch("/markAllRead", authMiddleware, markAllNotificationsAsRead);

// ✅ Tournament
router.get("/getAllTournament", getAllTournamentPost);
router.get("/tournamentById/:id", tournamentById);
router.post("/createTournament", authMiddleware, upload.single("image"), createTournamentPost);
router.patch("/tournament/:id/join-team", joinTeamToTournament);

// ✅ Team
router.post("/team", authMiddleware, createTeamAndJoin);
router.post("/create-team-order", authMiddleware, createTeamOrder);

// ✅ Profile Update
router.put("/updateprofile", authMiddleware, upload.single("picture"), updateUser);

// ✅ Chat
router.post("/sendmessage", authMiddleware, sendMessage);
router.get("/getMessage/:roomId", authMiddleware, getMessage);

export default router;
