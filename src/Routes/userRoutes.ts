import express from "express";
import { loginUser, registerUser , generateOtp , verifyOtp , logOut} from "../Controller/userController";
import { addPost, deletePost, getAllPost, getPostById, joinMatchPost } from "../Controller/matchPostController";

const router = express.Router();

router.post("/register", registerUser);

router.post('/login' , loginUser)

router.post("/logout" , logOut )

router.post('/genaraetotp' , generateOtp)

router.post('/verifyotp' , verifyOtp)

router.post('/addMatch',addPost)
router.patch('/deletepost/:id',deletePost)
router.get('/getAllpost',getAllPost)
router.get('/postById/:id',getPostById)
router.post('/postById/:id/join',joinMatchPost)

export default router;
