import asyncHandler from "../Middleware/asyncHandler"
import User from "../Model/userModel"
import { RegisterUserInput } from "../Type/user"

export const registerUserSarvice = async ({username , email , password } : RegisterUserInput) => {

    const existingUser = await User.findOne({email})

    // if(existingUser){
    //     throw new CustomError("User already exists with this email")
    // }

    try{
        const user = await User.create({username , email , password}) 
        return {
            id : user.id,
            username : user.username,
            email : user.email,
            password : user.password,
        };
    }
    catch(error){
            if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
    //   throw new CustomError(
    //     `The ${field} "${error.keyValue[field]}" is already taken. Please use a different one.`,
    //     400
    //   );
    }
    // throw new CustomError(
    //   "Something went wrong during registration. Please try again later.",
    //   500
    // );
  }
}