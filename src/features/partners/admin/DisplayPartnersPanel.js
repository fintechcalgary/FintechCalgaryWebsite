"use client";

import { FiImage, FiPlus } from "react-icons/fi";
import Modal from "@/components/ui/Modal/ConfirmModal";
import PortalModal from "@/components/ui/Modal/ContentModal";
import PartnersGrid from "@/features/partners/PartnersGrid";
import { LoadingState } from "@/components/ui/Spinner";
import PanelSectionHeader from "@/features/partners/admin/PanelSectionHeader";
import DisplayPartnerForm from "@/features/partners/admin/DisplayPartnerForm";
import useDisplayPartners from "@/features/partners/admin/useDisplayPartners";

export default function DisplayPartnersPanel() {
  const {
    partners,
    setPartners,
    loading,
    formData,
    setFormData,
    logoFile,
    logoPreview,
    uploadingLogo,
    submitting,
    showAddModal,
    showEditModal,
    showDeleteModal,
    partnerToDelete,
    openAdd,
    openEdit,
    resetForm,
    askDelete,
    closeDeleteModal,
    handleLogoChange,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleDownloadLogo,
  } = useDisplayPartners();

  if (loading) {
    return <LoadingState />;
  }

  const formProps = {
    formData,
    setFormData,
    logoFile,
    logoPreview,
    uploadingLogo,
    submitting,
    onLogoChange: handleLogoChange,
    onCancel: resetForm,
  };

  return (
    <>
      <PanelSectionHeader
        title="Public partners"
        description="Add, edit, reorder, and remove partners shown on the public partners page"
        actions={
          <button
            onClick={openAdd}
            className="px-4 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            <FiPlus className="w-4 h-4 flex-shrink-0" />
            Add Partner
          </button>
        }
      />

      {partners.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-gray-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 px-4">
          <FiImage className="mx-auto text-3xl sm:text-4xl text-primary mb-3 sm:mb-4" />
          <p className="text-gray-400 text-base sm:text-lg mb-4">
            No partners yet
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm sm:text-base w-full max-w-xs mx-auto justify-center"
          >
            <FiPlus className="w-4 h-4 flex-shrink-0" />
            Add your first partner
          </button>
        </div>
      ) : (
        <PartnersGrid
          partners={partners}
          onPartnersChange={setPartners}
          onEdit={openEdit}
          onDelete={askDelete}
          onDownloadLogo={handleDownloadLogo}
        />
      )}

      <PortalModal
        isOpen={showAddModal}
        onClose={resetForm}
        title="Add Partner"
        maxWidth="max-w-[calc(100%-2rem)] sm:max-w-2xl"
      >
        <div className="p-4 sm:p-6">
          <DisplayPartnerForm
            {...formProps}
            onSubmit={handleAddSubmit}
            submitLabel="Create Partner"
          />
        </div>
      </PortalModal>

      <PortalModal
        isOpen={showEditModal}
        onClose={resetForm}
        title="Edit Partner"
        maxWidth="max-w-[calc(100%-2rem)] sm:max-w-2xl"
      >
        <div className="p-4 sm:p-6">
          <DisplayPartnerForm
            {...formProps}
            onSubmit={handleEditSubmit}
            submitLabel="Update Partner"
          />
        </div>
      </PortalModal>

      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Partner"
        message={`Are you sure you want to remove "${partnerToDelete?.name}" from the partners list?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
