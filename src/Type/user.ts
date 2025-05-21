export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'owner' | 'admin';
}

export interface LoginUserInput {
  email: string;
  password: string;
}


export interface UserPayload {
  _id: unknown;
  email: string;
  role: string;
  username: string;
}

export interface OtpDocument extends Document {
  userId: string;
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

