import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtp = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Gametic Sports - Your One-Time Password (OTP)",
    html: `    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #00423D 0%, #415C41 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Gametic Sports
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Account Security Verification
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 50px 40px;">
                            <div style="text-align: center; margin-bottom: 40px;">
                                <h2 style="color: #00423D; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                                    Verify Your Account
                                </h2>
                                <p style="color: #415C41; margin: 0; font-size: 16px; line-height: 1.6;">
                                    Hello ${email},<br><br>
                                    We received a request to access your Gametic Sports account. Please use the verification code below to complete your login.
                                </p>
                            </div>
                            
                            <div style="background: linear-gradient(135deg, #998869 0%, #98916D 100%); border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                    Your Verification Code
                                </p>
                                <div style="background-color: #ffffff; border-radius: 6px; padding: 20px; display: inline-block; margin: 10px 0;">
                                    <span style="font-size: 32px; font-weight: 700; color: #00423D; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                        ${otp}
                                    </span>
                                </div>
                                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">
                                    Valid for 5 minutes
                                </p>
                            </div>
                            
                            <!-- Instructions -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #98916D; padding: 20px; margin: 30px 0; border-radius: 0 6px 6px 0;">
                                <h3 style="color: #00423D; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    Important Security Information:
                                </h3>
                                <ul style="color: #415C41; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                                    <li>This code expires in 5 minutes</li>
                                    <li>Never share this code with anyone</li>
                                    <li>Our team will never ask for this code</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <!-- Support Section -->
                            <div style="text-align: center; margin-top: 40px;">
                                <p style="color: #415C41; margin: 0 0 15px 0; font-size: 14px;">
                                    Need assistance? Our support team is here to help.
                                </p>
                                <a href="mailto:support@gameticsports.com" style="background: linear-gradient(135deg, #00423D 0%, #415C41 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
                                    Contact Support
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #998869; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                Play Hard, Stay Safe!
                            </p>
                            <p style="color: #ffffff; margin: 0; font-size: 14px; opacity: 0.9;">
                                © 2025 Gametic Sports. All rights reserved.
                            </p>
                            <div style="margin-top: 20px;">
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 13px;">Privacy Policy</a>
                                <span style="color: #ffffff; opacity: 0.7;">|</span>
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 13px;">Terms of Service</a>
                                <span style="color: #ffffff; opacity: 0.7;">|</span>
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 13px;">Unsubscribe</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>`,
  };

  await transporter.sendMail(mailOptions);
  console.log("OTP sent successfully");
};
