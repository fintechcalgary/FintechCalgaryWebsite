import { connectToDatabase } from "@/lib/mongodb";
import { createSubscriber } from "@/lib/models/subscriber";
import { apiResponse, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import sgMail from "@sendgrid/mail";
import { EMAIL } from "@/lib/constants";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const POST = withErrorHandler(async (req) => {
  const { email, name } = await req.json();

  // Input validation
  const validationError = validators.validateRequiredAndEmail(
    { email, name },
    ["name", "email"]
  );
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  const db = await connectToDatabase();
  await createSubscriber(db, { email, name });

  // Send welcome email
  const msg = {
    to: email,
    from: EMAIL.SENDGRID_FROM,
    subject: EMAIL.SUBJECTS.WELCOME,
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
