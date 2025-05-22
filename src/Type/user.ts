export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  role: "user" | "owner" | "admin";
  picture: string;
  sing : string 
}


export interface LoginUserInput {
  email: string;
  password: string;
}


export interface UserPayload {
  _id: string;
  email: string;
  role: string;
  username: string;
  picture : string;
}

export interface OtpDocument extends Document {
  userId: string;
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}



