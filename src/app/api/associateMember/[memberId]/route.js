import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { memberId } = await context.params;
    const db = await connectToDatabase();

    // For associate members, they can only access their own data
    // For admins, they can access any member's data
    let query = { _id: new ObjectId(memberId) };

    if (session.user.role === "associate") {
      // Associate members can only access their own data
      // We need to find the member by username since that's what we have in the session
      const member = await db.collection("associateMembers").findOne({
        username: session.user.username,
      });

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
        });
      }

      // Use the member's actual ID for the query
      query = { _id: member._id };
    }

    const member = await db.collection("associateMembers").findOne(query);

    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // Remove sensitive data before sending
    const { password, ...memberData } = member;

    return new Response(JSON.stringify(memberData), { status: 200 });
  } catch (error) {
    console.error("GET /api/associateMember/[memberId] - Error:", error);
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

    const { memberId } = await context.params;
    const db = await connectToDatabase();
    const updates = await req.json();

    // Determine which member to update based on user role
    let memberQuery = { _id: new ObjectId(memberId) };

    if (session.user.role === "associate") {
      // Associate members can only update their own data
      const member = await db.collection("associateMembers").findOne({
        username: session.user.username,
      });

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
        });
      }

      memberQuery = { _id: member._id };
    }

    // Validate the member exists
    const existingMember = await db
      .collection("associateMembers")
      .findOne(memberQuery);

    if (!existingMember) {
      return new Response(
        JSON.stringify({ error: "Associate member not found" }),
        {
          status: 404,
        }
      );
    }

    // If username is being updated, validate uniqueness
    if (updates.username && updates.username !== existingMember.username) {
      const existingUser = await db
        .collection("users")
        .findOne({ username: updates.username });

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Username already exists" }),
          {
            status: 400,
          }
        );
      }

      // Update username in users collection
      await db
        .collection("users")
        .updateOne(
          { email: existingMember.organizationEmail },
          { $set: { username: updates.username } }
        );
    }

    // If organization email is being updated, update the users collection
    if (
      updates.organizationEmail &&
      updates.organizationEmail !== existingMember.organizationEmail
    ) {
      await db
        .collection("users")
        .updateOne(
          { email: existingMember.organizationEmail },
          { $set: { email: updates.organizationEmail } }
        );
    }

    // Update the associate member
    const result = await db
      .collection("associateMembers")
      .updateOne(memberQuery, {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      });

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
