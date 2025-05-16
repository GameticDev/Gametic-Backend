import jwt from 'jsonwebtoken';
import { CustomError } from './customError';

import {UserPayload} from "../Type/user"




interface UserPayload {
  _id: string;
  email: string;
  role: string;
  username: string;
}


export const generateAccessToken = (user: UserPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new CustomError("JWT_SECRET not defined in environment");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '50m' }
  );
};


export const genaraterefreshToken = (user : UserPayload): string => {

    if(!process.env.REFRESH_TOKEN_SECRET){
        throw new CustomError("REFRESH_TOKEN_SECRET not defined in environment")
    }

    return jwt.sign(
        {
            id:user._id,
            email:user.email,
            role:user.role,
            username:user.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : '7d'}
    )
}