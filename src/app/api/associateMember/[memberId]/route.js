import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

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

    // Validate the member exists
    const existingMember = await db.collection("associateMembers").findOne({
      _id: new ObjectId(memberId),
    });

    if (!existingMember) {
      return new Response(
        JSON.stringify({ error: "Associate member not found" }),
        {
          status: 404,
        }
      );
    }

    // Update the associate member
    const result = await db.collection("associateMembers").updateOne(
      { _id: new ObjectId(memberId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Associate member not found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("PUT /api/associateMember/[memberId] - Error:", error);
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

    // First get the associate member's details
    const member = await db.collection("associateMembers").findOne({
      _id: new ObjectId(memberId),
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Associate member not found" }),
        {
          status: 404,
        }
      );
    }

    // Delete from associateMembers collection
    await db.collection("associateMembers").deleteOne({
      _id: new ObjectId(memberId),
    });

    // Also delete from users collection using the organization email
    await db.collection("users").deleteOne({
      email: member.organizationEmail,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/associateMember/[memberId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
