import express from 'express'
import { createTurf, deleteTurf, editTurf, getAllturf, turfById ,updateUserProfile ,updateBookingStatus} from '../Controller/ownerController'
import upload from '../Middleware/uploadMulter';
import { authMiddleware, verifyOwner } from '../Middleware/auth';
const ownerRoute=express()


ownerRoute.post('/owner/addTurf',authMiddleware,verifyOwner,upload.array('images',5),createTurf)
ownerRoute.patch('/owner/editTurf/:id',authMiddleware,verifyOwner,upload.array('images',5),editTurf)
ownerRoute.get('/getAllturf',getAllturf)
ownerRoute.delete('/owner/turfs/:id', authMiddleware,verifyOwner,deleteTurf)
// ownerRoute.get('/owner/getTurf/:id',verifyOwner,turfById)
ownerRoute.get('/getTurf/:id',turfById)
ownerRoute.put("/users/:id",authMiddleware,verifyOwner, updateUserProfile);
ownerRoute.put('/owner/update-booking-status/:id',authMiddleware,verifyOwner, updateBookingStatus);



export default ownerRoute;