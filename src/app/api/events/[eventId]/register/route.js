import { connectToDatabase } from "@/lib/mongodb";
import { registerForEvent, isUserRegistered } from "@/lib/models/event";
import sgMail from "@sendgrid/mail";
import { ObjectId } from "mongodb";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function getEventById(db, eventId) {
  try {
    return await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });
  } catch (error) {
    logger.logApiError("getEventById", error);
    return null;
  }
}

export const POST = withErrorHandler(async (req, { params }) => {
  const registrationData = await req.json();
  const { eventId } = await params;
  const db = await connectToDatabase();

  registrationData.userEmail = registrationData.email;
  registrationData.registeredAt = new Date().toISOString();

  const event = await getEventById(db, eventId);
  if (!event) {
    return apiResponse.notFound("Event not found");
  }

  const alreadyRegistered = await isUserRegistered(
    db,
    eventId,
    registrationData.userEmail
  );
  if (alreadyRegistered) {
    return apiResponse.badRequest("Already registered for this event");
  }

  const result = await registerForEvent(db, eventId, registrationData);

    // Format the date
    const eventDate = new Date(event.date + "T00:00:00").toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    // Send confirmation email
    try {
      const msg = {
        to: registrationData.userEmail,
        from: "rojnovyotam@gmail.com",
        subject: `Registration Confirmed: ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Registration Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
              <div style="max-width: 600px; margin: 40px auto; background: linear-gradient(to bottom right, #ffffff, #fafafa); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                
                <!-- Header -->
                <div style="background: linear-gradient(to right, #6d28d9, #8b5cf6); padding: 40px 30px; text-align: center;">
                  <div style="background: rgba(255, 255, 255, 0.1); display: inline-block; padding: 12px 24px; border-radius: 50px; margin-bottom: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                      <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/>
                    </svg>
                    <span style="color: #ffffff; font-size: 14px; font-weight: 500;">Registration Confirmed</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">You're all set!</h1>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 24px 0;">
                    Hi ${registrationData.name},
                  </h2>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Your registration for the following event has been confirmed:
                  </p>

                  <!-- Event Card -->
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <h3 style="color: #6d28d9; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">${
                      event.title
                    }</h3>
                    
                    <div style="margin-bottom: 16px;">
                      <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; margin-right: 12px;">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <span style="color: #4b5563; font-size: 16px;">${eventDate}</span>
                      </div>
                      
                      ${
                        event.time
                          ? `
                      <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div style="width: 20px; height: 20px; margin-right: 12px;">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <span style="color: #4b5563; font-size: 16px;">${event.time}</span>
                      </div>
                      `
                          : ""
                      }
                      
                      ${
                        event.location
                          ? `
                      <div style="display: flex; align-items: center;">
                        <div style="width: 20px; height: 20px; margin-right: 12px;">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <span style="color: #4b5563; font-size: 16px;">${event.location}</span>
                      </div>
                      `
                          : ""
                      }
                    </div>
                  </div>

                  ${
                    event.eventType === "webinar" &&
                    (registrationData.companyName ||
                      registrationData.companyRole)
                      ? `
                  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <h4 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Company Information</h4>
                    ${
                      registrationData.companyName
                        ? `<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;"><strong>Company:</strong> ${registrationData.companyName}</p>`
                        : ""
                    }
                    ${
                      registrationData.companyRole
                        ? `<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;"><strong>Role:</strong> ${registrationData.companyRole}</p>`
                        : ""
                    }
                  </div>
                  `
                      : ""
                  }

                  ${
                    registrationData.comments
                      ? `
                  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <h4 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Your Comments</h4>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">${registrationData.comments}</p>
                  </div>
                  `
                      : ""
                  }

                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    We're excited to have you join us! If you have any questions before the event, feel free to reach out to us.
                  </p>
                </div>

                <!-- Footer -->
                <div style="padding: 24px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    © ${new Date().getFullYear()} FinTech Calgary. All rights reserved.
                  </p>
                </div>

              </div>
            </body>
          </html>
        `,
      };

      await sgMail.send(msg);
    } catch (emailError) {
      logger.logApiError("send_confirmation_email", emailError);
      // Don't fail the registration if email fails
    }

    logger.logUserAction("register_for_event", { eventId, email: registrationData.userEmail });
    return apiResponse.success(result);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { eventId } = await params;
  const { registrationIndex } = await req.json();
  const db = await connectToDatabase();

  const event = await getEventById(db, eventId);
  if (!event) {
    return apiResponse.notFound("Event not found");
  }

  // Check if registration index is valid
  if (
    !event.registrations ||
    registrationIndex < 0 ||
    registrationIndex >= event.registrations.length
  ) {
    return apiResponse.badRequest("Invalid registration index");
  }

  // Remove the registration at the specified index
  const updatedRegistrations = event.registrations.filter(
    (_, index) => index !== registrationIndex
  );

  const result = await db
    .collection("events")
    .updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { registrations: updatedRegistrations } }
    );

  if (result.matchedCount === 0) {
    return apiResponse.notFound("Event not found");
  }

  logger.logUserAction("delete_event_registration", { eventId, registrationIndex });
  return apiResponse.success({ success: true });
});
