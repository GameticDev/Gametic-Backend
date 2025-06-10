import express from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
  logOut,
  googleAuth,
  emailVerification,
  updateUser,
} from "../Controller/userController";
import { addPost, deletePost, getAllPost, getPostById, joinMatchPost } from "../Controller/matchPostController";
import { createTeam } from "../Controller/teamController";
import upload from "../Middleware/uploadMulter";
import { authMiddleware, verifyAdmin, verifyOwner } from "../Middleware/auth";
import { createTournamentPost, getAllTournamentPost, joinTeamToTournament, tournamentById } from "../Controller/tournamentController";



const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logOut);

router.post("/emailverification", emailVerification);

router.post("/verifyotp", verifyOtp);

router.post("/auth/google", googleAuth);

router.post('/addMatch',addPost)
router.get('/getAllPost', getAllPost )

router.get('/postById/:id',getPostById)

router.post('/postById/:id/join',joinMatchPost)

router.patch('/deletepost/:id',deletePost)
//tournament APIs
router.get('/getAllTournament',getAllTournamentPost)
router.post('/createTournament',authMiddleware,upload.single('image'),createTournamentPost)

router.post('/team',authMiddleware,createTeam)

router.get('/tournamentById/:id',tournamentById)

router.patch('/tournament/:id/join-team',joinTeamToTournament)

router.post('/updateprofile'  ,upload.single('picture') , updateUser )



 router.post("/check",loginUser)

export default router;