import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

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
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { memberId } = context.params;
    const db = await connectToDatabase();
    const updates = await req.json();

    // If there's a password in the updates, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);

      // Update password in users collection too
      await db.collection("users").updateOne(
        { email: updates.email },
        {
          $set: {
            password: updates.password,
            email: updates.email, // Update email if it changed
          },
        }
      );
    } else {
      // If no new password, remove password field from updates
      delete updates.password;
    }

    // If email is being updated, check for uniqueness
    if (updates.email) {
      const existingMember = await db.collection("members").findOne({
        email: updates.email,
        _id: { $ne: new ObjectId(memberId) },
      });

      if (existingMember) {
        return new Response(JSON.stringify({ error: "Email already exists" }), {
          status: 400,
        });
      }

      // Update email in users collection
      await db.collection("users").updateOne(
        { email: updates.oldEmail }, // You'll need to send the old email in updates
        { $set: { email: updates.email } }
      );
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
    if (!session) {
      console.log("DELETE /api/members/[memberId] - Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { memberId } = await context.params;
    const db = await connectToDatabase();
    console.log("DELETE /api/members/[memberId] - Deleting member:", memberId);
    const result = await deleteMember(db, memberId);
    console.log("DELETE /api/members/[memberId] - Success:", result);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/members/[memberId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
