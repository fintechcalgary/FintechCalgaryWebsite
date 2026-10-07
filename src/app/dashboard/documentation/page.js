"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiChevronRight,
  FiDownload,
  FiFile,
  FiFolder,
  FiFolderPlus,
  FiPlus,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Modal from "@/components/ui/Modal/ConfirmModal";
import useRoleAccess from "@/hooks/useRoleAccess";
import useRoleResource from "@/hooks/useRoleResource";
import { API_ENDPOINTS, FILE_TYPES } from "@/lib/constants";
import { PERMISSIONS } from "@/lib/permissions";

export default function DocumentationPage() {
  const {
    isLoading: authLoading,
    canAccess,
    canManageDocumentation,
    canManageDocumentationFolder,
  } = useRoleAccess(PERMISSIONS.DOCUMENTATION);

  const {
    data: folders,
    loading,
    refetch: refetchFolders,
  } = useRoleResource(
    API_ENDPOINTS.DOCUMENTATION_FOLDERS,
    PERMISSIONS.DOCUMENTATION,
  );

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderForm, setFolderForm] = useState({ name: "", description: "" });
  const [folderError, setFolderError] = useState("");
  const [folderSubmitting, setFolderSubmitting] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", description: "" });
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [folderToDelete, setFolderToDelete] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);

  const loadDocuments = useCallback(async (folderId) => {
    if (!folderId) {
      setDocuments([]);
      return;
    }

    try {
      setDocumentsLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.DOCUMENTATION_FOLDERS}/${folderId}/documents`,
      );
      if (!response.ok) throw new Error("Failed to load documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFolder?._id) {
      loadDocuments(selectedFolder._id);
    } else {
      setDocuments([]);
    }
  }, [selectedFolder, loadDocuments]);

  useEffect(() => {
    if (!selectedFolder?._id || !folders?.length) return;
    const updated = folders.find((f) => f._id === selectedFolder._id);
    if (
      updated &&
      (updated.documentCount !== selectedFolder.documentCount ||
        updated.name !== selectedFolder.name ||
        updated.description !== selectedFolder.description)
    ) {
      setSelectedFolder(updated);
    }
  }, [folders, selectedFolder]);

  const canManageSelected =
    selectedFolder && canManageDocumentationFolder(selectedFolder.slug);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (folderSubmitting) return;
    setFolderError("");

    if (!folderForm.name.trim()) {
      setFolderError("Folder name is required.");
      return;
    }

    try {
      setFolderSubmitting(true);
      const response = await fetch(API_ENDPOINTS.DOCUMENTATION_FOLDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderForm.name.trim(),
          description: folderForm.description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create folder");
      }

      setShowFolderModal(false);
      setFolderForm({ name: "", description: "" });
      await refetchFolders();
    } catch (error) {
      setFolderError(error.message);
    } finally {
      setFolderSubmitting(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (uploading || !selectedFolder) return;
    setUploadError("");

    if (!uploadForm.title.trim()) {
      setUploadError("Title is required.");
      return;
    }
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      const body = new FormData();
      body.append("title", uploadForm.title.trim());
      body.append("description", uploadForm.description.trim());
      body.append("file", file);

      const response = await fetch(
        `${API_ENDPOINTS.DOCUMENTATION_FOLDERS}/${selectedFolder._id}/documents`,
        { method: "POST", body },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload document");
      }

      setShowUploadModal(false);
      setUploadForm({ title: "", description: "" });
      setFile(null);
      await Promise.all([
        loadDocuments(selectedFolder._id),
        refetchFolders(),
      ]);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.DOCUMENTATION_FOLDERS}/${folderToDelete._id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete folder");
      }
      if (selectedFolder?._id === folderToDelete._id) {
        setSelectedFolder(null);
      }
      setFolderToDelete(null);
      await refetchFolders();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.DOCUMENTATION_DOCUMENTS}/${docToDelete._id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete document");
      setDocToDelete(null);
      await Promise.all([
        loadDocuments(selectedFolder._id),
        refetchFolders(),
      ]);
    } catch (error) {
      alert(error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          You don&apos;t have permission to view documentation.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Documentation</h1>
            <p className="text-gray-400 text-lg">
              Club documentation folders and uploaded records
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all flex items-center gap-2 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </Link>
            {canManageDocumentation && (
              <button
                onClick={() => setShowFolderModal(true)}
                className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all flex items-center gap-2 text-sm"
              >
                <FiFolderPlus className="w-4 h-4" />
                New Folder
              </button>
            )}
          </div>
        </div>

        {!selectedFolder ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-gray-400 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
                <FiFolder className="mx-auto text-4xl mb-4 text-primary" />
                <p>No documentation folders yet.</p>
              </div>
            ) : (
              folders.map((folder) => (
                <button
                  key={folder._id}
                  type="button"
                  onClick={() => setSelectedFolder(folder)}
                  className="text-left bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-primary/40 hover:bg-gray-900/80 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/15 text-primary">
                        <FiFolder className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {folder.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {folder.documentCount}{" "}
                          {folder.documentCount === 1
                            ? "document"
                            : "documents"}
                        </p>
                      </div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors mt-1" />
                  </div>
                  {folder.description && (
                    <p className="text-gray-400 text-sm mt-4 line-clamp-2">
                      {folder.description}
                    </p>
                  )}
                </button>
              ))
            )}
          </section>
        ) : (
          <section className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedFolder(null)}
                  className="text-sm text-gray-400 hover:text-white mb-3 flex items-center gap-1"
                >
                  <FiArrowLeft className="w-3.5 h-3.5" />
                  All folders
                </button>
                <h2 className="text-2xl font-semibold text-white">
                  {selectedFolder.name}
                </h2>
                {selectedFolder.description && (
                  <p className="text-gray-400 mt-2">
                    {selectedFolder.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {canManageSelected && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all flex items-center gap-2 text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Upload Document
                  </button>
                )}
                {canManageDocumentation && !selectedFolder.protected && (
                  <button
                    onClick={() => setFolderToDelete(selectedFolder)}
                    className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Folder
                  </button>
                )}
              </div>
            </div>

            {documentsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiFile className="mx-auto text-4xl mb-4 text-primary" />
                <p>No documents in this folder yet.</p>
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
                        href={`${API_ENDPOINTS.DOCUMENTATION_DOCUMENTS}/${doc._id}`}
                        className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all flex items-center gap-2 text-sm"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download
                      </a>
                      {canManageSelected && (
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
        )}
      </main>

      <PortalModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="Create Folder"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateFolder} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Folder name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={folderForm.name}
              onChange={(e) =>
                setFolderForm({ ...folderForm, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
              placeholder="e.g. Legal Templates"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={folderForm.description}
              onChange={(e) =>
                setFolderForm({ ...folderForm, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white resize-none"
              placeholder="What belongs in this folder?"
            />
          </div>
          {folderError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {folderError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowFolderModal(false)}
              className="px-6 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={folderSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-50"
            >
              {folderSubmitting ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </PortalModal>

      <PortalModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title={`Upload to ${selectedFolder?.name || "Folder"}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, title: e.target.value })
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
              value={uploadForm.description}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, description: e.target.value })
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
              accept={FILE_TYPES.FINANCE.EXTENSIONS.map((ext) => `.${ext}`).join(
                ",",
              )}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary"
              required
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <FiUpload className="w-3 h-3" />
              Excel, Word, PDF, CSV (max 15MB)
            </p>
          </div>
          {uploadError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {uploadError}
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
              disabled={uploading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </PortalModal>

      <Modal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        message={`Delete "${folderToDelete?.name}" and all documents inside it? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <Modal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message={`Delete "${docToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
