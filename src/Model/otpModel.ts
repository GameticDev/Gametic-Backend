import mongoose, { Document, Schema } from "mongoose";

// 1. Interface for OTP Document
export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}


const otpSchema: Schema<IOtp> = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);

export default OtpModel;