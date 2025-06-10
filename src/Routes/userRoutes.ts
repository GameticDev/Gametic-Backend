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
import {
  addPost,
  deletePost,
  getAllPost,
  getPostById,
  joinMatchPost,
} from "../Controller/matchPostController";
import { createTeam } from "../Controller/teamController";
console.log(authMiddleware ,"user")
import {
  getAllMatches,
  getMatchById,
  hostMatch,
  joinMatch,
} from "../Controller/user/matchHostController";
import { bookVenue } from "../Controller/user/venueController";
import upload from "../Middleware/uploadMulter";
import { createTournamentPost, getAllTournamentPost, joinTeamToTournament, tournamentById } from "../Controller/tournamentController";
import { authMiddleware } from "../Middleware/auth";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logOut);

router.post("/emailverification", emailVerification);

router.post("/verifyotp", verifyOtp);

router.post("/auth/google", googleAuth);

router.post('/addMatch',addPost)
router.get('/getAllPost', authMiddleware , getAllPost  )
router
  //Host
  .get("/all-matches", getAllMatches)
  .get("/match/:matchId", getMatchById)
  .post("/host-match", hostMatch)
  .post("/join-match/:matchId", joinMatch)

  //venue booking
  .post("/venue-booking", bookVenue);

router.post("/addMatch", addPost);
router.get("/getAllPost", getAllPost);

router.get('/postById/:id',getPostById)

router.post('/postById/:id/join',joinMatchPost)

router.patch('/deletepost/:id',deletePost)


router.post('/team',createTeam)

router.post('/updateprofile'  ,upload.single('picture') , updateUser )

// router.get("/me" , loginedUser)

 router.post("/check",loginUser)
router.get("/postById/:id", getPostById);

router.post("/postById/:id/join", joinMatchPost);

router.patch("/deletepost/:id", deletePost);

//tournament APIs
router.get('/getAllTournament',getAllTournamentPost)
router.post('/createTournament',authMiddleware,upload.single('image'),createTournamentPost)

router.post('/team',authMiddleware,createTeam)

router.get('/tournamentById/:id',tournamentById)

router.patch('/tournament/:id/join-team',joinTeamToTournament)
router.post('/updateprofile'  ,upload.single('picture') , updateUser )


router.post("/team", createTeam);

 router.post("/check",loginUser)

export default router;
