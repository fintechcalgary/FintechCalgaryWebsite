import { connectToDatabase } from "@/lib/mongodb";
import { createSubscriber, getSubscribers } from "@/lib/models/subscriber";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * POST /api/subscribers - Create a new subscriber
 */
export async function POST(req) {
  try {
    const subscriber = await req.json();

    // Validate required fields
    if (!subscriber.email || !subscriber.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (email, name)" }),
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    console.log("POST /api/subscribers - Creating subscriber:", subscriber);

    const result = await createSubscriber(db, subscriber);
    console.log("POST /api/subscribers - Success:", result);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error("POST /api/subscribers - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

/**
 * GET /api/subscribers - Retrieve all subscribers (Admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      console.log("GET /api/subscribers - Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const db = await connectToDatabase();
    console.log("GET /api/subscribers - Fetching subscribers list");
    const subscribers = await getSubscribers(db);
    console.log(
      "GET /api/subscribers - Found subscribers:",
      subscribers.length
    );

    return new Response(JSON.stringify(subscribers), { status: 200 });
  } catch (error) {
    console.error("GET /api/subscribers - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
