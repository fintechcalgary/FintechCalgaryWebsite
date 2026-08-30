import { connectToDatabase } from "@/lib/mongodb";
import { apiResponse, requireAdmin, validators, withErrorHandler } from "@/lib/api-helpers";
import { STAFF_ROLE_LABELS, USER_ROLES, VALIDATION } from "@/lib/constants";
import { STAFF_ROLES } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function serializeUser(user) {
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    roleLabel: STAFF_ROLE_LABELS[user.role] || user.role,
    createdAt: user.createdAt,
  };
}

export const GET = withErrorHandler(async () => {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = await connectToDatabase();
  const users = await db
    .collection("users")
    .find({ role: { $in: STAFF_ROLES } })
    .project({ password: 0 })
    .sort({ createdAt: -1 })
    .toArray();

  return apiResponse.success(users.map(serializeUser));
});

export const POST = withErrorHandler(async (req) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { username, email, password, role } = body;

  const requiredError = validators.requiredFields(body, [
    "username",
    "email",
    "password",
    "role",
  ]);
  if (requiredError) return apiResponse.badRequest(requiredError);

  const emailError = validators.email(email);
  if (emailError) return apiResponse.badRequest(emailError);

  const passwordError = validators.password(password);
  if (passwordError) return apiResponse.badRequest(passwordError);

  const usernameError = validators.username(username);
  if (usernameError) return apiResponse.badRequest(usernameError);

  if (!STAFF_ROLES.includes(role)) {
    return apiResponse.badRequest(
      `Role must be one of: ${STAFF_ROLES.join(", ")}`,
    );
  }

  const db = await connectToDatabase();
  const existing = await db.collection("users").findOne({
    $or: [{ username }, { email }],
  });
  if (existing) {
    return apiResponse.badRequest("Username or email already exists");
  }

  const result = await db.collection("users").insertOne({
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    createdAt: new Date(),
  });

  const user = await db.collection("users").findOne(
    { _id: result.insertedId },
    { projection: { password: 0 } },
  );

  return apiResponse.success(serializeUser(user), 201);
});

export const PUT = withErrorHandler(async (req) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { userId, role, password } = body;

  if (!userId) return apiResponse.badRequest("userId is required");

  const db = await connectToDatabase();
  const { ObjectId } = await import("mongodb");

  const updates = {};
  if (role) {
    if (!STAFF_ROLES.includes(role)) {
      return apiResponse.badRequest(
        `Role must be one of: ${STAFF_ROLES.join(", ")}`,
      );
    }
    updates.role = role;
  }
  if (password) {
    const passwordError = validators.password(password);
    if (passwordError) return apiResponse.badRequest(passwordError);
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return apiResponse.badRequest(
        `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      );
    }
    updates.password = bcrypt.hashSync(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return apiResponse.badRequest("No updates provided");
  }

  const result = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updates },
    { returnDocument: "after", projection: { password: 0 } },
  );

  const user = result?.value ?? result;
  if (!user) return apiResponse.notFound("User not found");

  return apiResponse.success(serializeUser(user));
});
