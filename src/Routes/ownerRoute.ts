import express from 'express'
import { createTurf, deleteTurf, editTurf, getAllturf, turfById  } from '../Controller/ownerController'
import upload from '../Middleware/uploadMulter';
import { verifyOwner } from '../Middleware/auth';
const ownerRoute=express()


ownerRoute.post('/owner/addTurf',verifyOwner,upload.array('images',5),createTurf)
ownerRoute.patch('/owner/editTurf/:id',verifyOwner,upload.array('images',5),editTurf)
ownerRoute.get('/owner/getAllturf',verifyOwner,getAllturf)
ownerRoute.delete('/owner/turfs/:id', verifyOwner,deleteTurf)
ownerRoute.get('/owner/getTurf/:id',verifyOwner,turfById)


export default ownerRoute;