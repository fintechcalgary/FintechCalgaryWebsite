import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import {
  getContract,
  updateContract,
  deleteContract,
} from "@/lib/models/contract";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EDITABLE_FIELDS = ["title", "partnerName", "description"];

export const GET = withErrorHandler(async (req, context) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { contractId } = await context.params;
  if (!ObjectId.isValid(contractId)) {
    return apiResponse.badRequest("Invalid contract id");
  }

  const db = await connectToDatabase();
  const contract = await getContract(db, contractId);

  if (!contract) {
    return apiResponse.notFound("Contract not found");
  }

  return apiResponse.success(contract);
});

export const PUT = withErrorHandler(async (req, context) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { contractId } = await context.params;
  if (!ObjectId.isValid(contractId)) {
    return apiResponse.badRequest("Invalid contract id");
  }

  const body = await req.json();

  // Only metadata is editable here; stage/status changes go through the
  // dedicated stage route so the approval history stays consistent.
  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (typeof body[field] === "string") {
      updates[field] = body[field].trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    return apiResponse.badRequest("No editable fields provided");
  }
  if (updates.title !== undefined && !updates.title) {
    return apiResponse.badRequest("Title cannot be empty");
  }
  if (updates.partnerName !== undefined && !updates.partnerName) {
    return apiResponse.badRequest("Partner name cannot be empty");
  }

  const db = await connectToDatabase();
  const existing = await getContract(db, contractId);
  if (!existing) {
    return apiResponse.notFound("Contract not found");
  }

  logger.logUserAction("update_contract", { contractId });
  await updateContract(db, contractId, updates);

  const contract = await getContract(db, contractId);
  return apiResponse.success(contract);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const { error } = await requireAdmin();
  if (error) return error;

  const { contractId } = await context.params;
  if (!ObjectId.isValid(contractId)) {
    return apiResponse.badRequest("Invalid contract id");
  }

  const db = await connectToDatabase();

  logger.logUserAction("delete_contract", { contractId });
  const result = await deleteContract(db, contractId);

  if (result.deletedCount === 0) {
    return apiResponse.notFound("Contract not found");
  }

  return apiResponse.success({ deleted: true });
});
