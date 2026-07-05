import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"AutoPost Nepal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your email - AutoPost Nepal",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Welcome to AutoPost Nepal!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Verify Email</a>
        <p style="margin-top:16px;color:#666;">Or copy this link: <br/>${link}</p>
        <p style="color:#999;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"AutoPost Nepal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your password - AutoPost Nepal",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p style="margin-top:16px;color:#666;">Or copy this link: <br/>${link}</p>
        <p style="color:#999;font-size:12px;">This link expires in 1 hour.</p>
        <p style="color:#999;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}
