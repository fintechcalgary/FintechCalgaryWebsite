"use client";

import { useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPlus,
  FiXCircle,
} from "react-icons/fi";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AdminBackLink from "@/components/ui/AdminBackLink";
import { AdminPageHeader } from "@/components/layout/AdminPageShell";
import EmptyState from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, FILE_TYPES, MARKETING_APPROVAL_STATUS } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";
import { getMarketingStatusMeta } from "@/lib/statusBadges";

const MARKETING_STATUS_ICONS = {
  [MARKETING_APPROVAL_STATUS.PENDING]: FiClock,
  [MARKETING_APPROVAL_STATUS.APPROVED]: FiCheckCircle,
  [MARKETING_APPROVAL_STATUS.REJECTED]: FiXCircle,
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
        <LoadingState fullScreen />
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
      <main className="container relative mx-auto max-w-7xl animate-fadeIn px-6 py-8">
        <AdminBackLink />

        <AdminPageHeader
          title="Marketing Submissions"
          lede="Upload marketing content and partner approval proof for admin review"
          actions={
            <Button
              type="button"
              variant="soft"
              onClick={() => setShowFormModal(true)}
            >
              <FiPlus className="h-4 w-4" />
              New Submission
            </Button>
          }
        />

        {submissions.length === 0 ? (
          <EmptyState
            variant="admin"
            title="No submissions yet."
            action={
              <Button
                type="button"
                variant="soft"
                onClick={() => setShowFormModal(true)}
              >
                Create your first submission
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6">
            {submissions.map((item) => {
              const statusMeta = getMarketingStatusMeta(item.status);
              const StatusIcon =
                MARKETING_STATUS_ICONS[item.status] || FiClock;
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
                    <StatusBadge
                      tone={statusMeta.tone}
                      size="sm"
                      icon={StatusIcon}
                    >
                      {statusMeta.label}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <a
                      href={`${API_ENDPOINTS.MARKETING_APPROVALS}/${item._id}?file=content`}
                      className="fc-btn-chip"
                    >
                      <FiDownload className="w-4 h-4" />
                      Content
                    </a>
                    <a
                      href={`${API_ENDPOINTS.MARKETING_APPROVALS}/${item._id}?file=proof`}
                      className="fc-btn-chip"
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
            <label className="fc-form-label">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="fc-form-label">
              Partner name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.partnerName}
              onChange={(e) =>
                setFormData({ ...formData, partnerName: e.target.value })
              }
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="fc-form-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="form-input resize-none"
            />
          </div>
          <div>
            <label className="fc-form-label">
              Marketing content <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept={FILE_TYPES.MARKETING.EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => setContentFile(e.target.files?.[0] || null)}
              className="fc-file-input"
              required
            />
          </div>
          <div>
            <label className="fc-form-label">
              Partner approval proof (e.g. email) <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept={FILE_TYPES.MARKETING.EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="fc-file-input"
              required
            />
          </div>
          {formError && (
            <p className="fc-alert-error">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="cancel"
              onClick={() => setShowFormModal(false)}
              className="!flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="!flex-none"
            >
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </PortalModal>
    </div>
  );
}
