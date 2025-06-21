import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import ownerRoute from "./Routes/ownerRoute";
import userRouter from "./Routes/userRoutes";
import cors from "cors";
import adminRoute from "./Routes/adminRoutes";
import locationRoute from './Routes/locationRoute'

import http from "http";
import { initSocket } from "./socket";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//owner apis
app.use("/api/admin", adminRoute);
app.use("/api/", ownerRoute);
app.use("/api", userRouter);

app.use('/api', locationRoute);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 8085;

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
