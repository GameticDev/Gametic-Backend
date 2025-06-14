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

export const sentHostEmail = async (
  email: string,
  hostName: string,
  matchTitle: string,
  sportType: string,
  matchDate: string,
  startTime: string,
  endTime: string,
  turfName: string,
  location: string,
  maxPlayers: number,
  paymentPerPerson: number,
  matchId: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Match Successfully Created - Gametic Sports",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Match Created Successfully</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f0; color: #333333;">
        
        <!-- Main Container -->
        <table style="width: 100%; background-color: #ffffff; border-collapse: collapse;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 40px 20px 20px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
              <div style="margin-bottom: 30px;">
                <h1 style="color: #2c5530; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Gametic Sports</h1>
              </div>
            </td>
          </tr>

          <!-- Success Icon and Message -->
          <tr>
            <td style="padding: 40px 20px 30px 20px; text-align: center; background-color: #ffffff;">
              <div style="background-color: #4CAF50; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 30px auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 40px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 32px; font-weight: 600;">Your match was created successfully!</h2>
              <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.5;">
                Thank you ${hostName}!<br>
                Your match "${matchTitle}" has been successfully created and is now live for player registrations.
              </p>
            </td>
          </tr>

          <!-- Match Details Summary -->
          <tr>
            <td style="padding: 0 20px 40px 20px; background-color: #ffffff;">
              
              <h3 style="color: #333333; margin: 0 0 25px 0; font-size: 20px; font-weight: 600; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Match Summary</h3>
              
              <!-- Match Title -->
              <div style="margin-bottom: 20px;">
                <div style="color: #333333; font-size: 16px; font-weight: 600; margin-bottom: 5px;">${matchTitle}</div>
                <div style="color: #666666; font-size: 14px;">${sportType}</div>
              </div>

              <!-- Date & Time -->
              <div style="margin-bottom: 20px;">
                <div style="color: #666666; font-size: 14px; margin-bottom: 2px;">Schedule</div>
                <div style="color: #333333; font-size: 16px; font-weight: 600;">${matchDate}</div>
                <div style="color: #333333; font-size: 16px; font-weight: 600;">${startTime} - ${endTime}</div>
              </div>

              <!-- Venue -->
              <div style="margin-bottom: 20px;">
                <div style="color: #666666; font-size: 14px; margin-bottom: 2px;">Venue</div>
                <div style="color: #333333; font-size: 16px; font-weight: 600;">${turfName}</div>
                <div style="color: #666666; font-size: 14px;">${location}</div>
              </div>

              <!-- Players -->
              <div style="margin-bottom: 20px;">
                <div style="color: #666666; font-size: 14px; margin-bottom: 2px;">Maximum Players</div>
                <div style="color: #333333; font-size: 16px; font-weight: 600;">${maxPlayers} players</div>
              </div>

              <!-- Entry Fee -->
              <div style="margin-bottom: 30px;">
                <div style="color: #666666; font-size: 14px; margin-bottom: 2px;">Entry Fee</div>
                <div style="color: #333333; font-size: 16px; font-weight: 600;">₹${paymentPerPerson} per person</div>
              </div>

              <!-- Match ID -->
              <div style="margin-bottom: 30px;">
                <div style="color: #666666; font-size: 14px; margin-bottom: 2px;">Match ID</div>
                <div style="color: #333333; font-size: 16px; font-weight: 600;">${matchId}</div>
              </div>

            </td>
          </tr>

          <!-- Contact Information -->
          <tr>
            <td style="padding: 30px 20px 40px 20px; background-color: #ffffff; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; margin: 0; font-size: 14px; line-height: 1.5; text-align: center;">
                If you have any questions regarding your match, please contact us at: 
                <a href="mailto:support@gameticsports.com" style="color: #4CAF50; text-decoration: none;">support@gameticsports.com</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table style="width: 100%; background-color: #2c5530; border-collapse: collapse;">
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">© 2025 Gametic Sports</p>
              <p style="color: #a0c4a3; margin: 0; font-size: 12px;">Connecting Athletes • Building Communities</p>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `,
  };

  try {
    const maile = await transporter.sendMail(mailOptions);
    console.log(maile, "mail success");
  } catch (error) {
    console.log(error, "send error");
  }
};
