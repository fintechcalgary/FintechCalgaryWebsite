"use client";

import { useEffect, useState } from "react";
import { FiExternalLink, FiMessageCircle, FiPlus } from "react-icons/fi";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/Modal/ConfirmModal";
import { LoadingState } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import CommunityPostCard from "@/features/community/CommunityPostCard";
import CommunityPostForm from "@/features/community/CommunityPostForm";
import { API_ENDPOINTS } from "@/lib/constants";

export default function CommunityPostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, post: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.COMMUNITY_POSTS);
        const data = await response.json();
        if (!cancelled) {
          setPosts(response.ok && Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openForm = (post = null) => {
    setEditingPost(post);
    setFormKey((k) => k + 1);
    setShowForm(true);
  };

  const handleSaved = (savedPost) => {
    setPosts((prev) => {
      const exists = prev.some((p) => p._id === savedPost._id);
      return exists
        ? prev.map((p) => (p._id === savedPost._id ? savedPost : p))
        : [savedPost, ...prev];
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.post?._id || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.COMMUNITY_POSTS}/${deleteModal.post._id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete post");
      }
      setPosts((prev) => prev.filter((p) => p._id !== deleteModal.post._id));
      setDeleteModal({ isOpen: false, post: null });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="fc-body text-sm">
          Posts appear on the public{" "}
          <Link
            href="/community"
            className="fc-link-underline inline-flex items-center gap-1"
          >
            Community Board
            <FiExternalLink className="h-3.5 w-3.5" />
          </Link>
          .
        </p>
        <Button
          variant="primary"
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Share Event
        </Button>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          variant="admin"
          icon={FiMessageCircle}
          title="No community posts yet"
        >
          Share an upcoming partner or community event to promote it on the
          public board.
        </EmptyState>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <CommunityPostCard
              key={post._id}
              post={post}
              canManage
              onEdit={openForm}
              onDelete={(p) => setDeleteModal({ isOpen: true, post: p })}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <CommunityPostForm
          key={formKey}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingPost(null);
          }}
          onSaved={handleSaved}
          editingPost={editingPost}
        />
      ) : null}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          if (!deleting) setDeleteModal({ isOpen: false, post: null });
        }}
        onConfirm={confirmDelete}
        title="Delete Community Post"
        message={`Are you sure you want to delete "${deleteModal.post?.title || "this post"}"? This cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        confirmDisabled={deleting}
        type="danger"
      />
    </div>
  );
}
