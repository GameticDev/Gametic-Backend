import express from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
  logOut,
  googleAuth,
  emailVerification,
  updateUser,
  // loginedUser,
} from "../Controller/userController";
import { addPost, deletePost, getAllPost, getPostById, joinMatchPost } from "../Controller/matchPostController";
import { createTeam } from "../Controller/teamController";
import upload from "../Middleware/uploadMulter";
import { authMiddleware, verifyAdmin, verifyOwner } from "../Middleware/auth";
console.log(authMiddleware ,"user")

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logOut);

router.post("/emailverification", emailVerification);

router.post("/verifyotp", verifyOtp);

router.post("/auth/google", googleAuth);

router.post('/addMatch',addPost)
router.get('/getAllPost', authMiddleware , getAllPost  )

router.get('/postById/:id',getPostById)

router.post('/postById/:id/join',joinMatchPost)

router.patch('/deletepost/:id',deletePost)


router.post('/team',createTeam)

router.post('/updateprofile'  ,upload.single('picture') , updateUser )

// router.get("/me" , loginedUser)

 router.post("/check",loginUser)

export default router;