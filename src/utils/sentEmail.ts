import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtp = async (email: string, otp: string): Promise<void> => {
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Gametic Sports - Your One-Time Password (OTP)',
  text: `
Hello,

Thank you for choosing Gametic Sports!

Your One-Time Password (OTP) to verify your login is:

${otp}

This code is valid for the next 5 minutes. Please do not share this OTP with anyone to keep your account secure.

If you did not request this, please ignore this email or contact our support team immediately.

Play hard, stay safe!

Best regards,
The Gametic Sports Team
  `.trim(),
};

  await transporter.sendMail(mailOptions);
  console.log('OTP sent successfully');
};
