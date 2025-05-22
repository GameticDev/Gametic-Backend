
import User from "../Model/userModel";
import {
  RegisterUserInput,
  LoginUserInput,
  UserPayload,
} from "../Type/user";
import { CustomError } from "../utils/customError";
import {
  generateToken,generateRefreshToken
} from "../utils/generateToken";



export const registerUserSarvice = async ({
  username,
  email,
  password,
  role,
  picture,
  sing
}: RegisterUserInput) => {
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new CustomError("User already exists with this email");
  }

  const user = await User.create({ username, email, password , role , picture , sing});

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
  };
};






export const loginService = async ({ email, password }: LoginUserInput) => {
  const user = await User.findOne({ email });

  if (!user) throw new CustomError("Invalid email or password", 401);
  if (user.isBlocked) {
    throw new CustomError(
      "Your account is blocked. Please contact Admin for assistance.",
      403
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new CustomError("Invalid email or password", 401);
  }

  const payload: UserPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user?.role || "owner", 
    picture : "" ,
    username: user.username,
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

 export const logoutService = () => {
  return true
 }