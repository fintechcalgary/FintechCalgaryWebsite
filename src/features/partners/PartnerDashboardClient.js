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
  FiHome,
  FiUsers,
  FiEdit2,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { faChartBar, faClock } from "@fortawesome/free-solid-svg-icons";
import { SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import Modal from "@/components/ui/Modal/ConfirmModal";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Events from "@/features/events/Events";
import PartnerEditModal from "@/features/partners/PartnerEditModal";
import {
  memberToPartnerForm,
  INITIAL_PARTNER_FORM,
} from "@/features/partners/partnerFormFields";
import { getApprovalStatusMeta } from "@/features/partners/approvalStatus";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { LoadingState } from "@/components/ui/Spinner";
import useConfirmLogout from "@/hooks/useConfirmLogout";
import { formatDateLocale } from "@/lib/dates";

const STATUS_ICONS = {
  accepted: FiCheckCircle,
  rejected: FiXCircle,
  pending: FiClock,
};

export default function PartnerDashboardClient() {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(() =>
    memberToPartnerForm()
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const {
    isOpen: showLogoutModal,
    ask: handleLogoutClick,
    close: closeLogoutModal,
    confirm: handleLogout,
  } = useConfirmLogout();
  const { data: session, status } = useSession();
  const router = useRouter();

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
    const fetchMemberData = async () => {
      if (session?.user?.role === "associate") {
        try {
          const response = await fetch("/api/partner-applications/me");
          if (response.ok) {
            const data = await response.json();
            setMemberData(data);
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
      setEditFormData(memberToPartnerForm(memberData));
      setShowEditModal(true);
    }
  };

  const resetEditForm = () => {
    setEditFormData({ ...INITIAL_PARTNER_FORM });
    setShowEditModal(false);
    setErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/partner-applications/${memberData._id}`, {
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
      const fetchResponse = await fetch("/api/partner-applications/me");
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

  const statusMeta = getApprovalStatusMeta(memberData?.approvalStatus);
  const StatusIcon = STATUS_ICONS[statusMeta.icon] || FiClock;

  if (loading) {
    return (
      <PublicPageShell title="Partner Dashboard | FinTech Calgary">
        <div className="flex-grow flex items-center justify-center relative">
          <div className="text-center">
            <LoadingState size="lg" className="mb-4" />
            <p className="text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  if (!memberData) {
    return (
      <PublicPageShell title="Partner Dashboard | FinTech Calgary">
        <div className="flex-grow flex items-center justify-center relative">
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
      </PublicPageShell>
    );
  }

  return (
    <>
      <PublicPageShell title="Partner Dashboard | FinTech Calgary">
        <div className="relative flex-grow">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
          <div className="container mx-auto px-6 pt-32 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-16 animate-fadeIn">
              <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                Partner Dashboard
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
                    <StatusIcon
                      className={`w-5 h-5 ${
                        statusMeta.icon === "accepted"
                          ? "text-green-500"
                          : statusMeta.icon === "rejected"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Membership Status
                    </h3>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusMeta.colorClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
                {memberData.approvedAt && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Approved on</p>
                    <p className="text-white font-medium">
                      {formatDateLocale(memberData.approvedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Partner Events Card */}
            {memberData.approvalStatus === "accepted" && (
              <section className="group animate-fadeIn">
                <div
                  className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 
                                        transition-all duration-500 hover:bg-gray-900/90 hover:shadow-2xl hover:shadow-primary/20
                                        hover:border-primary/50 overflow-hidden"
                  id="events"
                >
                  <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold text-white">
                        Events and Webinars
                      </h2>
                      <p className="text-sm text-gray-400">
                        Manage your schedule
                      </p>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                      <FontAwesomeIcon icon={faChartBar} className="h-6 w-6" />
                    </span>
                  </div>

                  {/* Enhanced Reminder Section */}
                  <div
                    className="mb-6 p-4 rounded-xl border border-gray-700/30 hover:border-primary/50 bg-gradient-to-br from-gray-800/60 via-purple-900/20 to-gray-800/40
                         shadow-lg hover:shadow-purple-600/20 duration-300 backdrop-blur-xl max-w-md sm:max-w-full transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700/20 text-purple-300 backdrop-blur-sm border border-purple-500/30">
                        <FontAwesomeIcon icon={faClock} className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-semibold text-white">
                          Reminder
                        </h3>
                        <p className="text-xs text-purple-100 leading-relaxed">
                          No need to delete past events—they&apos;ll remain on
                          the events page. Delete only those you no longer want
                          to display.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Events mode="partner" />
                </div>
              </section>
            )}

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
        </div>
      </PublicPageShell>

      <PartnerEditModal
        isOpen={showEditModal}
        onClose={resetEditForm}
        values={editFormData}
        errors={errors}
        setValues={setEditFormData}
        setErrors={setErrors}
        onSubmit={handleEditSubmit}
        submitting={submitting}
      />

      <Modal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your dashboard."
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
