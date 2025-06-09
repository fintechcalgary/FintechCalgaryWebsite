"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "react-icons/fi";
import { SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import Image from "next/image";

export default function AssociateMembersPage() {
  const [associateMembers, setAssociateMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    organizationName: "",
    title: "",
    firstName: "",
    lastName: "",
    contactEmail: "",
    contactPhoneNumber: "",
    organizationEmail: "",
    organizationPhoneNumber: "",
    website: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    address: "",
    country: "",
    province: "",
    city: "",
    postalCode: "",
    aboutUs: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    document.title = "Associate Members | FinTech Calgary";
  }, []);

  useEffect(() => {
    const fetchAssociateMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/associateMember");
        if (response.ok) {
          const data = await response.json();
          setAssociateMembers(data);
        } else if (response.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch associate members:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchAssociateMembers();
    } else if (session && session.user.role !== "admin") {
      setLoading(false);
    }
  }, [session, router]);

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditFormData({
      organizationName: member.organizationName || "",
      title: member.title || "",
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      contactEmail: member.contactEmail || "",
      contactPhoneNumber: member.contactPhoneNumber || "",
      organizationEmail: member.organizationEmail || "",
      organizationPhoneNumber: member.organizationPhoneNumber || "",
      website: member.website || "",
      facebook: member.facebook || "",
      twitter: member.twitter || "",
      linkedin: member.linkedin || "",
      address: member.address || "",
      country: member.country || "",
      province: member.province || "",
      city: member.city || "",
      postalCode: member.postalCode || "",
      aboutUs: member.aboutUs || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/associateMember/${editingMember._id}`,
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
        throw new Error(data.error || "Failed to update associate member");
      }

      // Refresh the members list
      const fetchResponse = await fetch("/api/associateMember");
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setAssociateMembers(data);
      }

      setShowEditModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Error updating associate member:", error);
      alert("Failed to update associate member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `/api/associateMember/${memberToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete associate member");
      }

      setAssociateMembers(
        associateMembers.filter((m) => m._id !== memberToDelete._id)
      );
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error("Error deleting associate member:", error);
      alert("Failed to delete associate member. Please try again.");
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Organization Name",
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
      "Joined Date",
    ];

    const csvData = associateMembers.map((member) => [
      member.organizationName || "",
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
      new Date(member.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `associate-members-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <FiUsers className="mx-auto text-4xl text-primary mb-4" />
              <p className="text-gray-400">
                You don&apos;t have permission to view associate members.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Associate Members
            </h1>
            <p className="text-gray-400">
              Manage and view all associate member organizations
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadCSV}
              disabled={associateMembers.length === 0}
              className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  Total Associate Member Organizations
                </p>
                <p className="text-2xl font-bold text-white">
                  {associateMembers.length}
                </p>
              </div>
              <FiHome className="text-primary text-2xl" />
            </div>
          </div>
        </div>

        {/* Members List */}
        {associateMembers.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
            <FiUsers className="mx-auto text-4xl text-primary mb-4" />
            <p className="text-gray-400 text-lg">No associate members found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {associateMembers.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Organization Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {member.logo ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                        <Image
                          src={member.logo}
                          alt={`${member.organizationName} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FiHome className="text-primary text-xl" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">
                        {member.organizationName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(member)}
                      className="text-gray-400 hover:text-primary transition-colors p-1"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(member)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-4">
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
                <div className="space-y-3 mb-4 pt-3 border-t border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Organization
                  </h4>

                  {member.organizationEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiMail className="text-gray-400 w-4 h-4 flex-shrink-0" />
                      <a
                        href={`mailto:${member.organizationEmail}`}
                        className="text-primary hover:text-primary/80 transition-colors truncate"
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
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
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
                      >
                        <SiX className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* About Us Preview */}
                {member.aboutUs && (
                  <div className="mt-4 pt-3 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">About</p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {member.aboutUs}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div
            className="fixed inset-0 bg-black/80 z-[99999] animate-fadeIn overflow-y-auto"
            onClick={() => setShowEditModal(false)}
          >
            <div className="min-h-screen py-8 px-4">
              <div
                className="relative w-full max-w-4xl mx-auto bg-gray-800 rounded-lg border border-gray-700/50 shadow-xl flex flex-col my-8 animate-slideInUp"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-gray-800 p-6 border-b border-gray-700 rounded-t-lg">
                  <h2 className="text-2xl font-semibold text-white">
                    Edit Associate Member
                  </h2>
                </div>

                <div className="p-6 overflow-y-auto">
                  <form
                    id="editMemberForm"
                    onSubmit={handleEditSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Organization Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                          Organization
                        </h3>
                        <input
                          type="text"
                          placeholder="Organization Name"
                          value={editFormData.organizationName}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              organizationName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Organization Email"
                          value={editFormData.organizationEmail}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              organizationEmail: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="tel"
                          placeholder="Organization Phone"
                          value={editFormData.organizationPhoneNumber}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              organizationPhoneNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="url"
                          placeholder="Website"
                          value={editFormData.website}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              website: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                          Contact Person
                        </h3>
                        <input
                          type="text"
                          placeholder="Title"
                          value={editFormData.title}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={editFormData.firstName}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={editFormData.lastName}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <input
                          type="email"
                          placeholder="Contact Email"
                          value={editFormData.contactEmail}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              contactEmail: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="tel"
                          placeholder="Contact Phone"
                          value={editFormData.contactPhoneNumber}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              contactPhoneNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      {/* Address & Social */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                          Address & Social
                        </h3>
                        <input
                          type="text"
                          placeholder="Address"
                          value={editFormData.address}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="City"
                            value={editFormData.city}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                          <input
                            type="text"
                            placeholder="Province"
                            value={editFormData.province}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                province: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Country"
                            value={editFormData.country}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                country: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={editFormData.postalCode}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                postalCode: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <input
                          type="url"
                          placeholder="LinkedIn URL"
                          value={editFormData.linkedin}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              linkedin: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="url"
                          placeholder="Facebook URL"
                          value={editFormData.facebook}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              facebook: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="url"
                          placeholder="X (Twitter) URL"
                          value={editFormData.twitter}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              twitter: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* About Us */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4">
                        About Us
                      </h3>
                      <textarea
                        placeholder="About Us Description"
                        value={editFormData.aboutUs}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            aboutUs: e.target.value,
                          })
                        }
                        rows={6}
                        className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      />
                    </div>
                  </form>
                </div>

                <div className="sticky bottom-0 z-10 bg-gray-800/90 backdrop-blur-sm p-6 border-t border-gray-700 rounded-b-lg">
                  <div className="flex justify-end items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="editMemberForm"
                      disabled={submitting}
                      className={`bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                        submitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <FiEdit2 className="w-4 h-4" />
                      {submitting ? "Updating..." : "Update Member"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Associate Member"
          message={`Are you sure you want to delete ${memberToDelete?.organizationName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </main>
    </div>
  );
}
