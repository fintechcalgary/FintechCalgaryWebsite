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
