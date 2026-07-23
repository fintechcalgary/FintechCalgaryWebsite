"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiFileText,
  FiTrash2,
  FiEdit2,
  FiExternalLink,
  FiUpload,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import PortalModal from "@/components/PortalModal";
import ContractPipeline from "@/components/ContractPipeline";
import {
  API_ENDPOINTS,
  CONTRACT_STAGES,
  CONTRACT_STATUS,
  CONTRACT_STAGE_ACTIONS,
  CONTRACT_EOI_STAGE_INDEX,
  FILE_TYPES,
} from "@/lib/constants";

const EMPTY_FORM = { title: "", partnerName: "", description: "" };

const STATUS_BADGES = {
  [CONTRACT_STATUS.ACTIVE]: {
    label: "In Progress",
    className: "bg-primary/20 text-primary border-primary/30",
    icon: FiClock,
  },
  [CONTRACT_STATUS.COMPLETED]: {
    label: "Completed",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: FiCheckCircle,
  },
  [CONTRACT_STATUS.DO_NOT_PROCEED]: {
    label: "Do Not Proceed",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: FiXCircle,
  },
};

function validatePdfFile(file) {
  if (!FILE_TYPES.PDF.MIME_TYPES.includes(file.type)) {
    return "The EOI file must be a PDF.";
  }
  if (file.size > FILE_TYPES.PDF.MAX_SIZE) {
    return `The EOI file must be less than ${
      FILE_TYPES.PDF.MAX_SIZE / (1024 * 1024)
    }MB.`;
  }
  return null;
}

