import { apiResponse, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import sgMail from "@sendgrid/mail";
import { COLLECTIONS, EMAIL } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const POST = withErrorHandler(async (req) => {
  const {
    email,
    firstName,
    lastName,
    ucid,
    membershipType,
    resume,
    hasPaid,
    payment,
  } = await req.json();

  // Input validation
  const validationError = validators.validateRequiredAndEmail(
    { email, firstName, lastName, ucid },
    ["firstName", "lastName", "ucid", "email"],
  );
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  // Validate resume is required
  if (!resume) {
    return apiResponse.badRequest("Resume is required");
  }

  const isPaid = hasPaid === true;
  const now = new Date();

  // Upsert by email so repeat submissions update the existing member
  // instead of creating duplicates
  const memberUpdate = {
    $set: {
      firstName,
      lastName,
      ucid,
      email,
      membershipType: membershipType || "free",
      resume,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  };

  if (isPaid) {
    memberUpdate.$set.has_paid = true;
    memberUpdate.$set.payment = {
      txnId: payment?.txnId || null,
      approvalCode: payment?.approvalCode || null,
      amount: payment?.amount || null,
      cardNumber: payment?.cardNumber || null,
      invoiceNumber: payment?.invoiceNumber || null,
      paidAt: now,
    };
  } else {
    // Never downgrade an existing paid member; only default on first insert
    memberUpdate.$setOnInsert.has_paid = false;
  }

  const db = await connectToDatabase();
  await db
    .collection(COLLECTIONS.MEMBERS)
    .updateOne({ email }, memberUpdate, { upsert: true });

  // Send welcome email (don't fail the request if email fails)
  try {
    const msg = {
      to: email,
      from: EMAIL.SENDGRID_FROM,
      subject: EMAIL.SUBJECTS.WELCOME,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6d28d9;">Welcome to FinTech Calgary!</h1>
          <p>Hi ${firstName},</p>
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
  } catch (emailError) {
    // Log email error but don't fail the request
    logger.log(emailError, { type: "email_error", endpoint: "/api/subscribe" });
  }

  logger.logUserAction("subscribe", {
    email,
    firstName,
    lastName,
    ucid,
    membership_type: membershipType || "free",
    has_paid: isPaid,
    txn_id: payment?.txnId || null,
  });
  return apiResponse.success({ success: true });
});
