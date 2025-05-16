import express from "express";
import { loginUser, registerUser } from "../Controller/userController";

import { registerUser } from "../Controller/userController";


const router = express.Router();

router.post("/register", registerUser);

router.post('/login' , loginUser)



export default router;
