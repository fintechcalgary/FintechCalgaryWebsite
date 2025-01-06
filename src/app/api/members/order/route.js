import { connectToDatabase } from "@/lib/mongodb"; // To connect to the MongoDB database
import { updateMemberOrder } from "@/lib/models/member"; // Function to update the order of members
import { getServerSession } from "next-auth/next"; // To get the session for authentication
import { authOptions } from "../../auth/[...nextauth]/route"; // NextAuth options for session handling

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();
    const { orderedMemberIds } = await req.json();

    // Validate the input
    if (!Array.isArray(orderedMemberIds) || orderedMemberIds.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
      });
    }

    // Call function to update the order
    await updateMemberOrder(db, orderedMemberIds);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating member order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
