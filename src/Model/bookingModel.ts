import mongoose, { Schema, Document } from "mongoose";

export interface Booking extends Document {
  userId: mongoose.Types.ObjectId;
   turfId: mongoose.Types.ObjectId; 
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  amount: number;
  createdAt: Date;
  bookingType: "host" | "normal";
  duration?: number;
  paymentId: string;
}

const bookingSchema = new Schema<Booking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
    turfId: {
    type: Schema.Types.ObjectId,
    ref: "Turf",
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
  duration: {
    type: Number, 
  },
});

bookingSchema.pre("save", function (next) {
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + minutes / 60;
  };

  if (this.startTime && this.endTime) {
    const start = parseTime(this.startTime);
    const end = parseTime(this.endTime);
    this.duration = parseFloat((end - start).toFixed(1));
  }

  next();
});

const Booking = mongoose.model<Booking>("Booking", bookingSchema);
export { bookingSchema, Booking };
