"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { FiTrash2, FiDownload, FiX, FiEye, FiArrowLeft } from "react-icons/fi";

export default function ExecutiveApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executiveApplicationsOpen, setExecutiveApplicationsOpen] =
    useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, router]);

  useEffect(() => {
    document.title = "Executive Applications | FinTech Calgary";
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchApplications();
      fetchSettings();
    }
  }, [session]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/executive-application");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError("Failed to load applications");
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setExecutiveApplicationsOpen(!!data.executiveApplicationsOpen);
      setSettingsLoading(false);
    } catch (err) {
      setSettingsError("Failed to load settings");
      setSettingsLoading(false);
    }
  };

  const handleToggleExecutiveApplications = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executiveApplicationsOpen: !executiveApplicationsOpen,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setExecutiveApplicationsOpen((prev) => !prev);
    } catch (err) {
      setSettingsError("Failed to update setting");
    } finally {
      setSettingsLoading(false);
    }
  };

  const openDeleteModal = (application) => {
    setApplicationToDelete(application);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setApplicationToDelete(null);
  };

  const openDetailsModal = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    setDeletingId(applicationToDelete._id);
    try {
      const response = await fetch(
        `/api/executive-application?id=${applicationToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      // Remove the application from the state
      setApplications(
        applications.filter((app) => app._id !== applicationToDelete._id)
      );
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Failed to delete application. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    if (applications.length === 0) {
      alert("No applications to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Program",
      "Year",
      "LinkedIn",
      "Resume",
      "Why Executive",
      "Fintech Vision",
      "Other Commitments",
      "Applied Date",
    ];

    const csvData = applications.map((app) => [
      app.name || "",
      app.email || "",
      app.phone || "",
      app.role || "",
      app.program || "",
      app.year || "",
      app.linkedin || "",
      app.resume || "",
      app.why || "",
      app.fintechVision || "",
      app.otherCommitments || "",
      formatDate(app.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `executive-applications-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl relative animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-bold text-white">
              Executive Applications
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Review and manage executive team applications
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
            {applications.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive Applications Toggle */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl bg-gray-800/70 border border-primary/30 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium text-base sm:text-lg">
              Executive Applications
            </span>
            <button
              type="button"
              onClick={handleToggleExecutiveApplications}
              disabled={settingsLoading}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none border-2 border-primary/40 ${
                executiveApplicationsOpen ? "bg-primary" : "bg-gray-600"
              }`}
              aria-pressed={executiveApplicationsOpen}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  executiveApplicationsOpen ? "translate-x-7" : "translate-x-1"
                }`}
              ></span>
            </button>
          </div>
          <div className="text-gray-400 text-xs sm:text-sm mt-2">
            {executiveApplicationsOpen
              ? "Executive applications are open."
              : "Executive applications are closed."}
          </div>
          {settingsError && (
            <div className="text-red-400 text-xs sm:text-sm mt-2">
              {settingsError}
            </div>
          )}
        </div>

        {/* Applications Table - Mobile Cards vs Desktop Table */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {error ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-red-400 text-sm sm:text-base">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-gray-400 text-sm sm:text-base">
                No applications found.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Program & Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {applications.map((application, index) => (
                      <tr
                        key={application._id || index}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {application.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                            {application.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>{application.program}</div>
                          <div className="text-gray-400">
                            Year {application.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>{application.email}</div>
                          {application.phone && (
                            <div className="text-gray-400">
                              {application.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetailsModal(application)}
                              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                            >
                              <FiEye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => openDeleteModal(application)}
                              disabled={deletingId === application._id}
                              className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="p-4 sm:p-6 space-y-4">
                  {applications.map((application, index) => (
                    <div
                      key={application._id || index}
                      className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-base mb-1">
                            {application.name}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                            {application.role}
                          </span>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => openDetailsModal(application)}
                            className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(application)}
                            disabled={deletingId === application._id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Application"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Program:</span>
                          <div className="text-white">
                            {application.program}
                          </div>
                          <div className="text-gray-400">
                            Year {application.year}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Contact:</span>
                          <div className="text-white break-all">
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="text-gray-400">
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <span className="text-gray-400 text-xs">Applied:</span>
                        <div className="text-white text-sm">
                          {formatDate(application.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-400 text-center sm:text-left">
          Total Applications: {applications.length}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4 animate-slideInUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Delete Application
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Are you sure you want to delete the application for{" "}
                <span className="text-white font-medium">
                  {applicationToDelete?.name}
                </span>
                ?
              </p>
              <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-400">
                <div>
                  <strong>Role:</strong> {applicationToDelete?.role}
                </div>
                <div>
                  <strong>Program:</strong> {applicationToDelete?.program}
                </div>
                <div>
                  <strong>Email:</strong> {applicationToDelete?.email}
                </div>
              </div>
              <p className="text-red-400 text-xs sm:text-sm mt-3">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white hover:bg-gray-600/50 transition-all duration-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                disabled={deletingId === applicationToDelete?._id}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <FiTrash2 className="w-4 h-4" />
                {deletingId === applicationToDelete?._id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideInUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Application Details
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {selectedApplication && (
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                      Personal Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>{" "}
                        <span className="text-white">
                          {selectedApplication.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>{" "}
                        <span className="text-white break-all">
                          {selectedApplication.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Phone:</span>{" "}
                        <span className="text-white">
                          {selectedApplication.phone || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                      Academic Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Program:</span>{" "}
                        <span className="text-white">
                          {selectedApplication.program}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Year:</span>{" "}
                        <span className="text-white">
                          {selectedApplication.year}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Role Applied:</span>{" "}
                        <span className="text-white">
                          {selectedApplication.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                    Links
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">LinkedIn:</span>{" "}
                      {selectedApplication.linkedin ? (
                        <a
                          href={selectedApplication.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 break-all"
                        >
                          {selectedApplication.linkedin}
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400">Resume:</span>{" "}
                      {selectedApplication.resume ? (
                        <a
                          href={selectedApplication.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 break-all flex items-center gap-1"
                        >
                          <FiEye className="w-4 h-4" />
                          View Resume
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why Executive */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                    Why do you want to be an executive?
                  </h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedApplication.why}
                  </div>
                </div>

                {/* Fintech Vision */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                    What does &apos;fintech&apos; mean to you, and how do you
                    see its role in the future of business and innovation?
                  </h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedApplication.fintechVision}
                  </div>
                </div>

                {/* Other Commitments */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                    Are you currently involved with any other clubs or
                    commitments? How do you plan to balance your
                    responsibilities?
                  </h4>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedApplication.otherCommitments}
                  </div>
                </div>

                {/* Application Date */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-primary font-medium mb-3 text-sm sm:text-base">
                    Application Information
                  </h4>
                  <div className="text-sm">
                    <span className="text-gray-400">Applied:</span>{" "}
                    <span className="text-white">
                      {formatDate(selectedApplication.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white hover:bg-gray-600/50 transition-all duration-300 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
