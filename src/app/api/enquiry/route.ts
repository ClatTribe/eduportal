import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, email, target_year, message, source_url } = body;

    // We check if the env variables are set
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables");
      return NextResponse.json(
        { error: "Email configuration is missing on the server" },
        { status: 500 }
      );
    }

    // Configure the nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    // Create the email content
    const mailOptions = {
      from: `"EduAbroad Notifications" <${user}>`,
      to: "goeduabroadonline@gmail.com", // You can change this if you want it sent elsewhere
      subject: `New Roadmap Enquiry from ${name} 🚀`,
      text: `
A new student has requested a free 1-on-1 roadmap!

Name: ${name}
Mobile: ${mobile}
Email: ${email}
Target Year: ${target_year}
Message: ${message || "No message provided."}

Source: Submitted from "${source_url || "Unknown Page"}"
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
