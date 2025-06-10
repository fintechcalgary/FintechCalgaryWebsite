import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

import { updateMember, deleteMember } from "@/lib/models/member";

export async function GET(req, context) {
  try {
    const { memberId } = await context.params;
    const db = await connectToDatabase();

    const member = await db.collection("members").findOne({
      _id: new ObjectId(memberId),
    });

    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(member), { status: 200 });
  } catch (error) {
    console.error("GET /api/members/[memberId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { memberId } = await context.params;
    const db = await connectToDatabase();
    const updates = await req.json();

    if (updates.role && !["admin", "member"].includes(updates.role)) {
      return new Response(JSON.stringify({ error: "Invalid role value" }), {
        status: 400,
      });
    }

    const result = await updateMember(db, memberId, updates);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("PUT /api/members/[memberId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { memberId } = await context.params;
    const db = await connectToDatabase();

    // Delete from members collection
    await db.collection("members").deleteOne({
      _id: new ObjectId(memberId),
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/members/[memberId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
