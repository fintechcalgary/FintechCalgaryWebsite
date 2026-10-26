import { connectToDatabase } from "@/lib/mongodb";
import {
  deleteCommunityPost,
  getCommunityPostById,
  isValidObjectId,
  updateCommunityPost,
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

async function requireExistingPost(postId) {
  if (!isValidObjectId(postId)) {
    return { error: apiResponse.badRequest("Invalid post id") };
  }

  const db = await connectToDatabase();
  const post = await getCommunityPostById(db, postId);
  if (!post) {
    return { error: apiResponse.notFound("Community post not found") };
  }

  return { db, post };
}

export const GET = withErrorHandler(async (_req, context) => {
  const { postId } = await context.params;
  const { post, error } = await requireExistingPost(postId);
  if (error) return error;
  return apiResponse.success(serializeCommunityPost(post));
});

export const PUT = withErrorHandler(async (req, context) => {
  const { error: authError } = await requirePermission(PERMISSIONS.COMMUNITY);
  if (authError) return authError;

  const { postId } = await context.params;
  const { db, error } = await requireExistingPost(postId);
  if (error) return error;

  const payload = normalizeCommunityPostPayload(await req.json());
  const validationError = validateCommunityPostPayload(payload);
  if (validationError) return apiResponse.badRequest(validationError);

  logger.logUserAction("update_community_post", { postId });
  await updateCommunityPost(db, postId, payload);

  const updated = await getCommunityPostById(db, postId);
  return apiResponse.success(serializeCommunityPost(updated));
});

export const DELETE = withErrorHandler(async (_req, context) => {
  const { error: authError } = await requirePermission(PERMISSIONS.COMMUNITY);
  if (authError) return authError;

  const { postId } = await context.params;
  const { db, error } = await requireExistingPost(postId);
  if (error) return error;

  logger.logUserAction("delete_community_post", { postId });
  await deleteCommunityPost(db, postId);
  return apiResponse.success({ deleted: true });
});
