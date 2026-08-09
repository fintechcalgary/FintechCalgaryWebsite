"use client";

import { useState } from "react";
import useAdminResource from "@/hooks/useAdminResource";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import { downloadRemoteFile } from "@/lib/frontend-helpers";
import { exportPartnerApplicationsCsv } from "@/features/partners/admin/exportPartnerApplicationsCsv";
import {
  INITIAL_PARTNER_APPLICATION_FORM,
  memberToPartnerApplicationForm,
} from "@/features/partners/partnerFormFields";

/**
 * CRUD + approval + export state for partner organization applications.
 * @param {{ onApplicationsChange?: () => void }} [options]
 */
export default function usePartnerApplications(options = {}) {
  const { onApplicationsChange } = options;
  const {
    data: partners,
    setData: setPartners,
    loading,
    refetch,
  } = useAdminResource("/api/partner-applications");
  const {
    isOpen: showDeleteModal,
    target: memberToDelete,
    ask: askDelete,
    close: closeDeleteModal,
  } = useConfirmDelete();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState(
    INITIAL_PARTNER_APPLICATION_FORM
  );
  const [submitting, setSubmitting] = useState(false);

  const notifyChange = () => {
    onApplicationsChange?.();
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setEditFormData(memberToPartnerApplicationForm(member));
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditingMember(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !editingMember) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/partner-applications/${editingMember._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "Username already exists") {
          alert("Username already exists. Please choose a different username.");
          return;
        }
        throw new Error(data.error || "Failed to update partner");
      }

      await refetch();
      notifyChange();
      closeEdit();
    } catch (error) {
      console.error("Error updating partner:", error);
      alert("Failed to update partner. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovalStatusChange = async (memberId, newStatus) => {
    try {
      const response = await fetch(`/api/partner-applications/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: newStatus,
          approvedAt: newStatus === "accepted" ? new Date() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update approval status");
      }

      await refetch();
      notifyChange();
    } catch (error) {
      console.error("Error updating approval status:", error);
      alert("Failed to update approval status. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(
        `/api/partner-applications/${memberToDelete._id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete partner");
      }

      setPartners((prev) => prev.filter((m) => m._id !== memberToDelete._id));
      closeDeleteModal();
      notifyChange();
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Failed to delete partner. Please try again.");
    }
  };

  const handleDownloadLogo = (member) => {
    try {
      if (!member.logo) {
        alert("No logo available for this member.");
        return;
      }

      const urlParts = member.logo.split("/");
      const filename = urlParts[urlParts.length - 1];
      const cleanFilename = filename.includes(".")
        ? filename
        : `${member.organizationName.replace(/[^a-zA-Z0-9]/g, "_")}_logo.jpg`;

      downloadRemoteFile(member.logo, cleanFilename);
    } catch (error) {
      console.error("Error downloading logo:", error);
      alert("Failed to download logo. Please try again.");
    }
  };

  const handleExportCsv = () => {
    exportPartnerApplicationsCsv(partners);
  };

  return {
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
  };
}
