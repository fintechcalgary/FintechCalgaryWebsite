import { connectToDatabase } from "@/lib/mongodb";
import { registerForEvent, isUserRegistered } from "@/lib/models/event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;
    const db = await connectToDatabase();

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
        <h1>Thank you for registering, ${registrationData.name}!</h1>
        <p>You have successfully registered for the event.</p>
        <p><strong>Event ID:</strong> ${eventId}</p>
        <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
        <p>We look forward to seeing you there!</p>
      `,
    };

    await sgMail.send(msg);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("POST /api/events/[eventId]/register - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
