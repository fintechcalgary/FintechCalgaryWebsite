"use client";

import { useState } from "react";
import { FiPlus, FiUser } from "react-icons/fi";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Button from "@/components/ui/Button";
import AdminBackLink from "@/components/ui/AdminBackLink";
import { AdminPageHeader } from "@/components/layout/AdminPageShell";
import { LoadingState } from "@/components/ui/Spinner";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, STAFF_ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import { PERMISSIONS, STAFF_ROLES } from "@/lib/permissions";

const ROLE_OPTIONS = STAFF_ROLES.filter((r) => r !== USER_ROLES.ADMIN).concat(
  USER_ROLES.ADMIN,
);

export default function UsersPage() {
  const { loading: authLoading, canAccess } = useRoleAccess(PERMISSIONS.USERS);
  const { data: users, loading, refetch } = useRoleResource(
    API_ENDPOINTS.USERS,
    PERMISSIONS.USERS,
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: USER_ROLES.OUTREACH,
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    try {
      setSubmitting(true);
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create user");
      }

      setShowCreateModal(false);
      setFormData({
        username: "",
        password: "",
        role: USER_ROLES.OUTREACH,
      });
      await refetch();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      await refetch();
    } catch (error) {
      alert(error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          Admin access required to manage users.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container relative mx-auto max-w-7xl animate-fadeIn px-6 py-8">
        <AdminBackLink />

        <AdminPageHeader
          title="Users"
          lede="Manage staff accounts and role-based access"
          actions={
          <Button
            type="button"
            variant="soft"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus className="h-4 w-4" />
            Add User
          </Button>
        }
        />

        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="fc-admin-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="fc-icon">
                  <FiUser className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-sm text-gray-400">
                    {STAFF_ROLE_LABELS[user.role] || user.role}
                  </p>
                </div>
              </div>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className="form-input form-input-auto"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {STAFF_ROLE_LABELS[role] || role}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </main>

      <PortalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Staff User"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          <div>
            <label className="fc-form-label">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="fc-form-label">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="fc-form-label">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="form-input"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {STAFF_ROLE_LABELS[role] || role}
                </option>
              ))}
            </select>
          </div>
          {formError && (
            <p className="fc-alert-error">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="cancel"
              onClick={() => setShowCreateModal(false)}
              className="!flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="!flex-none"
            >
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </PortalModal>
    </div>
  );
}
