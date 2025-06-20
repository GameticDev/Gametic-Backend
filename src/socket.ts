import { Server, Socket } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import User from "./Model/userModel";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);

    const userId = socket.handshake.query.userId as string;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId).select("preferredLocation");
        if (user && user.preferredLocation) {
          socket.join(`location:${user.preferredLocation}`);
          console.log(`User ${userId} joined room location:${user.preferredLocation}`);
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    } else {
      console.log("Invalid or missing userId for socket:", socket.id);
    }

    socket.on("notification", (data) => {
      if (!data.title || !data.message) {
        console.log("Invalid notification data");
        return;
      }
      io?.emit("newNotification", {
        title: data.title,
        message: data.message,
        type: data.type || "system",
      });
      console.log("📩 Notification received and broadcast:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};