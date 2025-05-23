import express from "express";
import {
  blockUser,
  deleteUser,
  getAllUsers,
} from "../Controller/adminController";
import { getAllVenues } from "../Controller/admin/venueController";
const route = express.Router();

route

//Handling Users
  .get("/users", getAllUsers)
  .patch("/block-user/:id", blockUser)
  .delete("/delete-user/:id", deleteUser)
  //Handling Venues 
  .get('/venues',getAllVenues)

export default route;
