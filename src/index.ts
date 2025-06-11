import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import ownerRoute from "./Routes/ownerRoute";
import userRouter from "./Routes/userRoutes";
import cors from "cors";
import adminRoute from './Routes/adminRoutes'
import upload from "./Middleware/uploadMulter";
import manageError from "./Middleware/manageError";

const app = express();
dotenv.config();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Health check endpoint for Render
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!", 
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.get("/hello", (req, res) => {
  res.json("www");
});

// Routes
app.use("/api/admin", adminRoute);
app.use("/api/", ownerRoute);
app.use("/api", userRouter);

// Error handling middleware (should be last)
app.use(manageError);

// FIXED: Proper port handling with fallback
const PORT = process.env.PORT || 10000;

// FIXED: Bind to 0.0.0.0 instead of localhost for Render
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Error handling for server startup
server.on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});
