import { connectToDatabase } from "@/lib/mongodb";
import { updateEvent, deleteEvent } from "@/lib/models/event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("PUT /api/events/[eventId] - Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { eventId } = params;
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

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("DELETE /api/events/[eventId] - Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { eventId } = params;
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
