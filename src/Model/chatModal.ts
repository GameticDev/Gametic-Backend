import mongoose, { Document, Schema } from "mongoose";

export interface ChatMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
}

const chatMessageSchema = new Schema<ChatMessage>(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Match", 
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ChatMessage>("ChatMessage", chatMessageSchema);
