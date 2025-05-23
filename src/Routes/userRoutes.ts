import express from "express";
import { loginUser , logOut , googleAuth,emailVerification, verifyOtp, } from "../Controller/userController";

const router = express.Router();


// router.post("/register", registerUser);

router.post('/emailverification' , emailVerification )

router.post('/login' , loginUser)

router.post("/logout" , logOut )

// router.post('/genaraetotp' , generateOtp)

router.post('/verifyotp' , verifyOtp)

router.post('/google', googleAuth)

// router.post("/check",loginUser)

export default router;
