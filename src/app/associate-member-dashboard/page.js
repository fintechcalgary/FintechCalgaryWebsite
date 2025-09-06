"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
  FiEdit2,
  FiCheck,
  FiX,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import PublicNavbar from "@/components/PublicNavbar";
import PortalModal from "@/components/PortalModal";
import Modal from "@/components/Modal";
import Image from "next/image";

export default function AssociateMemberDashboard() {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    organizationName: "",
    username: "",
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [errors, setErrors] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowLogoutModal(false);
    router.push("/login");
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "associate"
    ) {
      router.push("/dashboard");
    }
  }, [status, router, session]);

  useEffect(() => {
    document.title = "Associate Member Dashboard | FinTech Calgary";
  }, []);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (session?.user?.role === "associate") {
        try {
          setLoading(true);
          const response = await fetch("/api/associateMember/me");
          if (response.ok) {
            const data = await response.json();
            setMemberData(data);
            setPreviewUrl(data.logo);
          } else if (response.status === 401) {
            router.push("/login");
          }
        } catch (error) {
          console.error("Failed to fetch member data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session?.user?.role === "associate") {
      fetchMemberData();
    }
  }, [session, router]);

  const handleEditClick = () => {
    if (memberData) {
      setEditFormData({
        organizationName: memberData.organizationName || "",
        username: memberData.username || "",
        title: memberData.title || "",
        firstName: memberData.firstName || "",
        lastName: memberData.lastName || "",
        contactEmail: memberData.contactEmail || "",
        contactPhoneNumber: memberData.contactPhoneNumber || "",
        organizationEmail: memberData.organizationEmail || "",
        organizationPhoneNumber: memberData.organizationPhoneNumber || "",
        website: memberData.website || "",
        facebook: memberData.facebook || "",
        twitter: memberData.twitter || "",
        linkedin: memberData.linkedin || "",
        address: memberData.address || "",
        country: memberData.country || "",
        province: memberData.province || "",
        city: memberData.city || "",
        postalCode: memberData.postalCode || "",
        aboutUs: memberData.aboutUs || "",
      });
      setShowEditModal(true);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      organizationName: "",
      username: "",
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
    setShowEditModal(false);
    setPreviewUrl(memberData?.logo);
    setFileError(null);
    setErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/associateMember/${memberData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "Username already exists") {
          setErrors({
            username:
              "Username already exists. Please choose a different username.",
          });
          return;
        }
        throw new Error(data.error || "Failed to update member information");
      }

      // Refresh the member data
      const fetchResponse = await fetch("/api/associateMember/me");
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setMemberData(data);
      }

      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating member information:", error);
      setErrors({
        general: "Failed to update member information. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    setFileError(null);

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
    ];
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["jpg", "jpeg", "png", "svg"];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      setFileError("Please upload a logo in JPG, PNG, or SVG format only.");
      return;
    }

    if (
      file &&
      (file.type.startsWith("image/") || file.type === "image/svg+xml")
    ) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <FiClock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepted":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        return "Awaiting Approval";
    }
  };

  const inputClassName =
    "w-full px-4 py-3 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all duration-200 shadow-sm shadow-black/10";

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <PublicNavbar />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <PublicNavbar />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-300">
              Unable to load your member information. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <PublicNavbar />

      <main className="relative z-10">
        <div className="container mx-auto px-6 pt-32 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-16 animate-fadeIn">
              <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                Associate Member Dashboard
              </h1>
              <div className="flex items-center justify-center gap-6">
                <p className="text-xl text-gray-300">
                  Welcome back, {memberData.firstName} {memberData.lastName}
                </p>
                <button
                  onClick={handleLogoutClick}
                  className="px-6 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium transition-all hover:bg-white/15 hover:scale-[1.02] whitespace-nowrap cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <span>Log Out</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-500 mb-8 animate-slideInUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    {getStatusIcon(memberData.approvalStatus)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Membership Status
                    </h3>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                        memberData.approvalStatus
                      )}`}
                    >
                      {getStatusText(memberData.approvalStatus)}
                    </span>
                  </div>
                </div>
                {memberData.approvedAt && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Approved on</p>
                    <p className="text-white font-medium">
                      {new Date(memberData.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Member Information Card */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-500 mb-8 animate-slideInUp animation-delay-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Your Information
                  </h2>
                  <p className="text-gray-400">
                    View and manage your organization details
                  </p>
                </div>
                <button
                  onClick={handleEditClick}
                  className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 border border-primary/30"
                >
                  <FiEdit2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">Edit Information</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Organization Info */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <FiHome className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Organization
                    </h3>
                  </div>

                  {memberData.logo && (
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <Image
                          src={memberData.logo}
                          alt={`${memberData.organizationName} logo`}
                          width={140}
                          height={140}
                          className="rounded-2xl object-contain border border-white/10 shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent"></div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Organization Name
                      </label>
                      <p className="text-white text-lg font-medium">
                        {memberData.organizationName}
                      </p>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Username
                      </label>
                      <p className="text-white text-lg font-medium">
                        {memberData.username}
                      </p>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Website
                      </label>
                      <a
                        href={memberData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2 group"
                      >
                        <FiGlobe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-lg font-medium">
                          Visit Website
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <FiUser className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Contact Information
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Main Contact
                      </label>
                      <p className="text-white text-lg font-medium">
                        {memberData.title} {memberData.firstName}{" "}
                        {memberData.lastName}
                      </p>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Contact Email
                      </label>
                      <a
                        href={`mailto:${memberData.contactEmail}`}
                        className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2 group"
                      >
                        <FiMail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-medium">
                          {memberData.contactEmail}
                        </span>
                      </a>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Contact Phone
                      </label>
                      <a
                        href={`tel:${memberData.contactPhoneNumber}`}
                        className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2 group"
                      >
                        <FiPhone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-medium">
                          {memberData.contactPhoneNumber}
                        </span>
                      </a>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Organization Email
                      </label>
                      <a
                        href={`mailto:${memberData.organizationEmail}`}
                        className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2 group"
                      >
                        <FiMail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-medium">
                          {memberData.organizationEmail}
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <FiMapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Address</h3>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-6 border border-white/5">
                  <div className="text-white space-y-2">
                    <p className="text-lg font-medium">{memberData.address}</p>
                    <p className="text-lg">
                      {memberData.city}, {memberData.province}{" "}
                      {memberData.postalCode}
                    </p>
                    <p className="text-lg">{memberData.country}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              {(memberData.facebook ||
                memberData.twitter ||
                memberData.linkedin) && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <FiUsers className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Social Media
                    </h3>
                  </div>
                  <div className="flex space-x-6">
                    {memberData.facebook && (
                      <a
                        href={memberData.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-14 h-14 bg-gray-800/30 rounded-xl flex items-center justify-center border border-white/5 hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                      >
                        <SiFacebook className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </a>
                    )}
                    {memberData.twitter && (
                      <a
                        href={memberData.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-14 h-14 bg-gray-800/30 rounded-xl flex items-center justify-center border border-white/5 hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                      >
                        <SiX className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </a>
                    )}
                    {memberData.linkedin && (
                      <a
                        href={memberData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-14 h-14 bg-gray-800/30 rounded-xl flex items-center justify-center border border-white/5 hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                      >
                        <SiLinkedin className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* About Us */}
              {memberData.aboutUs && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                      <FiUser className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">About Us</h3>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-white/5">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {memberData.aboutUs}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      <PortalModal
        isOpen={showEditModal}
        onClose={resetEditForm}
        title="Edit Member Information"
        maxWidth="max-w-4xl"
      >
        <div className="p-6">
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Organization Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Organization Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.organizationName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        organizationName: e.target.value,
                      })
                    }
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        username: e.target.value,
                      })
                    }
                    className={`${inputClassName} ${
                      errors.username ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        website: e.target.value,
                      })
                    }
                    className={inputClassName}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          firstName: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          lastName: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.contactEmail}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          contactEmail: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.contactPhoneNumber}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          contactPhoneNumber: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.organizationEmail}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          organizationEmail: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.organizationPhoneNumber}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          organizationPhoneNumber: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Social Media
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.facebook}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        facebook: e.target.value,
                      })
                    }
                    className={inputClassName}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.twitter}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        twitter: e.target.value,
                      })
                    }
                    className={inputClassName}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.linkedin}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        linkedin: e.target.value,
                      })
                    }
                    className={inputClassName}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editFormData.country}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          country: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Province/State
                    </label>
                    <input
                      type="text"
                      value={editFormData.province}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          province: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          city: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={editFormData.postalCode}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          postalCode: e.target.value,
                        })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                About Us
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  About Us Section
                </label>
                <textarea
                  value={editFormData.aboutUs}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      aboutUs: e.target.value,
                    })
                  }
                  className={`${inputClassName} min-h-32 resize-none`}
                  required
                  placeholder="Tell us about your organization..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-white/10">
              <button
                type="button"
                onClick={resetEditForm}
                className="px-8 py-3 border border-white/20 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-white/30 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center space-x-3 font-medium hover:scale-105 hover:shadow-lg hover:shadow-primary/25 border border-primary/30"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    <span>Update Information</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </PortalModal>

      {/* Log Out Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your dashboard."
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
