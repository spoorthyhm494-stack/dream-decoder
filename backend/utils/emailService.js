// utils/emailService.js (Conceptually Updated)
import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net", // Example host
      port: 587,
      secure: false, 
      auth: {
        user: "apikey", // Often the username for these services is 'apikey'
        pass: process.env.SENDGRID_API_KEY // Use a single, secure API key
      }
    });

    await transporter.sendMail({
      from: "spoorthyhm494@gmail.com",
      to,
      subject,
      text
    });

    console.log("📩 App Email sent to:", to);
  } catch (err) {
    console.error("Email error:", err);
  }
};