export default function ContractsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formFile, setFormFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Stage action modal (approve / do-not-proceed)
  const [stageAction, setStageAction] = useState(null); // { contract, action }
  const [stageNote, setStageNote] = useState("");
  const [stageError, setStageError] = useState("");
  const [stageSubmitting, setStageSubmitting] = useState(false);

  // Delete modal
  const [contractToDelete, setContractToDelete] = useState(null);

  // EOI PDF attach/replace
  const pdfInputRef = useRef(null);
  const pdfTargetIdRef = useRef(null);
  const [uploadingId, setUploadingId] = useState(null);

  const [expandedHistories, setExpandedHistories] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    document.title = "Contracts | FinTech Calgary";
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.CONTRACTS);
        if (response.ok) {
          const data = await response.json();
          setContracts(data);
        } else if (response.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchContracts();
    } else if (session && session.user.role !== "admin") {
      setLoading(false);
    }
  }, [session, router]);

  const replaceContractInList = (updated) => {
    setContracts((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );
  };

  const openCreateModal = () => {
    setEditingContract(null);
    setFormData(EMPTY_FORM);
    setFormFile(null);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (contract) => {
    setEditingContract(contract);
    setFormData({
      title: contract.title || "",
      partnerName: contract.partnerName || "",
      description: contract.description || "",
    });
    setFormFile(null);
    setFormError("");
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    if (!formData.title.trim() || !formData.partnerName.trim()) {
      setFormError("Title and partner name are required.");
      return;
    }

    try {
      setSubmitting(true);

      let response;
      if (editingContract) {
        response = await fetch(
          `${API_ENDPOINTS.CONTRACTS}/${editingContract._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
      } else {
        const body = new FormData();
        body.append("title", formData.title.trim());
        body.append("partnerName", formData.partnerName.trim());
        body.append("description", formData.description.trim());
        if (formFile) {
          body.append("eoiPdf", formFile);
        }
        response = await fetch(API_ENDPOINTS.CONTRACTS, {
          method: "POST",
          body,
        });
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save contract");
      }

      if (editingContract) {
        const updated = await response.json();
        replaceContractInList(updated);
      } else {
        const listResponse = await fetch(API_ENDPOINTS.CONTRACTS);
        if (listResponse.ok) {
          setContracts(await listResponse.json());
        }
      }

      setShowFormModal(false);
      setEditingContract(null);
      setFormData(EMPTY_FORM);
      setFormFile(null);
    } catch (error) {
      console.error("Error saving contract:", error);
      setFormError(error.message || "Failed to save contract. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormFile(null);
      return;
    }
    const error = validatePdfFile(file);
    if (error) {
      setFormError(error);
      e.target.value = "";
      setFormFile(null);
      return;
    }
    setFormError("");
    setFormFile(file);
  };

  const openStageModal = (contract, action) => {
    setStageAction({ contract, action });
    setStageNote("");
    setStageError("");
  };

  const handleStageConfirm = async () => {
    if (!stageAction || stageSubmitting) return;

    try {
      setStageSubmitting(true);
      setStageError("");
      const response = await fetch(
        `${API_ENDPOINTS.CONTRACTS}/${stageAction.contract._id}/stage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: stageAction.action, note: stageNote }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update contract stage");
      }

      const updated = await response.json();
      replaceContractInList(updated);
      setStageAction(null);
      setStageNote("");
    } catch (error) {
      console.error("Error updating contract stage:", error);
      setStageError(error.message || "Failed to update contract stage.");
    } finally {
      setStageSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CONTRACTS}/${contractToDelete._id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete contract");
      }
      setContracts((prev) =>
        prev.filter((c) => c._id !== contractToDelete._id)
      );
      setContractToDelete(null);
    } catch (error) {
      console.error("Error deleting contract:", error);
      alert("Failed to delete contract. Please try again.");
    }
  };

  const triggerPdfUpload = (contract) => {
    pdfTargetIdRef.current = contract._id;
    pdfInputRef.current?.click();
  };

  const handlePdfFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const contractId = pdfTargetIdRef.current;
    e.target.value = "";
    if (!file || !contractId) return;

    const error = validatePdfFile(file);
    if (error) {
      alert(error);
      return;
    }

    try {
      setUploadingId(contractId);
      const body = new FormData();
      body.append("eoiPdf", file);
      const response = await fetch(
        `${API_ENDPOINTS.CONTRACTS}/${contractId}/eoi`,
        { method: "PUT", body }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload EOI PDF");
      }

      const updated = await response.json();
      replaceContractInList(updated);
    } catch (error) {
      console.error("Error uploading EOI PDF:", error);
      alert(error.message || "Failed to upload the EOI PDF. Please try again.");
    } finally {
      setUploadingId(null);
      pdfTargetIdRef.current = null;
    }
  };

  const toggleHistory = (contractId) => {
    setExpandedHistories((prev) => ({
      ...prev,
      [contractId]: !prev[contractId],
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <FiFileText className="mx-auto text-4xl text-primary mb-4" />
              <p className="text-gray-400">
                You don&apos;t have permission to view contracts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = contracts.filter(
    (c) => c.status === CONTRACT_STATUS.ACTIVE
  ).length;
  const completedCount = contracts.filter(
    (c) => c.status === CONTRACT_STATUS.COMPLETED
  ).length;
  const haltedCount = contracts.filter(
    (c) => c.status === CONTRACT_STATUS.DO_NOT_PROCEED
  ).length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Contracts</h1>
            <p className="text-gray-400 text-lg">
              Track contracts through the approvals pipeline, from outreach to
              execution
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              New Contract
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">
                  Total Contracts
                </p>
                <p className="text-3xl font-bold text-white">
                  {contracts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <FiFileText className="text-primary text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-white">{activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <FiClock className="text-purple-400 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white">
                  {completedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <FiCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">
                  Do Not Proceed
                </p>
                <p className="text-3xl font-bold text-white">{haltedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <FiXCircle className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <p className="text-xs text-gray-500 mb-6">
          EOI = Expression of Interest. All approvals are required in sequence.
        </p>

        {/* Contracts list */}
        {contracts.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
            <FiFileText className="mx-auto text-4xl text-primary mb-4" />
            <p className="text-gray-400 text-lg mb-6">No contracts yet</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300 inline-flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Create your first contract
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {contracts.map((contract, index) => {
              const badge =
                STATUS_BADGES[contract.status] ||
                STATUS_BADGES[CONTRACT_STATUS.ACTIVE];
              const BadgeIcon = badge.icon;
              const isActive = contract.status === CONTRACT_STATUS.ACTIVE;
              const currentStage = CONTRACT_STAGES[contract.stage];
              const isFinalStage =
                contract.stage >= CONTRACT_STAGES.length - 1;
              const needsPdf =
                contract.stage >= CONTRACT_EOI_STAGE_INDEX && !contract.eoiPdf;
              const historyOpen = !!expandedHistories[contract._id];
              const approvals = contract.approvals || [];

              return (
                <motion.div
                  key={contract._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                >
                  {/* Card header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                        <FiFileText className="text-primary text-xl" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {contract.partnerName} · Created{" "}
                          {new Date(contract.createdAt).toLocaleDateString()}
                          {contract.createdBy ? ` by ${contract.createdBy}` : ""}
                        </p>
                        {contract.description && (
                          <p className="text-sm text-gray-300 mt-2">
                            {contract.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${badge.className}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                      <button
                        onClick={() => openEditModal(contract)}
                        className="text-gray-400 hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20"
                        title="Edit contract"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setContractToDelete(contract)}
                        className="text-gray-400 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        title="Delete contract"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pipeline */}
                  <div className="mb-6">
                    <ContractPipeline
                      stage={contract.stage}
                      status={contract.status}
                    />
                  </div>

                  {/* Current stage details */}
                  {isActive && currentStage && (
                    <div className="mb-6 p-4 rounded-xl bg-gray-800/40 border border-gray-700/40">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Current stage · Responsible: {currentStage.role}
                      </p>
                      <p className="text-sm text-white font-medium">
                        {contract.stage + 1}. {currentStage.label}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {currentStage.description}
                      </p>
                    </div>
                  )}

                  {/* EOI PDF + actions row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {contract.eoiPdf ? (
                        <>
                          <a
                            href={`${API_ENDPOINTS.CONTRACTS}/${contract._id}/eoi`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all duration-300 flex items-center gap-2 text-sm"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            View EOI PDF
                          </a>
                          <span className="text-xs text-gray-500">
                            {contract.eoiPdf.filename}
                            {contract.eoiPdf.uploadedAt &&
                              ` · uploaded ${new Date(
                                contract.eoiPdf.uploadedAt
                              ).toLocaleDateString()}`}
                          </span>
                          <button
                            onClick={() => triggerPdfUpload(contract)}
                            disabled={uploadingId === contract._id}
                            className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 transition-all duration-300 flex items-center gap-2 text-xs disabled:opacity-50"
                          >
                            <FiUpload className="w-3.5 h-3.5" />
                            {uploadingId === contract._id
                              ? "Uploading..."
                              : "Replace"}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-yellow-400/90 flex items-center gap-2">
                            <FiFileText className="w-4 h-4" />
                            No EOI PDF attached
                          </span>
                          <button
                            onClick={() => triggerPdfUpload(contract)}
                            disabled={uploadingId === contract._id}
                            className="px-4 py-2 rounded-lg bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-600/30 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50"
                          >
                            <FiUpload className="w-4 h-4" />
                            {uploadingId === contract._id
                              ? "Uploading..."
                              : "Attach EOI PDF"}
                          </button>
                        </>
                      )}
                    </div>

                    {isActive && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() =>
                            openStageModal(
                              contract,
                              CONTRACT_STAGE_ACTIONS.APPROVE
                            )
                          }
                          disabled={needsPdf}
                          title={
                            needsPdf
                              ? "Attach the EOI PDF before advancing past EOI Submission"
                              : undefined
                          }
                          className="px-4 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FiCheck className="w-4 h-4" />
                          {isFinalStage ? "Approve & Complete" : "Approve & Advance"}
                        </button>
                        <button
                          onClick={() =>
                            openStageModal(
                              contract,
                              CONTRACT_STAGE_ACTIONS.DO_NOT_PROCEED
                            )
                          }
                          className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all duration-300 flex items-center gap-2 text-sm"
                        >
                          <FiX className="w-4 h-4" />
                          Do Not Proceed
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Approval history */}
                  {approvals.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-800/60">
                      <button
                        onClick={() => toggleHistory(contract._id)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {historyOpen ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                        Approval history ({approvals.length})
                      </button>
                      {historyOpen && (
                        <ul className="mt-3 space-y-2">
                          {approvals.map((entry, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-sm p-3 rounded-lg bg-gray-800/30 border border-gray-700/30"
                            >
                              {entry.action ===
                              CONTRACT_STAGE_ACTIONS.DO_NOT_PROCEED ? (
                                <FiXCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <FiCheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-white">
                                  {entry.action ===
                                  CONTRACT_STAGE_ACTIONS.DO_NOT_PROCEED
                                    ? "Marked Do Not Proceed at"
                                    : "Approved"}{" "}
                                  <span className="font-medium">
                                    {entry.stageLabel}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  {entry.approvedBy} ·{" "}
                                  {new Date(entry.approvedAt).toLocaleString()}
                                </p>
                                {entry.note && (
                                  <p className="text-xs text-gray-300 mt-1 italic">
                                    &ldquo;{entry.note}&rdquo;
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Hidden file input for attach/replace EOI PDF */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfFileSelected}
      />

      {/* Create / edit modal */}
      <PortalModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingContract ? "Edit Contract" : "New Contract"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Sponsorship Agreement 2026"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Partner name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.partnerName}
              onChange={(e) =>
                setFormData({ ...formData, partnerName: e.target.value })
              }
              placeholder="Organization this contract is with"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional notes about this contract"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            />
          </div>

          {!editingContract && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                EOI PDF (optional, max 5MB)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFormFileChange}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:transition-all file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                You can also attach or replace the EOI PDF later. The contract
                cannot advance past EOI Submission without it.
              </p>
            </div>
          )}

          {formError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl transition-all duration-200 font-medium text-sm border border-gray-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium text-sm shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editingContract
                ? "Save Changes"
                : "Create Contract"}
            </button>
          </div>
        </form>
      </PortalModal>

      {/* Stage action modal */}
      <PortalModal
        isOpen={!!stageAction}
        onClose={() => setStageAction(null)}
        title={
          stageAction?.action === CONTRACT_STAGE_ACTIONS.APPROVE
            ? "Approve Stage"
            : "Do Not Proceed"
        }
        maxWidth="max-w-lg"
      >
        {stageAction && (
          <div className="p-6 space-y-5">
            {stageAction.action === CONTRACT_STAGE_ACTIONS.APPROVE ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-gray-300">
                  You are approving{" "}
                  <span className="text-white font-medium">
                    {CONTRACT_STAGES[stageAction.contract.stage]?.label}
                  </span>{" "}
                  for{" "}
                  <span className="text-white font-medium">
                    {stageAction.contract.title}
                  </span>
                  .
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {stageAction.contract.stage >= CONTRACT_STAGES.length - 1
                    ? "This is the final stage — the contract will be marked as completed."
                    : `The contract will move to "${
                        CONTRACT_STAGES[stageAction.contract.stage + 1]?.label
                      }".`}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-gray-300">
                  You are marking{" "}
                  <span className="text-white font-medium">
                    {stageAction.contract.title}
                  </span>{" "}
                  as{" "}
                  <span className="text-red-400 font-medium">
                    Do Not Proceed
                  </span>{" "}
                  at the{" "}
                  <span className="text-white font-medium">
                    {CONTRACT_STAGES[stageAction.contract.stage]?.label}
                  </span>{" "}
                  stage.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  The process ends here. The contract record and its history
                  will be kept.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Note (optional)
              </label>
              <textarea
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="Add context for this decision..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              />
            </div>

            {stageError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {stageError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStageAction(null)}
                className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl transition-all duration-200 font-medium text-sm border border-gray-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleStageConfirm}
                disabled={stageSubmitting}
                className={`px-6 py-3 rounded-xl text-white font-medium text-sm shadow-lg transition-all duration-200 disabled:opacity-50 ${
                  stageAction.action === CONTRACT_STAGE_ACTIONS.APPROVE
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/20"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20"
                }`}
              >
                {stageSubmitting
                  ? "Saving..."
                  : stageAction.action === CONTRACT_STAGE_ACTIONS.APPROVE
                  ? "Confirm Approval"
                  : "Confirm Do Not Proceed"}
              </button>
            </div>
          </div>
        )}
      </PortalModal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!contractToDelete}
        onClose={() => setContractToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contract"
        message={`Are you sure you want to delete "${contractToDelete?.title}"? This will permanently remove the contract, its approval history, and its EOI PDF.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
