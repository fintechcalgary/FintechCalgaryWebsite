import { connectToDatabase } from "@/lib/mongodb";
import { getPartners } from "@/lib/models/partner";
import bcrypt from "bcryptjs";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import { COLLECTIONS, ERROR_MESSAGES, VALIDATION } from "@/lib/constants";

export const POST = withErrorHandler(async (req) => {
  const db = await connectToDatabase();
  const organization = await req.json();

  // Validate required fields
  const requiredFields = ["organizationName", "username", "password"];
  const validationError = validators.requiredFields(
    organization,
    requiredFields
  );
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  // Validate password length
  const passwordError = validators.password(organization.password);
  if (passwordError) {
    return apiResponse.badRequest(passwordError);
  }

  // Validate username length
  const usernameError = validators.username(organization.username);
  if (usernameError) {
    return apiResponse.badRequest(usernameError);
  }

  // Check if organization already exists
  const existingMember = await db
    .collection(COLLECTIONS.PARTNER_APPLICATIONS)
    .findOne({ organizationName: organization.organizationName });

  if (existingMember) {
    return apiResponse.badRequest(ERROR_MESSAGES.ORGANIZATION_EXISTS);
  }

  // Check if username already exists in users collection
  const existingUser = await db
    .collection(COLLECTIONS.USERS)
    .findOne({ username: organization.username });

  if (existingUser) {
    return apiResponse.badRequest(ERROR_MESSAGES.USERNAME_EXISTS);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(organization.password, 10);

  // Create partner application document
  const memberDoc = {
    ...organization,
    password: hashedPassword,
    createdAt: new Date(),
    role: "associate",
    approvalStatus: "pending",
    approvedAt: null,
  };

  const result = await db.collection(COLLECTIONS.PARTNER_APPLICATIONS).insertOne(memberDoc);

  // Also create a user account for authentication
  await db.collection(COLLECTIONS.USERS).insertOne({
    username: organization.username,
    email: organization.organizationEmail,
    password: hashedPassword,
    role: "associate",
    createdAt: new Date(),
  });

  logger.logUserAction("create_partner_application", {
    organizationName: organization.organizationName,
  });

  return apiResponse.success(result, 201);
});

export const GET = withErrorHandler(async () => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const partners = await getPartners(db);
  return apiResponse.success(partners);
});
