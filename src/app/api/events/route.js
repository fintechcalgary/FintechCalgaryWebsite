import { connectToDatabase } from "@/lib/mongodb";
import { createEvent } from "@/lib/models/event";
import { apiResponse, requireAuth, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requireAuth();
  if (error) return error;

  const db = await connectToDatabase();
  const event = await req.json();

  event.ownerId = session.user.id;
  if (!event.ownerId) {
    return apiResponse.badRequest("Invalid session user");
  }

  // Validate required fields
  const requiredFields = ["title", "description", "date", "time", "isPartner"];
  const validationError = validators.requiredFields(event, requiredFields);
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  logger.logUserAction("create_event", { eventTitle: event.title });
  const result = await createEvent(db, event);

  return apiResponse.success(result, 201);
});

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const events = await db
    .collection("events")
    .find({})
    .sort({ date: 1 })
    .toArray();

  return apiResponse.success(events);
});
