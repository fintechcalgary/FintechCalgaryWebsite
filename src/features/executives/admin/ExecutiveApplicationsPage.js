"use client";

import { useEffect, useState } from "react";
import {
  FiDownload,
  FiX,
  FiUpload,
} from "react-icons/fi";
import Image from "next/image";
import DashboardCenterModal from "@/components/ui/Modal/DashboardModal";
import ConfirmModal from "@/components/ui/Modal/ConfirmModal";
import ModalCloseButton from "@/components/ui/Modal/ModalCloseButton";
import AdminBackLink from "@/components/ui/AdminBackLink";
import {
  AdminPageTitle,
  AdminPageLede,
} from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import RoleManager from "@/features/executives/admin/RoleManager";
import ApplicationList from "@/features/executives/admin/ApplicationList";
import { LoadingState, InlineSpinner } from "@/components/ui/Spinner";
import { useSettings } from "@/contexts/SettingsContext";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import useFileUpload from "@/hooks/useFileUpload";
import useRoleAccess from "@/hooks/useRoleAccess";
import { downloadCsv } from "@/lib/csv";
import { formatDateShort, formatDateTimeShort, todayIsoDate } from "@/lib/dates";
import { UPLOAD_FOLDERS } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function ExecutiveApplicationsPage() {
  const { status, canAccess, isLoading: authLoading, isAdmin } = useRoleAccess(
    PERMISSIONS.EXECUTIVE_APPLICATIONS,
  );
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
    if (authLoading || status !== "authenticated" || !canAccess) {
      return;
    }

    fetchApplications();
    if (isAdmin) {
      fetchRoles();
    } else {
      setRolesLoading(false);
    }
  }, [authLoading, status, canAccess, isAdmin]);

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

  if (authLoading || status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState size="lg" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-6 py-8 max-w-7xl relative animate-fadeIn">
        <AdminBackLink />

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <AdminPageTitle>Executive Applications</AdminPageTitle>
            <AdminPageLede>
              Review and manage executive team applications
            </AdminPageLede>
          </div>
          {applications.length > 0 ? (
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-600/20 px-4 py-2 text-sm text-green-400 transition-all duration-300 hover:bg-green-600/30"
            >
              <FiDownload className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          ) : null}
        </div>

        {isAdmin ? (
          <>
            {/* Executive Applications Toggle */}
            <GlowCard
              customSize
              glowColor="purple"
              className="mb-8 w-full max-w-md !gap-0 !p-6"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="fc-title text-lg">
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
                        executiveApplicationsOpen
                          ? "translate-x-8"
                          : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
                <div className="fc-muted">
                  {executiveApplicationsOpen
                    ? "Executive applications are currently open and accepting submissions."
                    : "Executive applications are currently closed."}
                </div>
                {settingsError && (
                  <div className="text-red-400 text-sm mt-2">{settingsError}</div>
                )}
              </div>
            </GlowCard>

            <RoleManager
              roles={roles}
              rolesLoading={rolesLoading}
              executiveApplicationsOpen={executiveApplicationsOpen}
              onAddClick={openAddRoleModal}
              onEditClick={openEditRoleModal}
              onDeleteClick={openDeleteRoleModal}
              onAddQuestion={(role) => openRoleQuestionModal(role)}
              onEditQuestion={(role, question) =>
                openRoleQuestionModal(role, question)
              }
              onDeleteQuestion={handleDeleteRoleQuestion}
              formatDate={formatDateTimeShort}
            />
          </>
        ) : null}

        <ApplicationList
          applications={applications}
          error={error}
          fetchApplications={fetchApplications}
          formatDate={formatDateTimeShort}
          onDeleteClick={openDeleteModal}
          deletingId={deletingId}
        />
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        type="danger"
        confirmText={
          deletingId === applicationToDelete?._id ? "Deleting..." : "Delete"
        }
        confirmDisabled={deletingId === applicationToDelete?._id}
        message={
          <>
            <p className="mb-4">
              Are you sure you want to delete the application for{" "}
              <span className="font-medium text-white">
                {applicationToDelete?.name}
              </span>
              ?
            </p>
            <div className="mb-3 rounded-lg bg-gray-800/50 p-3 fc-muted">
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
            <p className="text-sm text-red-400">This action cannot be undone.</p>
          </>
        }
      />

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
              <ModalCloseButton onClick={closeAddRoleModal} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="fc-form-label">
                  Role Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={roleForm.title}
                  onChange={handleRoleFormChange}
                  className="form-input"
                  placeholder="e.g., VP Finance, President, etc."
                />
                {roleFormErrors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleFormErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="fc-form-label">
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
                        <p className="fc-body">
                          Click to upload or drag and drop
                        </p>
                        <p className="fc-muted text-xs mt-1">
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
              <Button
                type="button"
                variant="cancel"
                onClick={closeAddRoleModal}
                className="!flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddRole}
                disabled={uploadingImage}
                className="flex-1 !px-4 !py-2"
              >
                {uploadingImage ? (
                  <>
                    <InlineSpinner className="text-white" />
                    Uploading...
                  </>
                ) : (
                  "Add Role"
                )}
              </Button>
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
              <ModalCloseButton onClick={closeEditRoleModal} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="fc-form-label">
                  Role Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={roleForm.title}
                  onChange={handleRoleFormChange}
                  className="form-input"
                  placeholder="e.g., VP Finance, President, etc."
                />
                {roleFormErrors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleFormErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="fc-form-label">
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
                        <p className="fc-body">
                          Click to upload new image or drag and drop
                        </p>
                        <p className="fc-muted text-xs mt-1">
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
              <Button
                type="button"
                variant="cancel"
                onClick={closeEditRoleModal}
                className="!flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleEditRole}
                disabled={uploadingImage}
                className="flex-1 !px-4 !py-2"
              >
                {uploadingImage ? (
                  <>
                    <InlineSpinner className="text-white" />
                    Uploading...
                  </>
                ) : (
                  "Update Role"
                )}
              </Button>
            </div>
      </DashboardCenterModal>

      <ConfirmModal
        isOpen={showDeleteRoleModal}
        onClose={closeDeleteRoleModal}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        type="danger"
        confirmText="Delete Role"
        message={
          <>
            <p className="mb-4">
              Are you sure you want to delete the role{" "}
              <span className="font-medium text-white">
                {roleToDelete?.title}
              </span>
              ?
            </p>
            <div className="mb-3 rounded-lg bg-gray-800/50 p-3 fc-muted">
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
            <p className="text-sm text-red-400">This action cannot be undone.</p>
          </>
        }
      />

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
              <ModalCloseButton onClick={closeRoleQuestionModal} />
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
                <label className="fc-form-label">
                  Question Label *
                </label>
                <textarea
                  name="label"
                  value={roleQuestionForm.label}
                  onChange={handleRoleQuestionFormChange}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Enter the question text..."
                />
                {roleQuestionFormErrors.label && (
                  <p className="text-red-400 text-xs mt-1">
                    {roleQuestionFormErrors.label}
                  </p>
                )}
              </div>

              <div>
                <label className="fc-form-label">
                  Placeholder Text *
                </label>
                <textarea
                  name="placeholder"
                  value={roleQuestionForm.placeholder}
                  onChange={handleRoleQuestionFormChange}
                  rows={2}
                  className="form-input resize-none"
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
              <Button
                type="button"
                variant="cancel"
                onClick={closeRoleQuestionModal}
                className="!flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={
                  editingRoleQuestion
                    ? handleEditRoleQuestion
                    : handleAddRoleQuestion
                }
                className="flex-1 !px-4 !py-2"
              >
                {editingRoleQuestion ? "Update Question" : "Add Question"}
              </Button>
            </div>
      </DashboardCenterModal>
    </div>
  );
}
