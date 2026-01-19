import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { COLLECTIONS } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "associate") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();

    // Find the partner by username
    const member = await db.collection(COLLECTIONS.PARTNERS).findOne({
      username: session.user.username,
    });

    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // Remove sensitive data before sending
    const { password, ...memberData } = member;

    return new Response(JSON.stringify(memberData), { status: 200 });
  } catch (error) {
    console.error("GET /api/partners/me - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
