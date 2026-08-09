"use client";

import PortalModal from "@/components/ui/Modal/ContentModal";
import PartnerForm from "@/features/partners/PartnerForm";
import { createPartnerFieldChangeHandler } from "@/features/partners/partnerFormFields";
import { formatDateLocale } from "@/lib/dates";

export default function PartnerApplicationEditModal({
  isOpen,
  onClose,
  values,
  setValues,
  onSubmit,
  submitting,
}) {
  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Partner Application"
      maxWidth="max-w-4xl"
    >
      <div className="p-6">
        <PartnerForm
          mode="admin-edit"
          values={values}
          errors={{}}
          onChange={createPartnerFieldChangeHandler(setValues)}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
          beforeActions={
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Approval Status
              </h3>
              <select
                value={values.approvalStatus || "pending"}
                onChange={(e) =>
                  setValues({
                    ...values,
                    approvalStatus: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              {values.approvalStatus === "accepted" && values.approvedAt && (
                <p className="mt-2 text-sm text-gray-400">
                  Approved on{" "}
                  {formatDateLocale(values.approvedAt)}
                </p>
              )}
            </div>
          }
        />
      </div>
    </PortalModal>
  );
}
