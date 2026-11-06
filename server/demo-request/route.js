import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import DemoRequest from "@/models/DemoRequest";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, company, designation, phone, email, projectSize, notes } = body;

    // Validation
    if (!name || !company || !designation || !phone || !email || !projectSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 1. Save to MongoDB
    await connectDB();
    const saved = await DemoRequest.create({
      name, company, designation, phone, email, projectSize, notes,
    });

    // 2. Send Emails via SMTP
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      // Email to Sales
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.NOTIFY_EMAIL,
        replyTo: email,
        subject: `New Demo Request — ${company} (${name})`,
        html: `
          <h2>New Demo Request</h2>
          <ul>
            <li><b>Name:</b> ${escapeHtml(name)}</li>
            <li><b>Company:</b> ${escapeHtml(company)}</li>
            <li><b>Designation:</b> ${escapeHtml(designation)}</li>
            <li><b>Phone:</b> ${escapeHtml(phone)}</li>
            <li><b>Email:</b> ${escapeHtml(email)}</li>
            <li><b>Project Size:</b> ${escapeHtml(projectSize)}</li>
            <li><b>Notes:</b> ${escapeHtml(notes || "—")}</li>
          </ul>
        `,
      });

      // Email to User
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "We received your demo request",
        html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for requesting a demo. We'll be in touch soon!</p>`,
      });
    } catch (mailErr) {
      console.error("SMTP error:", mailErr);
      // We don't return an error here because the data was saved to DB successfully.
    }

    return NextResponse.json({ ok: true, id: saved._id }, { status: 200 });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}