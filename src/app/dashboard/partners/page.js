"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiImage,
  FiDownload,
  FiTrash2,
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiUpload,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import PortalModal from "@/components/PortalModal";
import PartnersGrid from "@/components/PartnersGrid";
import Image from "next/image";
import Link from "next/link";
import { UPLOAD_FOLDERS } from "@/lib/constants";

const INITIAL_FORM = {
  name: "",
  description: "",
  website: "",
  color: "#8b5cf6",
  logo: "",
};

export default function AddPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    document.title = "Add Partners | FinTech Calgary";
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/partners");
        if (response.ok) {
          const data = await response.json();
          setPartners(data);
        }
      } catch (error) {
        console.error("Failed to fetch partners:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchPartners();
    } else if (session && session.user.role !== "admin") {
      setLoading(false);
    }
  }, [session]);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingPartner(null);
    setShowEditModal(false);
    setShowAddModal(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const openAdd = () => {
    setFormData(INITIAL_FORM);
    setLogoFile(null);
    setLogoPreview(null);
    setShowAddModal(true);
  };

  const openEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || "",
      description: partner.description || "",
      website: partner.website || "",
      color: partner.color || "#8b5cf6",
      logo: partner.logo || "",
    });
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
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const uploadLogoToCloudinary = async () => {
    if (!logoFile) return formData.logo;

    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append("file", logoFile);
      form.append("folder", UPLOAD_FOLDERS.PARTNER_DISPLAY_LOGOS);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      return data.url;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      let logoUrl = formData.logo;
      if (logoFile) {
        logoUrl = await uploadLogoToCloudinary();
      }
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
      let logoUrl = formData.logo;
      if (logoFile) {
        logoUrl = await uploadLogoToCloudinary();
      }
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

  const handleDeleteClick = (partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partnerToDelete) return;
    try {
      const response = await fetch(`/api/partners/${partnerToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete partner");
      setPartners((prev) => prev.filter((p) => p._id !== partnerToDelete._id));
      setShowDeleteModal(false);
      setPartnerToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete partner.");
    }
  };

  const handleDownloadLogo = (partner) => {
    if (!partner.logo) {
      alert("No logo available for this partner.");
      return;
    }
    const link = document.createElement("a");
    link.href = partner.logo;
    link.download = `${(partner.name || "partner").replace(/[^a-zA-Z0-9]/g, "_")}_logo.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
            <div className="text-center px-4">
              <FiImage className="mx-auto text-3xl sm:text-4xl text-primary mb-3 sm:mb-4" />
              <p className="text-gray-400">
                You don&apos;t have permission to view this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderPartnerForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Partner name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Accent color
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Used for the partner card highlight on the public page. Pick a color or enter a hex code.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={formData.color?.startsWith("#") ? formData.color : `#${formData.color || "8b5cf6"}`}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
              className="w-10 h-10 min-w-[2.5rem] rounded border border-gray-700 cursor-pointer bg-transparent flex-shrink-0"
              title="Pick color"
            />
            <input
              type="text"
              value={formData.color?.startsWith("#") ? formData.color : formData.color ? `#${formData.color}` : ""}
              onChange={(e) => {
                let v = e.target.value.trim();
                if (v && !v.startsWith("#")) v = "#" + v;
                setFormData((prev) => ({ ...prev, color: v || "#8b5cf6" }));
              }}
              className="w-full min-w-[11rem] sm:min-w-[14rem] max-w-xs px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500 text-sm sm:text-base"
              placeholder="Hexcode"
              aria-label="Accent color hex code"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Short description of the partner"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Logo
        </label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {(logoPreview || formData.logo) && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
              <Image
                src={logoPreview || formData.logo}
                alt="Logo preview"
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50 cursor-pointer transition-all inline-flex items-center gap-2 w-fit">
              <FiUpload className="w-4 h-4" />
              {logoFile ? "Change image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
            {uploadingLogo && (
              <span className="text-sm text-primary">Uploading...</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={resetForm}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploadingLogo}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FiEdit2 className="w-4 h-4 flex-shrink-0" />
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="space-y-1 sm:space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">Add Partners</h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
              Add and manage partners shown on the public partners page
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              <FiArrowLeft className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={openAdd}
              className="px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              <FiPlus className="w-4 h-4 flex-shrink-0" />
              Add Partner
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  Total Partners
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{partners.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/30 flex-shrink-0">
                <FiImage className="text-primary text-lg sm:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {partners.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 px-4">
            <FiImage className="mx-auto text-3xl sm:text-4xl text-primary mb-3 sm:mb-4" />
            <p className="text-gray-400 text-base sm:text-lg mb-4">No partners yet</p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm sm:text-base w-full max-w-xs mx-auto justify-center"
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
            onDelete={handleDeleteClick}
            onDownloadLogo={handleDownloadLogo}
          />
        )}
      </main>

      <PortalModal
        isOpen={showAddModal}
        onClose={resetForm}
        title="Add Partner"
        maxWidth="max-w-[calc(100%-2rem)] sm:max-w-2xl"
      >
        <div className="p-4 sm:p-6">
          {renderPartnerForm(handleAddSubmit, "Create Partner")}
        </div>
      </PortalModal>

      <PortalModal
        isOpen={showEditModal}
        onClose={resetForm}
        title="Edit Partner"
        maxWidth="max-w-[calc(100%-2rem)] sm:max-w-2xl"
      >
        <div className="p-4 sm:p-6">
          {renderPartnerForm(handleEditSubmit, "Update Partner")}
        </div>
      </PortalModal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPartnerToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Partner"
        message={`Are you sure you want to remove "${partnerToDelete?.name}" from the partners list?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
