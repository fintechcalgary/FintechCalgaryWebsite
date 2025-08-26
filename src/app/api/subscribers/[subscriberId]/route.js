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

    const { subscriberId } = await params; // Await params as required by Next.js 15
    const db = await connectToDatabase();

    const result = await db
      .collection("subscribers")
      .deleteOne({ _id: new ObjectId(subscriberId) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Subscriber not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/subscribers/[subscriberId] - Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete subscriber" }),
      { status: 500 }
    );
  }
}
