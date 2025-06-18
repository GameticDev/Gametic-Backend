import mongoose, { Schema, Document } from "mongoose";

export interface Booking extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  amount: number;
  createdAt: Date;
  bookingType: "host" | "normal";
  paymentId: string;
}

const bookingSchema = new Schema<Booking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bookingType: {
    type: String,
    enum: ["host", "normal"],
    required: true,
    default: "normal",
  },
});

const Booking = mongoose.model<Booking>("Booking", bookingSchema);
export { bookingSchema, Booking };
