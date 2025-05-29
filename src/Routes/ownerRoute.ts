

import express from 'express'
import { createTurf, deleteTurf, editTurf, getAllturf, turfById  } from '../Controller/ownerController'
import upload from '../Middleware/uploadMulter';
const ownerRoute=express()


ownerRoute.post('/addTurf',upload.array('images',5),createTurf)
ownerRoute.patch('/editTurf/:id',upload.array('images',5),editTurf)
ownerRoute.get('/getAllturf',getAllturf)
ownerRoute.delete('/turfs/:id', deleteTurf)
ownerRoute.get('/getTurf/:id',turfById)





export default ownerRoute;
// ownerRoute.get('/:turfId/booked-slots', getTurfBookedSlots);
// ownerRoute.get('/:turfId/booked-slots', getTurfBookedSlots);