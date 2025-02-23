import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createSubscriber } from "@/lib/models/subscriber";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    const { email, name } = await req.json();

    // Input validation
    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    await createSubscriber(db, { email, name });

    // Send welcome email
    const msg = {
      to: email,
      from: "rojnovyotam@gmail.com", // Update this with your verified sender
      subject: "Welcome to FinTech Calgary!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6d28d9;">Welcome to FinTech Calgary!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining FinTech Calgary! We're excited to have you as part of our community.</p>
          <p>You'll receive updates about:</p>
          <ul>
            <li>Upcoming events and workshops</li>
            <li>Industry insights and news</li>
            <li>Networking opportunities</li>
            <li>And much more!</li>
          </ul>
          <p>Stay tuned for our next update!</p>
          <p>Best regards,<br>The FinTech Calgary Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to subscribe" },
      { status: 500 }
    );
  }
}
