import { connectToDatabase } from "@/lib/mongodb";
import { createMember, getMembers } from "@/lib/models/member";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

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

    // Check if username already exists
    const existingMember = await db
      .collection("members")
      .findOne({ username: member.username });

    console.log(existingMember);
    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "Username already exists" }),
        {
          status: 400,
        }
      );
    }

    // Create member and user account
    const result = await db.collection("members").insertOne(member);

    // Also add to users collection for authentication
    await db.collection("users").insertOne({
      username: member.username,
      password: await bcrypt.hash(member.password, 10),
      role: member.role || "member",
      createdAt: new Date(),
    });

    // Return the result directly without sending email
    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create member" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const members = await getMembers(db);
    return new Response(JSON.stringify(members), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
