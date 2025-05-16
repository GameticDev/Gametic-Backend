import express from "express";
import { loginUser, registerUser , generateOtp , verifyOtp , logOut} from "../Controller/userController";

const router = express.Router();

router.post("/register", registerUser);

router.post('/login' , loginUser)

router.post("/logout" , logOut )

router.post('/genaraetotp' , generateOtp)

router.post('/verifyotp' , verifyOtp)

export default router;
