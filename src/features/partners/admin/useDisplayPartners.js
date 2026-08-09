"use client";

import { useState } from "react";
import { UPLOAD_FOLDERS } from "@/lib/constants";
import useAdminResource from "@/hooks/useAdminResource";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import useFileUpload from "@/hooks/useFileUpload";
import { downloadRemoteFile } from "@/lib/frontend-helpers";
import {
  INITIAL_DISPLAY_PARTNER_FORM,
  partnerToDisplayForm,
} from "@/features/partners/admin/displayPartnerFormFields";

/**
 * CRUD + form state for public display partners.
 */
export default function useDisplayPartners() {
  const {
    data: partners,
    setData: setPartners,
    loading,
  } = useAdminResource("/api/partners");
  const {
    isOpen: showDeleteModal,
    target: partnerToDelete,
    ask: askDelete,
    close: closeDeleteModal,
  } = useConfirmDelete();
  const { upload, uploading: uploadingLogo } = useFileUpload();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState(INITIAL_DISPLAY_PARTNER_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const resetForm = () => {
    setFormData(INITIAL_DISPLAY_PARTNER_FORM);
    setEditingPartner(null);
    setShowEditModal(false);
    setShowAddModal(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const openAdd = () => {
    setFormData(INITIAL_DISPLAY_PARTNER_FORM);
    setLogoFile(null);
    setLogoPreview(null);
    setShowAddModal(true);
  };

  const openEdit = (partner) => {
    setEditingPartner(partner);
    setFormData(partnerToDisplayForm(partner));
    setLogoFile(null);
    setLogoPreview(partner.logo || null);
    setShowEditModal(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, WebP, etc.).");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const resolveLogoUrl = async () => {
    if (!logoFile) return formData.logo;
    return upload(logoFile, UPLOAD_FOLDERS.PARTNER_DISPLAY_LOGOS);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      const logoUrl = await resolveLogoUrl();
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create partner");
      const created = await response.json();
      setPartners((prev) => [...prev, created]);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create partner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !editingPartner) return;
    try {
      setSubmitting(true);
      const logoUrl = await resolveLogoUrl();
      const response = await fetch(`/api/partners/${editingPartner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to update partner");
      const updated = await response.json();
      setPartners((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update partner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!partnerToDelete) return;
    try {
      const response = await fetch(`/api/partners/${partnerToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete partner");
      setPartners((prev) => prev.filter((p) => p._id !== partnerToDelete._id));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete partner.");
    }
  };

  const handleDownloadLogo = (partner) => {
    try {
      if (!partner.logo) {
        alert("No logo available for this partner.");
        return;
      }
      downloadRemoteFile(
        partner.logo,
        `${(partner.name || "partner").replace(/[^a-zA-Z0-9]/g, "_")}_logo.jpg`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to download logo.");
    }
  };

  return {
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
  };
}
