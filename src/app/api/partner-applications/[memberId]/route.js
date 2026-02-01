import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/constants";

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

    let query = { _id: new ObjectId(memberId) };

    if (session.user.role === "associate") {
      const member = await db.collection(COLLECTIONS.PARTNER_APPLICATIONS).findOne({
        username: session.user.username,
      });

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
        });
      }

      query = { _id: member._id };
    }

    const member = await db.collection(COLLECTIONS.PARTNER_APPLICATIONS).findOne(query);

    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    const { password, ...memberData } = member;

    return new Response(JSON.stringify(memberData), { status: 200 });
  } catch (error) {
    console.error("GET /api/partner-applications/[memberId] - Error:", error);
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

    let memberQuery = { _id: new ObjectId(memberId) };

    if (session.user.role === "associate") {
      const member = await db.collection(COLLECTIONS.PARTNER_APPLICATIONS).findOne({
        username: session.user.username,
      });

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
        });
      }

      memberQuery = { _id: member._id };
    }

    const existingMember = await db
      .collection(COLLECTIONS.PARTNER_APPLICATIONS)
      .findOne(memberQuery);

    if (!existingMember) {
      return new Response(
        JSON.stringify({ error: "Partner application not found" }),
        {
          status: 404,
        }
      );
    }

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

      await db
        .collection("users")
        .updateOne(
          { email: existingMember.organizationEmail },
          { $set: { username: updates.username } }
        );
    }

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

    const result = await db
      .collection(COLLECTIONS.PARTNER_APPLICATIONS)
      .updateOne(memberQuery, {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      });

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Partner application not found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("PUT /api/partner-applications/[memberId] - Error:", error);
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

    const member = await db.collection(COLLECTIONS.PARTNER_APPLICATIONS).findOne({
      _id: new ObjectId(memberId),
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Partner application not found" }),
        {
          status: 404,
        }
      );
    }

    await db.collection(COLLECTIONS.PARTNER_APPLICATIONS).deleteOne({
      _id: new ObjectId(memberId),
    });

    await db.collection("users").deleteOne({
      email: member.organizationEmail,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/partner-applications/[memberId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
