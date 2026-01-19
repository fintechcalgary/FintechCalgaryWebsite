import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { memberId } = await params; // Await params as required by Next.js 15
    const db = await connectToDatabase();

    const result = await db
      .collection("generalMembers")
      .deleteOne({ _id: new ObjectId(memberId) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/members/[memberId] - Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete member" }),
      { status: 500 }
    );
  }
}

