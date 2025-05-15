import express from 'express'
import { createTurf } from '../Controller/ownerController'
const ownerRoute=express()


ownerRoute.post('/addTurf',createTurf)

export default ownerRoute;

