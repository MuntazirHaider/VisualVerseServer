import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

const emailHtmlTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VisualVerse OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f8ff;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1e90ff;
        }
        .content {
            padding: 20px 0;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            margin: 10px 0;
        }
        .otp {
            display: inline-block;
            padding: 10px 20px;
            font-size: 18px;
            background-color: #1e90ff;
            color: #ffffff;
            border-radius: 5px;
            letter-spacing: 2px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #aaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VisualVerse</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to access your VisualVerse account. Use the OTP below to complete your progress:</p>
            <div class="otp">${otp}</div>
            <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Visual Verse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


export const sendMail = async (email, otp) => {

    const mailOptions = {
        from: process.env.SMTP_USER_MAIL,
        to: email,
        subject: "Authentication OTP from VisualVerse",
        // text: `Your OTP is: ${otp}`,
        html: emailHtmlTemplate(otp)
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
