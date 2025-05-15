import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import ownerRoute from "./Routes/ownerRoute";
import upload from "./Middleware/uploadMulter";
const app = express();
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use('/api/owner',upload.array('image',5),ownerRoute)

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
