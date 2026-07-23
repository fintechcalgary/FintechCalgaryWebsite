"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiHome,
  FiUsers,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiExternalLink,
  FiArrowLeft,
} from "react-icons/fi";
import { SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import Navbar from "@/components/layout/AdminNavbar";
import Modal from "@/components/ui/Modal/ConfirmModal";
import PartnerApplicationEditModal from "@/features/partners/admin/PartnerApplicationEditModal";
import { LoadingState } from "@/components/ui/Spinner";
import Image from "next/image";
import Link from "next/link";
import useAdminResource from "@/hooks/useAdminResource";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { downloadCsv } from "@/lib/csv";
import { formatDateLocale, todayIsoDate } from "@/lib/dates";
import { downloadRemoteFile } from "@/lib/frontend-helpers";
import { getApprovalStatusMeta } from "@/features/partners/approvalStatus";
import {
  INITIAL_PARTNER_APPLICATION_FORM,
  memberToPartnerApplicationForm,
} from "@/features/partners/partnerFormFields";

export default function PartnerApplicationsPage() {
  const {
    status,
    isAdmin,
    data: partners,
    setData: setPartners,
    loading,
    refetch,
  } = useAdminResource("/api/partner-applications");
  const {
    isOpen: showDeleteModal,
    target: memberToDelete,
    ask: handleDeleteClick,
    close: closeDeleteModal,
  } = useConfirmDelete();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState(
    INITIAL_PARTNER_APPLICATION_FORM
  );
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle("Partner Applications | FinTech Calgary");

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditFormData(memberToPartnerApplicationForm(member));
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/partner-applications/${editingMember._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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
      setShowEditModal(false);
      setEditingMember(null);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvalStatus: newStatus,
          approvedAt: newStatus === "accepted" ? new Date() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update approval status");
      }

      await refetch();
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
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete partner");
      }

      setPartners((prev) => prev.filter((m) => m._id !== memberToDelete._id));
      closeDeleteModal();
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
    downloadCsv({
      headers: [
        "Organization Name",
        "Username",
        "Contact Title",
        "Contact First Name",
        "Contact Last Name",
        "Contact Email",
        "Contact Phone",
        "Organization Email",
        "Organization Phone",
        "Website",
        "LinkedIn",
        "Facebook",
        "Twitter",
        "Address",
        "City",
        "Province",
        "Country",
        "Postal Code",
        "About Us",
        "Approval Status",
        "Approved Date",
        "Joined Date",
      ],
      rows: partners.map((member) => [
        member.organizationName || "",
        member.username || "",
        member.title || "",
        member.firstName || "",
        member.lastName || "",
        member.contactEmail || "",
        member.contactPhoneNumber || "",
        member.organizationEmail || "",
        member.organizationPhoneNumber || "",
        member.website || "",
        member.linkedin || "",
        member.facebook || "",
        member.twitter || "",
        member.address || "",
        member.city || "",
        member.province || "",
        member.country || "",
        member.postalCode || "",
        member.aboutUs || "",
        member.approvalStatus || "pending",
        formatDateLocale(member.approvedAt),
        formatDateLocale(member.createdAt),
      ]),
      filename: `partners-${todayIsoDate()}.csv`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingState fullScreen />
      </div>
    );
  }

  if (status !== "authenticated" || !isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <FiUsers className="mx-auto text-4xl text-primary mb-4" />
              <p className="text-gray-400">
                You don&apos;t have permission to view partner applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Partner Applications</h1>
            <p className="text-gray-400 text-lg">
              View and manage partner organization applications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={handleExportCsv}
              disabled={partners.length === 0}
              className="px-4 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">
                  Total Organizations
                </p>
                <p className="text-3xl font-bold text-white">
                  {partners.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <FiHome className="text-primary text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-white">
                  {
                    partners.filter(
                      (m) => m.approvalStatus === "pending"
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <FiCalendar className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-white">
                  {
                    partners.filter(
                      (m) => m.approvalStatus === "accepted"
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <FiUsers className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        {partners.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
            <FiUsers className="mx-auto text-4xl text-primary mb-4" />
            <p className="text-gray-400 text-lg">No partner applications found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full flex flex-col group cursor-pointer"
                onClick={() => {
                  // Navigate to a detail view or open modal
                  handleEditClick(member);
                }}
              >
                {/* Organization Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member.logo ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                        <Image
                          src={member.logo}
                          alt={`${member.organizationName} logo`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <FiHome className="text-primary text-xl" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {member.organizationName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {formatDateLocale(member.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {member.logo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadLogo(member);
                        }}
                        className="text-gray-400 hover:text-blue-400 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500/10 hover:scale-105 relative z-20 border border-transparent hover:border-blue-500/20"
                        title="Download Logo"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(member);
                      }}
                      className="text-gray-400 hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-primary/10 hover:scale-105 relative z-20 border border-transparent hover:border-primary/20"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(member);
                      }}
                      className="text-gray-400 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10 hover:scale-105 relative z-20 border border-transparent hover:border-red-500/20"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Approval Status */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getApprovalStatusMeta(member.approvalStatus).badgeClass
                      }`}
                    >
                      {getApprovalStatusMeta(member.approvalStatus).shortLabel}
                    </span>
                    {member.approvalStatus === "accepted" &&
                      member.approvedAt && (
                        <span className="text-xs text-gray-400">
                          Approved on {formatDateLocale(member.approvedAt)}
                        </span>
                      )}
                  </div>
                  {member.approvalStatus === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprovalStatusChange(member._id, "accepted");
                        }}
                        className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-500 px-3 py-1 rounded transition-all duration-200 relative z-20 border border-green-500/20 hover:border-green-500/40 hover:scale-105"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprovalStatusChange(member._id, "rejected");
                        }}
                        className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1 rounded transition-all duration-200 relative z-20 border border-red-500/20 hover:border-red-500/40 hover:scale-105"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="text-gray-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-white truncate">
                      {[member.title, member.firstName, member.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="text-gray-400 w-4 h-4 flex-shrink-0" />
                    <a
                      href={`mailto:${member.contactEmail}`}
                      className="text-primary hover:text-primary/80 transition-colors truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member.contactEmail}
                    </a>
                  </div>

                  {member.contactPhoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="text-gray-400 w-4 h-4 flex-shrink-0" />
                      <span className="text-white text-xs">Personal:</span>
                      <span className="text-white">
                        {member.contactPhoneNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Organization Information */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Organization
                  </h4>

                  {member.organizationEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiMail className="text-gray-400 w-4 h-4 flex-shrink-0" />
                      <a
                        href={`mailto:${member.organizationEmail}`}
                        className="text-primary hover:text-primary/80 transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.organizationEmail}
                      </a>
                    </div>
                  )}

                  {member.organizationPhoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="text-gray-400 w-4 h-4 flex-shrink-0" />
                      <span className="text-white">
                        {member.organizationPhoneNumber}
                      </span>
                    </div>
                  )}

                  {member.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiGlobe className="text-gray-400 w-4 h-4 flex-shrink-0" />
                      <a
                        href={
                          member.website.startsWith("http")
                            ? member.website
                            : `https://${member.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors truncate flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.website}
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Full Address */}
                  {(member.address ||
                    member.city ||
                    member.province ||
                    member.country ||
                    member.postalCode) && (
                    <div className="flex items-start gap-2 text-sm">
                      <FiMapPin className="text-gray-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="text-white text-sm leading-relaxed">
                        {member.address && <div>{member.address}</div>}
                        <div>
                          {[member.city, member.province, member.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        {member.country && <div>{member.country}</div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(member.linkedin || member.facebook || member.twitter) && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                    {member.linkedin && (
                      <a
                        href={
                          member.linkedin.startsWith("http")
                            ? member.linkedin
                            : `https://${member.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="LinkedIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SiLinkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.facebook && (
                      <a
                        href={
                          member.facebook.startsWith("http")
                            ? member.facebook
                            : `https://${member.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Facebook"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SiFacebook className="w-4 h-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={
                          member.twitter.startsWith("http")
                            ? member.twitter
                            : `https://${member.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="X (Twitter)"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SiX className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* About Us Preview */}
                {member.aboutUs && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-2 font-medium">
                      About
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                      {member.aboutUs}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <PartnerApplicationEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          values={editFormData}
          setValues={setEditFormData}
          onSubmit={handleEditSubmit}
          submitting={submitting}
        />

        {/* Delete Confirmation Modal */}
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
      </main>
    </div>
  );
}
