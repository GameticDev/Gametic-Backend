import  nodemailer  from 'nodemailer'; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});



export const sendEmailService = async (emails: string[]): Promise<void> => {
  const verificationLink = `https://google.com`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails,
    subject: "Gametic Sports - Tournament Registration & Email Verification",
    html: `
      <p>Hello,</p>
      <p>🎉 You have been successfully added to the tournament!</p>
      <p>Please verify your email to complete the registration process.</p>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}" style="color: #1a73e8;">Verify your email</a>
      <p>This link will expire in 10 minutes.</p>
      <br />
      <p>Thank you for joining Gametic Sports! 🏆</p>
    `
  };

  // Use your preferred email transport service to send this (e.g., nodemailer)



  try {
    const mail = await transporter.sendMail(mailOptions);
    // console.log(mail, "Mail success");
    console.log("OTP sent successfully");
  } catch (error) {
    console.error(error, "Send error");
  }
};
