import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendWelcomeEmail = async (email: string, name: string) => {
    const mailOptions = {
        from: `"QuickLearn.ai" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to QuickLearn.ai! 🚀",
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">Welcome to QuickLearn.ai, ${name}!</h2>
        <p>We're thrilled to have you join our community of lifelong learners.</p>
        <p>With QuickLearn, you can:</p>
        <ul>
          <li>Get instant AI-powered explanations for any topic</li>
          <li>Explore curated video recommendations</li>
          <li>Test your knowledge with interactive quizzes</li>
        </ul>
        <p>Ready to start learning? Navigate to our dashboard and enter any topic you're curious about.</p>
        <p style="margin-top: 30px;">Happy Learning!<br>The QuickLearn Team</p>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
};

export const sendOTPEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: `"QuickLearn.ai" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your OTP for QuickLearn.ai 🔐",
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Your Verification Code</h2>
        <p>Use the following OTP to verify your identity at QuickLearn.ai:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
};
