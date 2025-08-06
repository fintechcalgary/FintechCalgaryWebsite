import { NextResponse } from "next/server";
import Mailgun from "mailgun.js";
import formData from "form-data";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    // Input validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const htmlContent = `
        <html>
          <head>
            <title>New Contact Form Submission</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                font-size: 24px;
                font-weight: bold;
                color: #6d28d9;
                margin-bottom: 16px;
              }
              .content {
                color: #555555;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 24px;
              }
              .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 24px;
              }
              .table th, .table td {
                padding: 12px;
                border: 1px solid #ddd;
              }
              .table th {
                background-color: #f8f8f8;
                font-weight: bold;
                color: #333;
              }
              .footer {
                padding: 20px;
                text-align: center;
                background-color: #f8f8f8;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #888888;
              }
              .footer a {
                color: #6d28d9;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">New Contact Form Submission</div>
              <div class="content">
                You have received a new message through the FinTech Calgary contact form. Below are the details:
              </div>
              <table class="table">
                <tr>
                  <th>Name</th>
                  <td>${name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>${email}</td>
                </tr>
                <tr>
                  <th>Subject</th>
                  <td>${subject}</td>
                </tr>
                <tr>
                  <th>Message</th>
                  <td>${message}</td>
                </tr>
              </table>
              <div class="content">
                You can reply directly to this email to respond to ${name}.
              </div>
            </div>
            <div class="footer">
              Visit us at 
              <a href="https://fintechcalgary.ca" target="_blank">fintechcalgary.ca</a>.
            </div>
          </body>
        </html>
      `;

    const response = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `FinTech Calgary <contact@${MAILGUN_DOMAIN}>`,
      to: ["rojnovyotam@gmail.com", "fintech.calgary@gmail.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: htmlContent,
      "h:Reply-To": email,
    });

    console.log("Mailgun response:", response); // Log response for debugging

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error.response?.body || error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
