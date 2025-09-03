import { connectToDatabase } from "@/lib/mongodb";
import { createMember, getMembers } from "@/lib/models/member";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// Prevent caching
export const dynamic = "force-dynamic";

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

    // Create member (no password needed for regular members)
    const result = await db.collection("members").insertOne(member);

    // Return the result directly without creating user account
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
    return new Response(JSON.stringify(members), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        headers: { "Cache-Control": "no-store" },
      }),
      {
        status: 500,
      }
    );
  }
}
