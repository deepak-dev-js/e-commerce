
import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
  });

  if (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }

  console.log("Email accepted by Resend:", data.id);

  return data;
};

export default sendEmail;

