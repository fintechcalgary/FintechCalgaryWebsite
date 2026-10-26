import { connectToDatabase } from "@/lib/mongodb";
import {
  createCommunityPost,
  getCommunityPosts,
} from "@/lib/models/communityPost";
import {
  normalizeCommunityPostPayload,
  serializeCommunityPost,
  validateCommunityPostPayload,
} from "@/lib/communityPosts";
import {
  apiResponse,
  requirePermission,
  withErrorHandler,
} from "@/lib/api-helpers";
import logger from "@/lib/logger";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandler(async () => {
  const db = await connectToDatabase();
  const posts = await getCommunityPosts(db);
  return apiResponse.success(posts.map(serializeCommunityPost));
});

export const POST = withErrorHandler(async (req) => {
  const { session, error } = await requirePermission(PERMISSIONS.COMMUNITY);
  if (error) return error;

  const payload = normalizeCommunityPostPayload(await req.json());
  const validationError = validateCommunityPostPayload(payload);
  if (validationError) return apiResponse.badRequest(validationError);
  if (!session.user.id) return apiResponse.badRequest("Invalid session user");

  logger.logUserAction("create_community_post", { title: payload.title });

  const db = await connectToDatabase();
  const created = await createCommunityPost(db, {
    ...payload,
    createdById: session.user.id,
    createdByName: session.user.username || "",
    createdByRole: session.user.role || "",
  });

  return apiResponse.success(serializeCommunityPost(created), 201);
});
