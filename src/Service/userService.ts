import User from "../Model/userModel";
import { RegisterUserInput } from "../Type/user";
import { CustomError } from "../utils/customError";

export const registerUserSarvice = async ({ username, email, password }: RegisterUserInput) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError("User already exists with this email");
  }

  const user = await User.create({ username, email, password });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
  };
};
