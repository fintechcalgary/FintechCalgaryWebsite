import { connectToDatabase } from "@/lib/mongodb";
import { updateEvent, deleteEvent } from "@/lib/models/event";
import { apiResponse, requirePermission, withErrorHandler } from "@/lib/api-helpers";
import { PERMISSIONS } from "@/lib/permissions";
import logger from "@/lib/logger";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async (req, context) => {
  const { eventId } = await context.params;
  const db = await connectToDatabase();

  const event = await db.collection("events").findOne({
    _id: new ObjectId(eventId),
  });

  if (!event) {
    return apiResponse.notFound("Event not found");
  }

  return apiResponse.success(event);
});

export const PUT = withErrorHandler(async (req, context) => {
  const { error } = await requirePermission(PERMISSIONS.EVENTS);
  if (error) return error;

  const { eventId } = await context.params;
  const db = await connectToDatabase();
  const updates = await req.json();

  logger.logUserAction("update_event", { eventId });
  const result = await updateEvent(db, eventId, updates);

  return apiResponse.success(result);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const { error } = await requirePermission(PERMISSIONS.EVENTS);
  if (error) return error;

  const { eventId } = await context.params;
  const db = await connectToDatabase();

  logger.logUserAction("delete_event", { eventId });
  const result = await deleteEvent(db, eventId);

  return apiResponse.success(result);
});
