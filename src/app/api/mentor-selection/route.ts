import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      mobile,
      mentor_name,
      mentor_headline,
      mentor_universities,
      mentor_countries,
      degree,
      program,
      target_countries,
      source_url,
    } = body;

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables");
      return NextResponse.json(
        { error: "Email configuration is missing on the server" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"EduAbroad Notifications" <${user}>`,
      to: "goeduabroadonline@gmail.com", // You can change this if you want it sent elsewhere
      subject: `Mentor selected: ${mentor_name || "Unknown mentor"} — by ${name || "a student"}`,
      text: `
A student has selected a mentor on Mentor Guru and confirmed it.

Student details
----------------
Name: ${name || "Not provided"}
Email: ${email || "Not provided"}
Mobile: ${mobile || "Not provided"}
Target degree: ${degree || "Not provided"}
Target program: ${program || "Not provided"}
Target countries: ${target_countries || "Not provided"}

Selected mentor
----------------
Mentor name: ${mentor_name || "Not provided"}
Mentor headline: ${mentor_headline || "Not provided"}
Mentor universities: ${mentor_universities || "Not provided"}
Mentor countries: ${mentor_countries || "Not provided"}

Please confirm this pairing with the student and mentor.

Source: Submitted from "${source_url || "Unknown Page"}"
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending mentor selection email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
