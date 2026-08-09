"use client";

import PortalModal from "@/components/ui/Modal/ContentModal";
import PartnerForm from "@/features/partners/PartnerForm";
import { createPartnerFieldChangeHandler } from "@/features/partners/partnerFormFields";

export default function PartnerEditModal({
  isOpen,
  onClose,
  values,
  errors,
  setValues,
  setErrors,
  onSubmit,
  submitting,
}) {
  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Partner Information"
      maxWidth="max-w-4xl"
    >
      <div className="p-6">
        <PartnerForm
          mode="partner-edit"
          values={values}
          errors={errors}
          onChange={createPartnerFieldChangeHandler(setValues, setErrors)}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </PortalModal>
  );
}
