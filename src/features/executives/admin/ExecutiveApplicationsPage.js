"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/AdminNavbar";
import Link from "next/link";
import {
  FiTrash2,
  FiDownload,
  FiX,
  FiEye,
  FiArrowLeft,
  FiUpload,
} from "react-icons/fi";
import Image from "next/image";
import DashboardCenterModal from "@/components/ui/Modal/DashboardModal";
import RoleManager from "@/features/executives/admin/RoleManager";
import ApplicationList from "@/features/executives/admin/ApplicationList";
import { LoadingState } from "@/components/ui/Spinner";
import { useSettings } from "@/contexts/SettingsContext";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import useFileUpload from "@/hooks/useFileUpload";
import { downloadCsv } from "@/lib/csv";
import { formatDateShort, formatDateTimeShort, todayIsoDate } from "@/lib/dates";
import { UPLOAD_FOLDERS } from "@/lib/constants";

export default function ExecutiveApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    executiveApplicationsOpen,
    setExecutiveApplicationsOpen,
    settingsLoaded,
  } = useSettings();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const {
    isOpen: showDeleteModal,
    target: applicationToDelete,
    ask: openDeleteModal,
    close: closeDeleteModal,
  } = useConfirmDelete();
  const {
    isOpen: showDeleteRoleModal,
    target: roleToDelete,
    ask: openDeleteRoleModal,
    close: closeDeleteRoleModal,
  } = useConfirmDelete();
  const { upload, uploading: uploadingImage } = useFileUpload();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Role management state
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    title: "",
    responsibilitiesImageFile: null,
  });
  const [roleFormErrors, setRoleFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Role-specific question management state
  const [showRoleQuestionModal, setShowRoleQuestionModal] = useState(false);
  const [roleQuestionForm, setRoleQuestionForm] = useState({
    id: "",
    label: "",
    placeholder: "",
    required: true,
  });
  const [editingRoleQuestion, setEditingRoleQuestion] = useState(null);
  const [roleQuestionFormErrors, setRoleQuestionFormErrors] = useState({});
  const [currentRoleForQuestions, setCurrentRoleForQuestions] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Only redirect if session is loaded and user is not admin
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchApplications();
      fetchRoles();
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

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await fetch("/api/executive-roles");
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setRolesLoading(false);
    }
  };

  // Role management functions
  const openAddRoleModal = () => {
    setRoleForm({ title: "", responsibilitiesImageFile: null });
    setRoleFormErrors({});
    setImagePreview(null);
    setShowAddRoleModal(true);
  };

  const closeAddRoleModal = () => {
    setShowAddRoleModal(false);
    setRoleForm({ title: "", responsibilitiesImageFile: null });
    setRoleFormErrors({});
    setImagePreview(null);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setRoleForm({
      title: role.title,
      responsibilitiesImageFile: null,
    });
    setImagePreview(role.responsibilitiesImageUrl);
    setRoleFormErrors({});
    setShowEditRoleModal(true);
  };

  const closeEditRoleModal = () => {
    setShowEditRoleModal(false);
    setEditingRole(null);
    setRoleForm({ title: "", responsibilitiesImageFile: null });
    setRoleFormErrors({});
    setImagePreview(null);
  };

  const handleRoleFormChange = (e) => {
    setRoleForm({ ...roleForm, [e.target.name]: e.target.value });
    if (roleFormErrors[e.target.name]) {
      setRoleFormErrors({ ...roleFormErrors, [e.target.name]: null });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setRoleFormErrors({
          ...roleFormErrors,
          responsibilitiesImageFile:
            "Please upload an image file (JPG, PNG, GIF, etc.)",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setRoleFormErrors({
          ...roleFormErrors,
          responsibilitiesImageFile: "File size must be less than 5MB",
        });
        return;
      }

      setRoleForm({ ...roleForm, responsibilitiesImageFile: file });
      setRoleFormErrors({ ...roleFormErrors, responsibilitiesImageFile: null });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateRoleForm = () => {
    const errors = {};
    if (!roleForm.title.trim()) {
      errors.title = "Role title is required";
    }
    if (!showEditRoleModal && !roleForm.responsibilitiesImageFile) {
      errors.responsibilitiesImageFile = "Responsibilities image is required";
    }
    return errors;
  };

  const handleAddRole = async () => {
    const errors = validateRoleForm();
    if (Object.keys(errors).length > 0) {
      setRoleFormErrors(errors);
      return;
    }

    try {
      let imageUrl = "";

      if (roleForm.responsibilitiesImageFile) {
        imageUrl = await upload(
          roleForm.responsibilitiesImageFile,
          UPLOAD_FOLDERS.ROLE_RESPONSIBILITIES
        );
      }

      const response = await fetch("/api/executive-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: roleForm.title,
          responsibilitiesImageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create role");
      }

      await fetchRoles();
      closeAddRoleModal();
    } catch (err) {
      console.error("Error creating role:", err);
      alert("Failed to create role. Please try again.");
    }
  };

  const handleEditRole = async () => {
    const errors = validateRoleForm();
    if (Object.keys(errors).length > 0) {
      setRoleFormErrors(errors);
      return;
    }

    try {
      let imageUrl = editingRole.responsibilitiesImageUrl;

      if (roleForm.responsibilitiesImageFile) {
        imageUrl = await upload(
          roleForm.responsibilitiesImageFile,
          UPLOAD_FOLDERS.ROLE_RESPONSIBILITIES
        );
      }

      const response = await fetch("/api/executive-roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRole._id,
          title: roleForm.title,
          responsibilitiesImageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      await fetchRoles();
      closeEditRoleModal();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role. Please try again.");
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(
        `/api/executive-roles?id=${roleToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      await fetchRoles();
      closeDeleteRoleModal();
    } catch (err) {
      console.error("Error deleting role:", err);
      alert("Failed to delete role. Please try again.");
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
    } catch {
      setSettingsError("Failed to update setting");
    } finally {
      setSettingsLoading(false);
    }
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

    downloadCsv({
      headers: [
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
      ],
      rows: applications.map((app) => [
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
        formatDateShort(app.createdAt),
      ]),
      filename: `executive-applications-${todayIsoDate()}.csv`,
    });
  };

  // Role-specific question management functions
  const validateRoleQuestionForm = () => {
    const errors = {};
    if (!roleQuestionForm.label.trim()) {
      errors.label = "Question label is required";
    }
    if (!roleQuestionForm.placeholder.trim()) {
      errors.placeholder = "Placeholder text is required";
    }
    return errors;
  };

  const handleRoleQuestionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoleQuestionForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (roleQuestionFormErrors[name]) {
      setRoleQuestionFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const openRoleQuestionModal = (role, question = null) => {
    setCurrentRoleForQuestions(role);
    if (question) {
      setEditingRoleQuestion(question);
      setRoleQuestionForm({
        id: question.id,
        label: question.label,
        placeholder: question.placeholder,
        required: question.required,
      });
    } else {
      setEditingRoleQuestion(null);
      setRoleQuestionForm({
        id: `question_${Date.now()}`, // Auto-generate ID
        label: "",
        placeholder: "",
        required: true,
      });
    }
    setRoleQuestionFormErrors({});
    setShowRoleQuestionModal(true);
  };

  const closeRoleQuestionModal = () => {
    setShowRoleQuestionModal(false);
    setEditingRoleQuestion(null);
    setCurrentRoleForQuestions(null);
    setRoleQuestionForm({
      id: `question_${Date.now()}`, // Auto-generate ID
      label: "",
      placeholder: "",
      required: true,
    });
    setRoleQuestionFormErrors({});
  };

  const handleAddRoleQuestion = async () => {
    const errors = validateRoleQuestionForm();
    if (Object.keys(errors).length > 0) {
      setRoleQuestionFormErrors(errors);
      return;
    }

    // Auto-generate unique ID if needed
    if (
      !roleQuestionForm.id ||
      currentRoleForQuestions.questions?.some(
        (q) => q.id === roleQuestionForm.id
      )
    ) {
      roleQuestionForm.id = `question_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    try {
      const newQuestions = [
        ...(currentRoleForQuestions.questions || []),
        roleQuestionForm,
      ];
      const response = await fetch("/api/executive-roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentRoleForQuestions._id,
          title: currentRoleForQuestions.title,
          responsibilitiesImageUrl:
            currentRoleForQuestions.responsibilitiesImageUrl,
          questions: newQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save role questions");
      }

      // Update the role in the local state
      setRoles(
        roles.map((role) =>
          role._id === currentRoleForQuestions._id
            ? { ...role, questions: newQuestions }
            : role
        )
      );
      closeRoleQuestionModal();
    } catch (error) {
      console.error("Error adding role question:", error);
      setRoleQuestionFormErrors({ general: "Failed to add question" });
    }
  };

  const handleEditRoleQuestion = async () => {
    const errors = validateRoleQuestionForm();
    if (Object.keys(errors).length > 0) {
      setRoleQuestionFormErrors(errors);
      return;
    }

    // Auto-generate unique ID if needed (for new questions only)
    if (
      !editingRoleQuestion &&
      (!roleQuestionForm.id ||
        currentRoleForQuestions.questions?.some(
          (q) => q.id === roleQuestionForm.id
        ))
    ) {
      roleQuestionForm.id = `question_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    try {
      const newQuestions = (currentRoleForQuestions.questions || []).map((q) =>
        q === editingRoleQuestion ? roleQuestionForm : q
      );
      const response = await fetch("/api/executive-roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentRoleForQuestions._id,
          title: currentRoleForQuestions.title,
          responsibilitiesImageUrl:
            currentRoleForQuestions.responsibilitiesImageUrl,
          questions: newQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save role questions");
      }

      // Update the role in the local state
      setRoles(
        roles.map((role) =>
          role._id === currentRoleForQuestions._id
            ? { ...role, questions: newQuestions }
            : role
        )
      );
      closeRoleQuestionModal();
    } catch (error) {
      console.error("Error editing role question:", error);
      setRoleQuestionFormErrors({ general: "Failed to edit question" });
    }
  };

  const handleDeleteRoleQuestion = async (role, questionToDelete) => {
    try {
      const newQuestions = (role.questions || []).filter(
        (q) => q !== questionToDelete
      );
      const response = await fetch("/api/executive-roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: role._id,
          title: role.title,
          responsibilitiesImageUrl: role.responsibilitiesImageUrl,
          questions: newQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete role question");
      }

      // Update the role in the local state
      setRoles(
        roles.map((r) =>
          r._id === role._id ? { ...r, questions: newQuestions } : r
        )
      );
    } catch (error) {
      console.error("Error deleting role question:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState size="lg" />
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
      <main className="container mx-auto px-6 py-8 max-w-7xl relative animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">
              Executive Applications
            </h1>
            <p className="text-gray-400 text-lg">
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
        <div className="mb-8 p-6 rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-primary/30 max-w-md hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-lg">
              Executive Applications
            </span>
            <button
              type="button"
              onClick={handleToggleExecutiveApplications}
              disabled={settingsLoading || !settingsLoaded}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none border-2 border-primary/40 ${
                executiveApplicationsOpen ? "bg-primary" : "bg-gray-600"
              }`}
              aria-pressed={executiveApplicationsOpen}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition-transform ${
                  executiveApplicationsOpen ? "translate-x-8" : "translate-x-1"
                }`}
              ></span>
            </button>
          </div>
          <div className="text-gray-400 text-sm">
            {executiveApplicationsOpen
              ? "Executive applications are currently open and accepting submissions."
              : "Executive applications are currently closed."}
          </div>
          {settingsError && (
            <div className="text-red-400 text-sm mt-2">{settingsError}</div>
          )}
        </div>

        <RoleManager
          roles={roles}
          rolesLoading={rolesLoading}
          executiveApplicationsOpen={executiveApplicationsOpen}
          onAddClick={openAddRoleModal}
          onEditClick={openEditRoleModal}
          onDeleteClick={openDeleteRoleModal}
          onAddQuestion={(role) => openRoleQuestionModal(role)}
          onEditQuestion={(role, question) => openRoleQuestionModal(role, question)}
          onDeleteQuestion={handleDeleteRoleQuestion}
          formatDate={formatDateTimeShort}
        />

        <ApplicationList
          applications={applications}
          error={error}
          fetchApplications={fetchApplications}
          formatDate={formatDateTimeShort}
          onViewDetails={openDetailsModal}
          onDeleteClick={openDeleteModal}
        />
      </main>

      {/* Delete Confirmation Modal */}
      <DashboardCenterModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        size="sm"
      >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Delete Application
              </h3>
              <button
                onClick={closeDeleteModal}
                className="fc-modal-icon-close"
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
                className="fc-btn-dashboard-cancel"
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
      </DashboardCenterModal>

      {/* Application Details Modal */}
      <DashboardCenterModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        size="lg"
      >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiEye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Application Details
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {selectedApplication?.name} • {selectedApplication?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className="fc-modal-icon-close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {selectedApplication && (
              <div className="space-y-6">
                {/* Applicant Header Card */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                        {selectedApplication.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {selectedApplication.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                            {selectedApplication.role}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-300">
                            {selectedApplication.program} • Year{" "}
                            {selectedApplication.year}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Applied</div>
                      <div className="text-white font-medium">
                        {formatDateTimeShort(selectedApplication.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Academic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">
                        Contact Information
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-400">Email</div>
                          <div className="text-white break-all">
                            {selectedApplication.email}
                          </div>
                        </div>
                      </div>
                      {selectedApplication.phone && (
                        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-400">Phone</div>
                            <div className="text-white">
                              {selectedApplication.phone}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">
                        Academic Information
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-400">Program</div>
                          <div className="text-white">
                            {selectedApplication.program}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-400">
                            Year of Study
                          </div>
                          <div className="text-white">
                            Year {selectedApplication.year}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white">
                      Links & Documents
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                        />
                      </svg>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400">LinkedIn</div>
                        {selectedApplication.linkedin ? (
                          <a
                            href={selectedApplication.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 break-all text-sm font-medium"
                          >
                            View Profile
                          </a>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Not provided
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400">Resume</div>
                        {selectedApplication.resume ? (
                          <a
                            href={selectedApplication.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                          >
                            <FiEye className="w-3 h-3" />
                            View Resume
                          </a>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Not provided
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Questions */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Application Questions
                  </h4>

                  {(() => {
                    // Get questions for the selected role
                    const selectedRole = roles.find(
                      (role) => role.title === selectedApplication.role
                    );
                    const questionsToShow = selectedRole?.questions || [];

                    return questionsToShow.length > 0 ? (
                      questionsToShow.map((question) => (
                        <div
                          key={question.id}
                          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6"
                        >
                          <h5 className="text-primary font-semibold mb-3 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {question.label}
                          </h5>
                          <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 leading-relaxed">
                            {selectedApplication[question.id] ||
                              "No response provided"}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to default questions if no custom questions are set
                      <>
                        {/* Why Executive */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                          <h5 className="text-primary font-semibold mb-3 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                            Why do you want to be an executive?
                          </h5>
                          <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 leading-relaxed">
                            {selectedApplication.why || "No response provided"}
                          </div>
                        </div>

                        {/* Fintech Vision */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                          <h5 className="text-primary font-semibold mb-3 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            What does &apos;fintech&apos; mean to you, and how
                            do you see its role in the future of business and
                            innovation?
                          </h5>
                          <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 leading-relaxed">
                            {selectedApplication.fintechVision ||
                              "No response provided"}
                          </div>
                        </div>

                        {/* Other Commitments */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                          <h5 className="text-primary font-semibold mb-3 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Are you currently involved with any other clubs or
                            commitments? How do you plan to balance your
                            responsibilities?
                          </h5>
                          <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 leading-relaxed">
                            {selectedApplication.otherCommitments ||
                              "No response provided"}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white hover:bg-gray-600/50 transition-all duration-300 font-medium"
              >
                Close
              </button>
            </div>
      </DashboardCenterModal>

      {/* Add Role Modal */}
      <DashboardCenterModal
        isOpen={showAddRoleModal}
        onClose={closeAddRoleModal}
        size="sm"
      >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Add Executive Role
              </h3>
              <button
                onClick={closeAddRoleModal}
                className="fc-modal-icon-close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={roleForm.title}
                  onChange={handleRoleFormChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g., VP Finance, President, etc."
                />
                {roleFormErrors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleFormErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Responsibilities Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border border-gray-600/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setRoleForm({
                          ...roleForm,
                          responsibilitiesImageFile: null,
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600/50 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="responsibilities-image"
                    />
                    <label
                      htmlFor="responsibilities-image"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <FiUpload className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-300">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <p className="text-xs text-yellow-400 mt-1">
                          If you have a PDF, please convert it to an image first
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                {roleFormErrors.responsibilitiesImageFile && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleFormErrors.responsibilitiesImageFile}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAddRoleModal}
                className="fc-btn-dashboard-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                disabled={uploadingImage}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  "Add Role"
                )}
              </button>
            </div>
      </DashboardCenterModal>

      {/* Edit Role Modal */}
      <DashboardCenterModal
        isOpen={showEditRoleModal}
        onClose={closeEditRoleModal}
        size="sm"
      >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Edit Executive Role
              </h3>
              <button
                onClick={closeEditRoleModal}
                className="fc-modal-icon-close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={roleForm.title}
                  onChange={handleRoleFormChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g., VP Finance, President, etc."
                />
                {roleFormErrors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleFormErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Responsibilities Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border border-gray-600/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setRoleForm({
                          ...roleForm,
                          responsibilitiesImageFile: null,
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600/50 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="edit-responsibilities-image"
                    />
                    <label
                      htmlFor="edit-responsibilities-image"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <FiUpload className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-300">
                          Click to upload new image or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <p className="text-xs text-yellow-400 mt-1">
                          If you have a PDF, please convert it to an image first
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                {roleFormErrors.responsibilitiesImageFile && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleFormErrors.responsibilitiesImageFile}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditRoleModal}
                className="fc-btn-dashboard-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRole}
                disabled={uploadingImage}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  "Update Role"
                )}
              </button>
            </div>
      </DashboardCenterModal>

      {/* Delete Role Modal */}
      <DashboardCenterModal
        isOpen={showDeleteRoleModal}
        onClose={closeDeleteRoleModal}
        size="sm"
      >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Delete Role
              </h3>
              <button
                onClick={closeDeleteRoleModal}
                className="fc-modal-icon-close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Are you sure you want to delete the role{" "}
                <span className="text-white font-medium">
                  {roleToDelete?.title}
                </span>
                ?
              </p>
              <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-400">
                <div>
                  <strong>Role:</strong> {roleToDelete?.title}
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {roleToDelete?.createdAt
                    ? formatDateTimeShort(roleToDelete.createdAt)
                    : "Unknown"}
                </div>
              </div>
              <p className="text-red-400 text-xs sm:text-sm mt-3">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeDeleteRoleModal}
                className="fc-btn-dashboard-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Role
              </button>
            </div>
      </DashboardCenterModal>

      {/* Role Question Modal */}
      <DashboardCenterModal
        isOpen={showRoleQuestionModal}
        onClose={closeRoleQuestionModal}
        size="md"
      >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {editingRoleQuestion ? "Edit Question" : "Add Question"} -{" "}
                {currentRoleForQuestions?.title}
              </h3>
              <button
                onClick={closeRoleQuestionModal}
                className="fc-modal-icon-close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {roleQuestionFormErrors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    {roleQuestionFormErrors.general}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Label *
                </label>
                <textarea
                  name="label"
                  value={roleQuestionForm.label}
                  onChange={handleRoleQuestionFormChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Enter the question text..."
                />
                {roleQuestionFormErrors.label && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleQuestionFormErrors.label}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Placeholder Text *
                </label>
                <textarea
                  name="placeholder"
                  value={roleQuestionForm.placeholder}
                  onChange={handleRoleQuestionFormChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Enter placeholder text for the textarea..."
                />
                {roleQuestionFormErrors.placeholder && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleQuestionFormErrors.placeholder}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="required"
                    checked={roleQuestionForm.required}
                    onChange={handleRoleQuestionFormChange}
                    className="sr-only"
                    id="role-required-checkbox"
                  />
                  <label
                    htmlFor="role-required-checkbox"
                    className="flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded cursor-pointer transition-colors hover:border-primary"
                    style={{
                      backgroundColor: roleQuestionForm.required
                        ? "#8b5cf6"
                        : "transparent",
                    }}
                  >
                    {roleQuestionForm.required && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </label>
                </div>
                <label
                  htmlFor="role-required-checkbox"
                  className="text-sm font-medium text-gray-300 cursor-pointer"
                >
                  Required question
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={closeRoleQuestionModal}
                className="fc-btn-dashboard-cancel"
              >
                Cancel
              </button>
              <button
                onClick={
                  editingRoleQuestion
                    ? handleEditRoleQuestion
                    : handleAddRoleQuestion
                }
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                {editingRoleQuestion ? "Update Question" : "Add Question"}
              </button>
            </div>
      </DashboardCenterModal>
    </div>
  );
}
