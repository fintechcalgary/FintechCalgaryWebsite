import { connectToDatabase } from "@/lib/mongodb";
import {
  createAssociateMember,
  getAssociateMembers,
} from "@/lib/models/associateMember";

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

    // Create associate member
    const result = await db
      .collection("associateMembers")
      .insertOne(organization);

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
    const db = await connectToDatabase();
    const associateMembers = await getAssociateMembers(db);
    return new Response(JSON.stringify(associateMembers), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
