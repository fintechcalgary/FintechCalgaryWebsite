import { connectToDatabase } from "@/lib/mongodb";
import { registerForEvent, isUserRegistered } from "@/lib/models/event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sgMail from "@sendgrid/mail";
import { ObjectId } from "mongodb";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;
    const db = await connectToDatabase();

    console.log(eventId);

    // Fetch event details
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    console.log(event);

    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    // Handle both authenticated and public registrations
    let registrationData;
    if (session) {
      // For authenticated users
      registrationData = {
        userEmail: session.user.email,
        name: session.user.name || session.user.email,
        registeredAt: new Date(),
        authenticated: true,
      };
    } else {
      // For public registrations
      const body = await req.json();
      if (!body.email || !body.name) {
        return new Response(
          JSON.stringify({ error: "Email and name are required" }),
          { status: 400 }
        );
      }
      registrationData = {
        userEmail: body.email,
        name: body.name,
        comments: body.comments,
        registeredAt: new Date(),
        authenticated: false,
      };
    }

    // Check if email is already registered
    const alreadyRegistered = await isUserRegistered(
      db,
      eventId,
      registrationData.userEmail
    );
    if (alreadyRegistered) {
      return new Response(
        JSON.stringify({ error: "Already registered for this event" }),
        { status: 400 }
      );
    }

    // Register the user
    const result = await registerForEvent(db, eventId, registrationData);

    const msg = {
      to: registrationData.userEmail,
      from: "rojnovyotam@gmail.com", // Replace with your verified sender email
      subject: "Event Registration Confirmation",
      html: `
        <html>
          <head>
            <title>Event Registration Confirmation</title>
          </head>
          <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
              
              <!-- Header with Logo -->
              <div style="padding: 30px; text-align: center; background-color: #6d28d9;">
                <img src="http://cdn.mcauto-images-production.sendgrid.net/166a852d5e3aaf3d/db2909f3-9ea0-4084-96c3-fb694316a999/800x800.png" alt="Event Logo" style="width: 100px; height: auto; border-radius: 8px;" />
              </div>

              <!-- Main Content -->
              <div style="padding: 30px;">
                <h1 style="color: #333333; font-size: 24px; margin-bottom: 16px;">Thank you for registering, ${
                  registrationData.name
                }!</h1>
                
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  You have successfully registered for the event. Below are your event details:
                </p>

                <!-- Event Details Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Event Name:</td>
                    <td style="padding: 12px; border: 1px solid #ddd; color: #555;">${
                      event.title
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Description:</td>
                    <td style="padding: 12px; border: 1px solid #ddd; color: #555;">${
                      event.description
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Date:</td>
                    <td style="padding: 12px; border: 1px solid #ddd; color: #555;">${new Date(
                      event.date
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Time:</td>
                    <td style="padding: 12px; border: 1px solid #ddd; color: #555;">${
                      event.time
                    }
                    </td>
                  </tr>
                </table>

                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                  We look forward to seeing you there! If you have any questions, feel free to contact us at 
                  <a href="mailto:info@fintechcalgary.com" style="color: #6d28d9; text-decoration: none;">info@fintechcalgary.com</a>.
                </p>
              </div>

              <!-- Footer with Website Link -->
              <div style="padding: 20px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #888888; margin: 0;">
                  Visit us at 
                  <a href="https://fintechcalgary.ca" target="_blank" style="color: #6d28d9; text-decoration: none;">fintechcalgary.ca</a>.
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    }; // Edit the website domain

    await sgMail.send(msg);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("POST /api/events/[eventId]/register - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
