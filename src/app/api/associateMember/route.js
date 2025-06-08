import { connectToDatabase } from "@/lib/mongodb";
import {
  createAssociateMember,
  getAssociateMembers,
} from "@/lib/models/associateMember";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const db = await connectToDatabase();
    const organization = await req.json();

    // Check if organization already exists
    const existingMember = await db
      .collection("associateMembers")
      .findOne({ organizationName: organization.organizationName });

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "Organization already exists" }),
        {
          status: 400,
        }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(organization.password, 10);

    // Create associate member document
    const memberDoc = {
      ...organization,
      password: hashedPassword,
      createdAt: new Date(),
      role: "associate",
    };

    // Create associate member
    const result = await db.collection("associateMembers").insertOne(memberDoc);

    // Also create a user account for authentication
    await db.collection("users").insertOne({
      username: organization.organizationName
        .toLowerCase()
        .replace(/\s+/g, "_"),
      email: organization.organizationEmail,
      password: hashedPassword,
      role: "associate",
      createdAt: new Date(),
    });

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create associate member",
      }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();
    const associateMembers = await getAssociateMembers(db);
    return new Response(JSON.stringify(associateMembers), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
