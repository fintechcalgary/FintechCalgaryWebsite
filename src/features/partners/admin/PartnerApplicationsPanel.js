"use client";

import { FiDownload } from "react-icons/fi";
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
          <button
            onClick={handleExportCsv}
            disabled={partners.length === 0}
            className="px-4 py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
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
