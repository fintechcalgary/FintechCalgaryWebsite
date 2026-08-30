"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiUser } from "react-icons/fi";
import Navbar from "@/components/layout/AdminNavbar";
import PortalModal from "@/components/ui/Modal/ContentModal";
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
    email: "",
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
        email: "",
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
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          Admin access required to manage users.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Users</h1>
            <p className="text-gray-400 text-lg">
              Manage staff accounts and role-based access
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all flex items-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all flex items-center gap-2 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900/60 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <FiUser className="text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {STAFF_ROLE_LABELS[role] || role}
                </option>
              ))}
            </select>
          </div>
          {formError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </PortalModal>
    </div>
  );
}
