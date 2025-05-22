import mongoose, { Document, Model, Schema ,Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { string } from 'joi';

export interface IUser {
  username: string;
  email: string;
  password: string;
  picture : string ;
  isBlocked?: boolean;
  role?: 'user' | 'owner' | 'admin';
  otp : string ;
  sing : string ;
  expiresAt : Date | null
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
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
    },
    picture:{
      type :String ,
    },
    sing:{
      type:String
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
    otp: {
      type: String,
    },
    expiresAt: {
      type: Date,
      // default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (
  this: IUserDocument,
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUserDocument, IUserModel>("User", userSchema);
export default User;
