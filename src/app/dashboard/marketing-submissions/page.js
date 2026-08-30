"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPlus,
  FiXCircle,
} from "react-icons/fi";
import PortalModal from "@/components/ui/Modal/ContentModal";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, FILE_TYPES, MARKETING_APPROVAL_STATUS } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";

const STATUS_BADGES = {
  [MARKETING_APPROVAL_STATUS.PENDING]: {
    label: "Pending Admin Review",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: FiClock,
  },
  [MARKETING_APPROVAL_STATUS.APPROVED]: {
    label: "Approved",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: FiCheckCircle,
  },
  [MARKETING_APPROVAL_STATUS.REJECTED]: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: FiXCircle,
  },
};

export default function MarketingSubmissionsPage() {
  const { loading: authLoading, canAccess } = useRoleAccess(
    PERMISSIONS.MARKETING_SUBMIT,
  );
  const { data: submissions, loading, refetch } = useRoleResource(
    API_ENDPOINTS.MARKETING_APPROVALS,
    PERMISSIONS.MARKETING_SUBMIT,
  );

  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    partnerName: "",
  });
  const [contentFile, setContentFile] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    if (!formData.title.trim() || !formData.partnerName.trim()) {
      setFormError("Title and partner name are required.");
      return;
    }
    if (!contentFile || !proofFile) {
      setFormError("Both marketing content and partner approval proof are required.");
      return;
    }

    try {
      setSubmitting(true);
      const body = new FormData();
      body.append("title", formData.title.trim());
      body.append("description", formData.description.trim());
      body.append("partnerName", formData.partnerName.trim());
      body.append("contentFile", contentFile);
      body.append("proofFile", proofFile);

      const response = await fetch(API_ENDPOINTS.MARKETING_APPROVALS, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit for approval");
      }

      setShowFormModal(false);
      setFormData({ title: "", description: "", partnerName: "" });
      setContentFile(null);
      setProofFile(null);
      await refetch();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          You don&apos;t have permission to submit marketing content.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Marketing Submissions</h1>
            <p className="text-gray-400 text-lg">
              Upload marketing content and partner approval proof for admin review
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all flex items-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <button
              onClick={() => setShowFormModal(true)}
              className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all flex items-center gap-2 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              New Submission
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/60 rounded-2xl border border-white/10 text-gray-400">
            <p className="mb-4">No submissions yet.</p>
            <button
              onClick={() => setShowFormModal(true)}
              className="px-6 py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary"
            >
              Create your first submission
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((item) => {
              const badge = STATUS_BADGES[item.status] || STATUS_BADGES.pending;
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={item._id}
                  className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Partner: {item.partnerName} · Submitted by {item.submittedBy}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-300 mt-2">
                          {item.description}
                        </p>
                      )}
                      {item.reviewNote && (
                        <p className="text-sm text-gray-400 mt-2 italic">
                          Admin note: {item.reviewNote}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${badge.className}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <a
                      href={`${API_ENDPOINTS.MARKETING_APPROVALS}/${item._id}?file=content`}
                      className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Content
                    </a>
                    <a
                      href={`${API_ENDPOINTS.MARKETING_APPROVALS}/${item._id}?file=proof`}
                      className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 text-sm flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Partner Proof
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PortalModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Submit Marketing Content"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
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
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
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
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Marketing content <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept={FILE_TYPES.MARKETING.EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => setContentFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Partner approval proof (e.g. email) <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept={FILE_TYPES.MARKETING.EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary"
              required
            />
          </div>
          {formError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-6 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </PortalModal>
    </div>
  );
}
