

import express from 'express'
import { createTurf, deleteTurf, editTurf, getAllturf, turfById  } from '../Controller/ownerController'
import upload from '../Middleware/uploadMulter';
import { verifyOwner } from '../Middleware/auth';
const ownerRoute=express()


ownerRoute.post('/addTurf',verifyOwner,upload.array('images',5),createTurf)
ownerRoute.patch('/editTurf/:id',verifyOwner,upload.array('images',5),editTurf)
ownerRoute.get('/getAllturf',verifyOwner,getAllturf)
ownerRoute.delete('/turfs/:id', verifyOwner,deleteTurf)
ownerRoute.get('/getTurf/:id',verifyOwner,turfById)


export default ownerRoute;