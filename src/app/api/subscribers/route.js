import { connectToDatabase } from "@/lib/mongodb";
import { createSubscriber, getSubscribers } from "@/lib/models/subscriber";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const POST = withErrorHandler(async (req) => {
  const subscriber = await req.json();

  // Validate required fields and email
  const validationError = validators.validateRequiredAndEmail(
    subscriber,
    ["name", "email"]
  );
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  const db = await connectToDatabase();
  logger.logUserAction("create_subscriber", { email: subscriber.email });
  const result = await createSubscriber(db, subscriber);

  return apiResponse.success(result, 201);
});

export const GET = withErrorHandler(async () => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const subscribers = await getSubscribers(db);

  return apiResponse.success(subscribers);
});
