import User, { IUserDocument } from "../Model/userModel";
import { RegisterUserInput, LoginUserInput, UserPayload ,UpdateUserData } from "../Type/user";
import { CustomError } from "../utils/customError";
import { generateToken, generateRefreshToken } from "../utils/generateToken";

export const registerUserService = async ({
  username,
  email,
  password,
  role,
  picture,
  sign,
}: RegisterUserInput): Promise<Partial<IUserDocument>> => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    if (sign === "google" && existingUser.sign === "google") {
      return {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        picture: existingUser.picture,
        role: existingUser.role,
        sign: existingUser.sign,
      };
    }
    throw new CustomError("User already exists with this email", 400);
  }

  const userData: Partial<IUserDocument> = {
    username,
    email: email.toLowerCase(),
    role,
    picture,
    sign,
  };

  if (sign !== "google") {
    userData.password = password;
  }

  const user = await User.create(userData);

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    picture: user.picture,
    role: user.role,
    sign: user.sign,
  };
};

export const loginService = async ({ email, password }: LoginUserInput) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  console.log(user,"Abhay")
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.isBlocked) {
    throw new CustomError(
      "Your account is blocked. Please contact Admin for assistance.",
      403
    );
  }

  if (user.sign === "google") {
    throw new CustomError(
      "This account is linked to Google. Please sign in using your Google account.",
      400
    );
  }

  const isMatch = await user.matchPassword(password);
  console.log(isMatch)
  if (!isMatch) {
    throw new CustomError("Invalid password", 401);
  }

  const payload: UserPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user?.role || "user",
    picture: user.picture || "",
    username: user.username,
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id:user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      picture: user.picture || "",
    },
  };
};
export const logoutService = () => {
  return true;
};

export const updateUserService = async (userId : string , data : UpdateUserData , file  ?: Express.Multer.File) => {
  const user = await User.findById(userId)
  if(!user) return "User not found"

  if(data.username) user.username = data.username
  if(data.password) user.password = data.password

  if(file?.path){
    user.picture = file.path
  }

  await user.save()
  return user
}

