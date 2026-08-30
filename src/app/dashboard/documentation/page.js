"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiDownload, FiFile, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import Navbar from "@/components/layout/AdminNavbar";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Modal from "@/components/ui/Modal/ConfirmModal";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, FILE_TYPES } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";

export default function DocumentationPage() {
  const { loading: authLoading, canAccess, canManageFinance } = useRoleAccess(
    PERMISSIONS.DOCUMENTATION,
  );
  const { data: documents, loading, refetch } = useRoleResource(
    API_ENDPOINTS.DOCUMENTATION_FINANCE,
    PERMISSIONS.DOCUMENTATION,
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!file) {
      setFormError("Please select a file to upload.");
      return;
    }

    try {
      setSubmitting(true);
      const body = new FormData();
      body.append("title", formData.title.trim());
      body.append("description", formData.description.trim());
      body.append("file", file);

      const response = await fetch(API_ENDPOINTS.DOCUMENTATION_FINANCE, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload document");
      }

      setShowUploadModal(false);
      setFormData({ title: "", description: "" });
      setFile(null);
      await refetch();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.DOCUMENTATION_FINANCE}/${docToDelete._id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete document");
      setDocToDelete(null);
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
          You don&apos;t have permission to view documentation.
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
            <h1 className="text-4xl font-bold text-white">Documentation</h1>
            <p className="text-gray-400 text-lg">
              Club documentation and finance records
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
            {canManageFinance && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all flex items-center gap-2 text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Upload Finance Document
              </button>
            )}
          </div>
        </div>

        <section className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-2">Finance</h2>
          <p className="text-gray-400 mb-6">
            Excel, Word, PDF, and other finance documents for tracking club
            finances.
          </p>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiFile className="mx-auto text-4xl mb-4 text-primary" />
              <p>No finance documents yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-800/40 border border-gray-700/40"
                >
                  <div>
                    <h3 className="text-white font-medium">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-sm text-gray-400 mt-1">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {doc.file?.filename} · {doc.uploadedBy} ·{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${API_ENDPOINTS.DOCUMENTATION_FINANCE}/${doc._id}`}
                      className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all flex items-center gap-2 text-sm"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                    {canManageFinance && (
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <PortalModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Finance Document"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept={FILE_TYPES.FINANCE.EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary"
              required
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <FiUpload className="w-3 h-3" />
              Excel, Word, PDF, CSV (max 15MB)
            </p>
          </div>
          {formError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-6 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-50"
            >
              {submitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </PortalModal>

      <Modal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Delete "${docToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
