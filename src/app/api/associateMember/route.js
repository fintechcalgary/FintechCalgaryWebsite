import { connectToDatabase } from "@/lib/mongodb";
import { getAssociateMembers } from "@/lib/models/associateMember";
import bcrypt from "bcryptjs";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

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
    return apiResponse.badRequest(
      `${validationError}: organizationName, username, and password are required`
    );
  }

  // Validate password length
  if (organization.password.length < 6) {
    return apiResponse.badRequest("Password must be at least 6 characters long");
  }

  // Validate username length
  if (organization.username.length < 3) {
    return apiResponse.badRequest("Username must be at least 3 characters long");
  }

  // Check if organization already exists
  const existingMember = await db
    .collection("associateMembers")
    .findOne({ organizationName: organization.organizationName });

  if (existingMember) {
    return apiResponse.badRequest("Organization already exists");
  }

  // Check if username already exists in users collection
  const existingUser = await db
    .collection("users")
    .findOne({ username: organization.username });

  if (existingUser) {
    return apiResponse.badRequest("Username already exists");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(organization.password, 10);

  // Create associate member document
  const memberDoc = {
    ...organization,
    password: hashedPassword,
    createdAt: new Date(),
    role: "associate",
    approvalStatus: "pending",
    approvedAt: null,
  };

  // Create associate member
  const result = await db.collection("associateMembers").insertOne(memberDoc);

  // Also create a user account for authentication
  await db.collection("users").insertOne({
    username: organization.username,
    email: organization.organizationEmail,
    password: hashedPassword,
    role: "associate",
    createdAt: new Date(),
  });

  logger.logUserAction("create_associate_member", {
    organizationName: organization.organizationName,
  });

  return apiResponse.success(result, 201);
});

export const GET = withErrorHandler(async () => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const associateMembers = await getAssociateMembers(db);
  return apiResponse.success(associateMembers);
});
