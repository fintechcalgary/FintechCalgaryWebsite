"use client";

import { useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AdminBackLink from "@/components/ui/AdminBackLink";
import {
  AdminPageTitle,
  AdminPageLede,
} from "@/components/ui/SectionHeading";
import EmptyState from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, MARKETING_APPROVAL_STATUS } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";
import { getMarketingStatusMeta } from "@/lib/statusBadges";

const MARKETING_STATUS_ICONS = {
  [MARKETING_APPROVAL_STATUS.PENDING]: FiClock,
  [MARKETING_APPROVAL_STATUS.APPROVED]: FiCheckCircle,
  [MARKETING_APPROVAL_STATUS.REJECTED]: FiXCircle,
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
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          You don&apos;t have permission to review marketing submissions.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <AdminBackLink />

        <div className="mb-8 space-y-2">
          <AdminPageTitle>Marketing Approvals</AdminPageTitle>
          <AdminPageLede>
            Review marketing submissions and partner approval proof
          </AdminPageLede>
          {pendingCount > 0 ? (
            <p className="text-sm text-yellow-400">
              {pendingCount} submission{pendingCount !== 1 ? "s" : ""} awaiting
              review
            </p>
          ) : null}
        </div>

        {submissions.length === 0 ? (
          <EmptyState variant="admin">
            No marketing submissions to review.
          </EmptyState>
        ) : (
          <div className="grid gap-6">
            {submissions.map((item) => {
              const statusMeta = getMarketingStatusMeta(item.status);
              const StatusIcon =
                MARKETING_STATUS_ICONS[item.status] || FiClock;
              const isPending =
                item.status === MARKETING_APPROVAL_STATUS.PENDING;

              return (
                <div
                  key={item._id}
                  className="fc-admin-panel p-6"
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
                    <StatusBadge
                      tone={statusMeta.tone}
                      size="sm"
                      icon={StatusIcon}
                    >
                      {statusMeta.label}
                    </StatusBadge>
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
                      <Button
                        type="button"
                        variant="soft"
                        onClick={() => {
                          setReviewItem(item);
                          setReviewNote("");
                          setReviewError("");
                        }}
                      >
                        Review
                      </Button>
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
              <label className="fc-form-label">
                Review note (optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                className="form-input resize-none"
                placeholder="Add feedback for the marketing team..."
              />
            </div>
            {reviewError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {reviewError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="cancel"
                onClick={() => setReviewItem(null)}
                className="!flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  handleReview(MARKETING_APPROVAL_STATUS.REJECTED)
                }
                disabled={submitting}
                className="!flex-none"
              >
                <FiX className="w-4 h-4" />
                Reject
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={() =>
                  handleReview(MARKETING_APPROVAL_STATUS.APPROVED)
                }
                disabled={submitting}
                className="!flex-none"
              >
                <FiCheck className="w-4 h-4" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </PortalModal>
    </div>
  );
}
