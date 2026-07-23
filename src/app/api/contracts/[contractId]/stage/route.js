import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import {
  getContract,
  approveStage,
  markDoNotProceed,
} from "@/lib/models/contract";
import { apiResponse, requireAdmin, withErrorHandler } from "@/lib/api-helpers";
import {
  CONTRACT_STAGES,
  CONTRACT_STATUS,
  CONTRACT_STAGE_ACTIONS,
  CONTRACT_EOI_STAGE_INDEX,
} from "@/lib/constants";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const POST = withErrorHandler(async (req, context) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { contractId } = await context.params;
  if (!ObjectId.isValid(contractId)) {
    return apiResponse.badRequest("Invalid contract id");
  }

  const { action, note } = await req.json();
  if (!Object.values(CONTRACT_STAGE_ACTIONS).includes(action)) {
    return apiResponse.badRequest("Invalid action");
  }

  const db = await connectToDatabase();
  const contract = await getContract(db, contractId);
  if (!contract) {
    return apiResponse.notFound("Contract not found");
  }

  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    return apiResponse.badRequest(
      "This contract is no longer active and cannot be moved"
    );
  }

  const approval = {
    stage: contract.stage,
    stageLabel: CONTRACT_STAGES[contract.stage]?.label || `Stage ${contract.stage + 1}`,
    action,
    approvedBy: session.user.username || session.user.email,
    approvedAt: new Date(),
    note: typeof note === "string" && note.trim() ? note.trim() : null,
  };

  if (action === CONTRACT_STAGE_ACTIONS.APPROVE) {
    // The EOI Submission stage cannot be approved until the PDF is attached.
    if (contract.stage >= CONTRACT_EOI_STAGE_INDEX && !contract.eoiPdf) {
      return apiResponse.badRequest(
        "Attach the EOI PDF before advancing past EOI Submission"
      );
    }

    const isFinalStage = contract.stage >= CONTRACT_STAGES.length - 1;
    logger.logUserAction("approve_contract_stage", {
      contractId,
      stage: contract.stage,
    });
    await approveStage(db, contractId, approval, { isFinalStage });
  } else {
    logger.logUserAction("contract_do_not_proceed", {
      contractId,
      stage: contract.stage,
    });
    await markDoNotProceed(db, contractId, approval);
  }

  const updated = await getContract(db, contractId);
  return apiResponse.success(updated);
});
