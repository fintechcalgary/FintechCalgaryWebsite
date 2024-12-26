import { connectToDatabase } from "@/lib/mongodb";
import { updateEvent, deleteEvent } from "@/lib/models/event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(req, context) {
  try {
    const { eventId } = await context.params;
    const db = await connectToDatabase();

    const event = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
    });

    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(event), { status: 200 });
  } catch (error) {
    console.error("GET /api/events/[eventId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("PUT /api/events/[eventId] - Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { eventId } = await context.params;
    const db = await connectToDatabase();
    const updates = await req.json();
    console.log(
      "PUT /api/events/[eventId] - Updating event:",
      eventId,
      updates
    );
    const result = await updateEvent(db, eventId, updates);
    console.log("PUT /api/events/[eventId] - Success:", result);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("PUT /api/events/[eventId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("DELETE /api/events/[eventId] - Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { eventId } = await context.params;
    const db = await connectToDatabase();
    console.log("DELETE /api/events/[eventId] - Deleting event:", eventId);
    const result = await deleteEvent(db, eventId);
    console.log("DELETE /api/events/[eventId] - Success:", result);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/events/[eventId] - Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
