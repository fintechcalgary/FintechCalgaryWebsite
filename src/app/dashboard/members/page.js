"use client";

import { motion } from "framer-motion";
import {
  FiMail,
  FiCalendar,
  FiDownload,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";
import Navbar from "@/components/layout/AdminNavbar";
import Modal from "@/components/ui/Modal/ConfirmModal";
import { LoadingState } from "@/components/ui/Spinner";
import Link from "next/link";
import useAdminResource from "@/hooks/useAdminResource";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import { downloadCsv } from "@/lib/csv";
import { formatDateLocale, todayIsoDate } from "@/lib/dates";
import PartnersStatCard from "@/features/partners/admin/PartnersStatCard";

function getMemberName(member) {
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`;
  }
  return member.name || "N/A";
}

export default function MembersPage() {
  const {
    isAdmin,
    data: members,
    setData: setMembers,
    loading,
  } = useAdminResource("/api/members", {
    redirectUnauthenticated: false,
  });
  const {
    isOpen: showDeleteModal,
    target: memberToDelete,
    ask: handleDeleteClick,
    close: closeDeleteModal,
  } = useConfirmDelete();

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(`/api/members/${memberToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      setMembers((prev) => prev.filter((m) => m._id !== memberToDelete._id));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleExportCsv = () => {
    downloadCsv({
      headers: [
        "First Name",
        "Last Name",
        "UCID",
        "Email",
        "Membership Type",
        "Has Paid",
        "Resume",
        "Joined Date",
      ],
      rows: members.map((member) => [
        member.firstName || member.name || "",
        member.lastName || "",
        member.ucid || "",
        member.email || "",
        member.membership_type || member.membershipType || "free",
        member.has_paid === true ? "Yes" : "No",
        member.resume || "",
        formatDateLocale(member.createdAt),
      ]),
      filename: `members-${todayIsoDate()}.csv`,
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-white">
            You don&apos;t have permission to view this page.
          </p>
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
            <h1 className="text-4xl font-bold text-white">Members</h1>
            <p className="fc-lede">
              Manage general members and mailing lists
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={handleExportCsv}
              disabled={members.length === 0}
              className="px-4 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PartnersStatCard
            label="Total Members"
            value={members.length}
            icon={FiMail}
            accent="primary"
          />
          <PartnersStatCard
            label="This Month"
            value={
              members.filter(
                (member) =>
                  new Date(member.createdAt).getMonth() ===
                    new Date().getMonth() &&
                  new Date(member.createdAt).getFullYear() ===
                    new Date().getFullYear()
              ).length
            }
            icon={FiCalendar}
            accent="green"
          />
        </div>

        {/* Members List */}
        {members.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
            <FiMail className="mx-auto text-4xl text-primary mb-4" />
            <p className="fc-body text-lg">No members found</p>
          </div>
        ) : (
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700/50">
                  <tr>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Name
                    </th>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      UCID
                    </th>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Email
                    </th>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Membership
                    </th>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Has Paid
                    </th>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Resume
                    </th>
                    <th className="fc-muted px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="fc-muted px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {members.map((member, index) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-800/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {getMemberName(member)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="fc-body text-sm">
                          {member.ucid || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="fc-body text-sm">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (member.membership_type ||
                                member.membershipType) === "premium"
                                ? "bg-primary/20 text-primary"
                                : "bg-gray-700/50 text-gray-300"
                            }`}
                          >
                            {member.membership_type ||
                              member.membershipType ||
                              "free"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.has_paid === true
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-700/50 text-gray-300"
                            }`}
                          >
                            {member.has_paid === true ? "Yes" : "No"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="fc-body text-sm">
                          {member.resume ? (
                            <a
                              href={member.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fc-link underline decoration-primary/30 underline-offset-[3px] hover:decoration-violet-300/50"
                            >
                              View
                            </a>
                          ) : (
                            <span className="fc-muted">No resume</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="fc-muted text-sm">
                          {formatDateLocale(member.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to remove ${
          memberToDelete ? getMemberName(memberToDelete) : ""
        } from the members list?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
