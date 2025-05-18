import express from "express";
import {
  blockUser,
  deleteUser,
  getAllUsers,
} from "../Controller/adminController";
const route = express.Router();

route
  .get("/users", getAllUsers)
  // .put("/update-user/:id", updateUsers)
  .patch("/block-user/:id", blockUser)
  .delete("/delete-user/:id", deleteUser);

export default route;
