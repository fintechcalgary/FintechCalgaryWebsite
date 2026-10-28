"use client";

import { FiDownload } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal/ConfirmModal";
import PartnerApplicationEditModal from "@/features/partners/admin/PartnerApplicationEditModal";
import { LoadingState } from "@/components/ui/Spinner";
import PanelSectionHeader from "@/features/partners/admin/PanelSectionHeader";
import PartnerApplicationsStats from "@/features/partners/admin/PartnerApplicationsStats";
import PartnerApplicationsList from "@/features/partners/admin/PartnerApplicationsList";
import usePartnerApplications from "@/features/partners/admin/usePartnerApplications";

export default function PartnerApplicationsPanel({ onApplicationsChange }) {
  const {
    partners,
    loading,
    submitting,
    showEditModal,
    showDeleteModal,
    memberToDelete,
    editFormData,
    setEditFormData,
    openEdit,
    closeEdit,
    askDelete,
    closeDeleteModal,
    handleEditSubmit,
    handleApprovalStatusChange,
    handleDeleteConfirm,
    handleDownloadLogo,
    handleExportCsv,
  } = usePartnerApplications({ onApplicationsChange });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <PanelSectionHeader
        title="Partner applications"
        description="Review, approve, edit, and export organization signup applications"
        actions={
          <Button
            type="button"
            variant="success-soft"
            onClick={handleExportCsv}
            disabled={partners.length === 0}
            className="w-full sm:w-auto"
          >
            <FiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        }
      />

      <PartnerApplicationsStats partners={partners} />

      <PartnerApplicationsList
        partners={partners}
        onEdit={openEdit}
        onDelete={askDelete}
        onDownloadLogo={handleDownloadLogo}
        onApprovalStatusChange={handleApprovalStatusChange}
      />

      <PartnerApplicationEditModal
        isOpen={showEditModal}
        onClose={closeEdit}
        values={editFormData}
        setValues={setEditFormData}
        onSubmit={handleEditSubmit}
        submitting={submitting}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Partner"
        message={`Are you sure you want to delete ${memberToDelete?.organizationName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
