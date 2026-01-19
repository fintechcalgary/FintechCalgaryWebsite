import Mailgun from "mailgun.js";
import formData from "form-data";
import { apiResponse, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import { EMAIL } from "@/lib/constants";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

function generateContactFormEmail({ name, email, subject, message }) {
  return `
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
              <td>${escapeHtml(name)}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${escapeHtml(email)}</td>
            </tr>
            <tr>
              <th>Subject</th>
              <td>${escapeHtml(subject)}</td>
            </tr>
            <tr>
              <th>Message</th>
              <td>${escapeHtml(message)}</td>
            </tr>
          </table>
          <div class="content">
            You can reply directly to this email to respond to ${escapeHtml(name)}.
          </div>
        </div>
        <div class="footer">
          Visit us at 
          <a href="https://fintechcalgary.ca" target="_blank">fintechcalgary.ca</a>.
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const POST = withErrorHandler(async (req) => {
  const { name, email, subject, message } = await req.json();

  // Input validation
  const requiredFields = ["name", "email", "subject", "message"];
  const validationError = validators.validateRequiredAndEmail(
    { name, email, subject, message },
    requiredFields
  );
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  const htmlContent = generateContactFormEmail({ name, email, subject, message });

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: EMAIL.CONTACT_FROM(MAILGUN_DOMAIN),
    to: EMAIL.CONTACT_TO,
    subject: EMAIL.SUBJECTS.CONTACT_FORM(subject),
    html: htmlContent,
    "h:Reply-To": email,
  });

  logger.logUserAction("contact_form_submission", { email, subject });
  return apiResponse.success({ success: true });
});
