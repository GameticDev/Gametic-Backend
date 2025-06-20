import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface INotification {
  title: string;
  message: string;
  type: string;
  userId: Types.ObjectId;
  matchId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

export interface INotificationModel extends Model<INotificationDocument> {}

const notificationSchema: Schema<INotificationDocument> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["system", "match", "booking","tournament"],
      default: "system",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<INotificationDocument, INotificationModel>(
  "Notification",
  notificationSchema
);

export default Notification;