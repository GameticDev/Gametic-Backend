import express from 'express'
import { createTurf, deleteTurf, editTurf, getAllturf, turfById } from '../Controller/ownerController'
import upload from '../Middleware/uploadMulter';
const ownerRoute=express()


ownerRoute.post('/addTurf',upload.array('image',5),createTurf)
ownerRoute.delete('/deleteTurf/:id',deleteTurf)
ownerRoute.patch('/editTurf/:id',upload.array('image',5),editTurf)
ownerRoute.get('/getAllturf',getAllturf)
ownerRoute.get('/getTurf/:id',turfById)
export default ownerRoute;