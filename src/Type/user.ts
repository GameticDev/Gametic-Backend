export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  role: "user" | "owner" | "admin";
  picture: string;
  sign : string 
}


export interface LoginUserInput {
  email: string;
  password: string;
}


export interface UserPayload {
  _id: string;
  email: string;
  role: "user" | "owner" | "admin";
  picture: string;
  username: string;
}

export interface OtpDocument extends Document {
  userId: string;
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}


