import { Server, Socket } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import User from "./Model/userModel";
import chatModal from "./Model/chatModal";
import Match from "./Model/matchPostModel";

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
    const userId = socket.handshake.query.userId as string;

    // Join location room (optional)
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId).select("preferredLocation");
        if (user?.preferredLocation) {
          socket.join(`location:${user.preferredLocation}`);
          console.log(
            `Joined location room: location:${user.preferredLocation}`
          );
        }
      } catch (err) {
        console.error("Error fetching user location:", err);
      }
    }

    // Join match room

    socket.on("joinRoom", async ({ roomId, userId }) => {
      console.log("joinRoom received:", roomId, userId);
      if (!roomId || !userId) return;

      socket.join(roomId);
      const sockets = await io.in(roomId).fetchSockets();
      console.log(
        `${socket.id} joined room ${roomId} | Total: ${sockets.length}`
      );
    });

    socket.on("sendMessage", async (data) => {
      const { roomId, message, userId } = data;
      // const senderId = socket.handshake.query.userId as string;
      const senderId = userId;
      //

      try {
        const match = await Match.findById(roomId);
        if (!match) {
          return socket.emit("errorMessage", "Match not found");
        }

        const isJoined = match.joinedPlayers.some(
          (id) => id.toString() === senderId
        );
        if (!isJoined) {
          return socket.emit("errorMessage", "You are not part of this match");
        }
        const chat = await chatModal.create({ roomId, senderId, message });
        const fullMessage = await chat.populate("senderId", "username _id picture");

        console.log("Emitting message to room:", roomId);
        io.to(roomId).emit("newMessage", fullMessage);
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
