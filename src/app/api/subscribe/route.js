import { connectToDatabase } from "@/lib/mongodb";
import { createSubscriber } from "@/lib/models/subscriber";
import { apiResponse, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const POST = withErrorHandler(async (req) => {
  const { email, name } = await req.json();

  // Input validation
  const nameError = validators.required(name, "Name");
  if (nameError) {
    return apiResponse.badRequest(nameError);
  }

  const emailError = validators.email(email);
  if (emailError) {
    return apiResponse.badRequest(emailError);
  }

  const db = await connectToDatabase();
  await createSubscriber(db, { email, name });

  // Send welcome email
  const msg = {
    to: email,
    from: "rojnovyotam@gmail.com",
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

  logger.logUserAction("subscribe", { email });
  return apiResponse.success({ success: true });
});
