import { Binary, ObjectId } from "mongodb";
import { COLLECTIONS, CONTRACT_STATUS } from "@/lib/constants";

const CONTRACT_COLLECTION = COLLECTIONS.CONTRACTS;

// The PDF binary is only ever read through getEoiPdf; every other query
// excludes it so contract listings stay lightweight.
const EXCLUDE_PDF_DATA = { "eoiPdf.data": 0 };

export async function createContract(db, contract) {
  const now = new Date();
  return await db.collection(CONTRACT_COLLECTION).insertOne({
    title: contract.title,
    partnerName: contract.partnerName,
    description: contract.description || "",
    stage: 0,
    status: CONTRACT_STATUS.ACTIVE,
    approvals: [],
    eoiPdf: contract.eoiPdf || null,
    createdBy: contract.createdBy,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getContracts(db) {
  return await db
    .collection(CONTRACT_COLLECTION)
    .find({}, { projection: EXCLUDE_PDF_DATA })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getContract(db, contractId) {
  return await db
    .collection(CONTRACT_COLLECTION)
    .findOne({ _id: new ObjectId(contractId) }, { projection: EXCLUDE_PDF_DATA });
}

export async function updateContract(db, contractId, updates) {
  return await db
    .collection(CONTRACT_COLLECTION)
    .updateOne(
      { _id: new ObjectId(contractId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
}

export async function deleteContract(db, contractId) {
  return await db
    .collection(CONTRACT_COLLECTION)
    .deleteOne({ _id: new ObjectId(contractId) });
}

export function buildEoiPdf({ buffer, filename, contentType, size, uploadedBy }) {
  return {
    data: new Binary(buffer),
    filename,
    contentType,
    size,
    uploadedBy,
    uploadedAt: new Date(),
  };
}

export async function setEoiPdf(db, contractId, eoiPdf) {
  return await db
    .collection(CONTRACT_COLLECTION)
    .updateOne(
      { _id: new ObjectId(contractId) },
      { $set: { eoiPdf, updatedAt: new Date() } }
    );
}

export async function getEoiPdf(db, contractId) {
  const contract = await db
    .collection(CONTRACT_COLLECTION)
    .findOne(
      { _id: new ObjectId(contractId) },
      { projection: { eoiPdf: 1 } }
    );
  return contract?.eoiPdf || null;
}

export async function approveStage(db, contractId, approval, { isFinalStage }) {
  const update = {
    $push: { approvals: approval },
    $set: { updatedAt: new Date() },
  };

  if (isFinalStage) {
    update.$set.status = CONTRACT_STATUS.COMPLETED;
  } else {
    update.$inc = { stage: 1 };
  }

  return await db
    .collection(CONTRACT_COLLECTION)
    .updateOne({ _id: new ObjectId(contractId) }, update);
}

export async function markDoNotProceed(db, contractId, approval) {
  return await db.collection(CONTRACT_COLLECTION).updateOne(
    { _id: new ObjectId(contractId) },
    {
      $push: { approvals: approval },
      $set: { status: CONTRACT_STATUS.DO_NOT_PROCEED, updatedAt: new Date() },
    }
  );
}
