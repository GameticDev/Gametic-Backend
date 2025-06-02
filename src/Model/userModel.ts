import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  picture?: string;
  sign?: string;
  isBlocked?: boolean;
  role?: "user" | "owner" | "admin";
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {}

const userSchema: Schema<IUserDocument> = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    picture: {
      type: String,
      default: "",
    },
    sign: {
      type: String,
      enum: ["google", "local", null],
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (
  this: IUserDocument,
  enteredPassword: string
): Promise<boolean> {
  if (!this.password) {
    return false; 
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUserDocument, IUserModel>("User", userSchema);
export default User;