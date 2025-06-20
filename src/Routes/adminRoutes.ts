import express from "express";
import {
  blockUser,
  deleteUser,
  getAllUsers,
} from "../Controller/adminController";
import { getAllVenues } from "../Controller/admin/venueController";
import { loginAdmin } from "../Controller/admin/authentication";
import { logOut } from "../Controller/userController";
const route = express.Router();

route

  .post("/login", loginAdmin)
  .post("/logout", logOut)
  //Handling Users
  .get("/users", getAllUsers)
  .patch("/block-user/:id", blockUser)
  .delete("/delete-user/:id", deleteUser)

  //Handling Venues
  .get("/venues", getAllVenues);

export default route;
