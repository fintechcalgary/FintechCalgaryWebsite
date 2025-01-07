import { connectToDatabase } from "@/lib/mongodb";
import { createMember, getMembers } from "@/lib/models/member";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import sgMail from "@sendgrid/mail";
import bcrypt from "bcryptjs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();
    const member = await req.json();

    // Check if email already exists
    const existingMember = await db
      .collection("members")
      .findOne({ email: member.email });
    if (existingMember) {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 400,
      });
    }

    // Create member and user account
    const result = await createMember(db, member);

    // Also add to users collection for authentication
    await db.collection("users").insertOne({
      email: member.email,
      password: await bcrypt.hash(member.password, 10),
      role: member.role || "member",
      createdAt: new Date(),
    });

    const msg = {
      to: member.email,
      from: "rojnovyotam@gmail.com", // Replace with your verified sender email
      subject: "Welcome to the Team!",
      html: `
        <html>
          <head>
            <title>Welcome to the Team!</title>
          </head>
          <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
              
              <!-- Header with Logo -->
              <div style="padding: 30px; text-align: center; background-color: #6d28d9;">
                <img src="https://i.imgur.com/zIfFdml.png" alt="Team Logo" style="width: 100px; height: auto; border-radius: 8px;" />
              </div>
    
              <!-- Main Content -->
              <div style="padding: 30px;">
                <h1 style="color: #333333; font-size: 24px; margin-bottom: 16px;">Welcome, ${member.name}!</h1>
                
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  You have been added to the team as a <strong>${member.role}</strong>. We are excited to have you on board!
                </p>
    
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  To get started, please visit <a href="https://fintechcalgary.ca/login" style="color: #6d28d9; text-decoration: none;">https://fintechcalgary.ca/login</a> and log in.
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
    };

    await sgMail.send(msg);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();
    const members = await getMembers(db);
    return new Response(JSON.stringify(members), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
