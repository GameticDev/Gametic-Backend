import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  picture?: string;
  phone?: string;
  location?: string;
  bio?: string;
  businessName?: string;
  sign?: string;
  isBlocked?: boolean;
  role?: "user" | "owner" | "admin";
  preferredLocation?: string;
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
      required: [true, 'Username is required'],
      minlength: [3, 'Username must be at least 3 characters'],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, 'Email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
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
    phone: {
      type: String, // Corrected to use mongoose's String type
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be a valid 10-digit number'],
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    businessName: {
      type: String,
      trim: true,
      default: null,
    },
    preferredLocation: {
      type: String,
      default: function (this: IUserDocument) {
        return this.role === "user" ? "Ernakulam" : null;
      },
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