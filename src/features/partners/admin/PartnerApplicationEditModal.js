"use client";

import PortalModal from "@/components/ui/Modal/ContentModal";
import PartnerForm from "@/features/partners/PartnerForm";
import {
  createPartnerFieldChangeHandler,
  PARTNER_FORM_MODE,
} from "@/features/partners/partnerFormFields";
import {
  PARTNER_APPLICATION_STATUS,
  PARTNER_APPLICATION_STATUS_OPTIONS,
} from "@/lib/constants";
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
          mode={PARTNER_FORM_MODE.ADMIN_EDIT}
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
                value={values.approvalStatus || PARTNER_APPLICATION_STATUS.PENDING}
                onChange={(e) =>
                  setValues({
                    ...values,
                    approvalStatus: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              >
                {PARTNER_APPLICATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {values.approvalStatus === PARTNER_APPLICATION_STATUS.ACCEPTED &&
                values.approvedAt && (
                <p className="text-muted mt-2">
                  Approved on {formatDateLocale(values.approvedAt)}
                </p>
              )}
            </div>
          }
        />
      </div>
    </PortalModal>
  );
}
