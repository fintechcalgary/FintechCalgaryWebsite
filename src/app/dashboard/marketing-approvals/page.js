"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import Navbar from "@/components/layout/AdminNavbar";
import PortalModal from "@/components/ui/Modal/ContentModal";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, MARKETING_APPROVAL_STATUS } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";

const STATUS_BADGES = {
  [MARKETING_APPROVAL_STATUS.PENDING]: {
    label: "Pending Review",
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

export default function MarketingApprovalsPage() {
  const { loading: authLoading, canAccess } = useRoleAccess(
    PERMISSIONS.MARKETING_APPROVE,
  );
  const { data: submissions, loading, refetch } = useRoleResource(
    `${API_ENDPOINTS.MARKETING_APPROVALS}?all=1`,
    PERMISSIONS.MARKETING_APPROVE,
  );

  const [reviewItem, setReviewItem] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReview = async (status) => {
    if (!reviewItem || submitting) return;

    try {
      setSubmitting(true);
      setReviewError("");
      const response = await fetch(
        `${API_ENDPOINTS.MARKETING_APPROVALS}/${reviewItem._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, reviewNote }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to review submission");
      }

      setReviewItem(null);
      setReviewNote("");
      await refetch();
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = submissions.filter(
    (s) => s.status === MARKETING_APPROVAL_STATUS.PENDING,
  ).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          You don&apos;t have permission to review marketing submissions.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Marketing Approvals</h1>
            <p className="text-gray-400 text-lg">
              Review marketing submissions and partner approval proof
            </p>
            {pendingCount > 0 && (
              <p className="text-yellow-400 text-sm">
                {pendingCount} submission{pendingCount !== 1 ? "s" : ""} awaiting
                review
              </p>
            )}
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all flex items-center gap-2 text-sm w-fit"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/60 rounded-2xl border border-white/10 text-gray-400">
            No marketing submissions to review.
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((item) => {
              const badge = STATUS_BADGES[item.status] || STATUS_BADGES.pending;
              const BadgeIcon = badge.icon;
              const isPending =
                item.status === MARKETING_APPROVAL_STATUS.PENDING;

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
                        Partner: {item.partnerName} · Submitted by{" "}
                        {item.submittedBy} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-300 mt-2">
                          {item.description}
                        </p>
                      )}
                      {item.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reviewed by {item.reviewedBy} on{" "}
                          {new Date(item.reviewedAt).toLocaleString()}
                          {item.reviewNote && ` — "${item.reviewNote}"`}
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
                  <div className="flex flex-wrap items-center gap-3 mt-4">
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
                    {isPending && (
                      <button
                        onClick={() => {
                          setReviewItem(item);
                          setReviewNote("");
                          setReviewError("");
                        }}
                        className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PortalModal
        isOpen={!!reviewItem}
        onClose={() => setReviewItem(null)}
        title="Review Marketing Submission"
        maxWidth="max-w-lg"
      >
        {reviewItem && (
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-300">
              Reviewing <span className="text-white font-medium">{reviewItem.title}</span>{" "}
              for partner {reviewItem.partnerName}.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Review note (optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white resize-none"
                placeholder="Add feedback for the marketing team..."
              />
            </div>
            {reviewError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {reviewError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReviewItem(null)}
                className="px-6 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleReview(MARKETING_APPROVAL_STATUS.REJECTED)
                }
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center gap-2 disabled:opacity-50"
              >
                <FiX className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() =>
                  handleReview(MARKETING_APPROVAL_STATUS.APPROVED)
                }
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 flex items-center gap-2 disabled:opacity-50"
              >
                <FiCheck className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        )}
      </PortalModal>
    </div>
  );
}
