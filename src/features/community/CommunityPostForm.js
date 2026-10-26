"use client";

import { useState } from "react";
import Image from "next/image";
import { FiImage, FiX } from "react-icons/fi";
import ContentModal from "@/components/ui/Modal/ContentModal";
import Button from "@/components/ui/Button";
import { uploadFile } from "@/lib/frontend-helpers";
import { API_ENDPOINTS, UPLOAD_FOLDERS } from "@/lib/constants";
import { toCommunityPostFormState } from "@/lib/communityPosts";

export default function CommunityPostForm({
  isOpen,
  onClose,
  onSaved,
  editingPost = null,
}) {
  const [formData, setFormData] = useState(() =>
    toCommunityPostFormState(editingPost),
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      updateField(
        "bannerUrl",
        await uploadFile(file, UPLOAD_FOLDERS.COMMUNITY_BANNERS),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to upload banner image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = editingPost
        ? `${API_ENDPOINTS.COMMUNITY_POSTS}/${editingPost._id}`
        : API_ENDPOINTS.COMMUNITY_POSTS;

      const response = await fetch(url, {
        method: editingPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to save community post");
      }

      onSaved?.(data);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save community post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPost ? "Edit Community Post" : "Share Community Event"}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button
            variant="cancel"
            type="button"
            onClick={onClose}
            disabled={submitting || uploading}
            className="!flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="communityPostForm"
            disabled={submitting || uploading}
            className="!flex-none"
          >
            {submitting
              ? "Saving..."
              : editingPost
                ? "Save Changes"
                : "Publish Post"}
          </Button>
        </>
      }
    >
      <form
        id="communityPostForm"
        onSubmit={handleSubmit}
        className="fc-modal-body space-y-4"
      >
        <p className="fc-body text-sm">
          Promote partner and community events with event details, an optional
          banner, and a registration link.
        </p>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div>
          <label className="fc-form-label">
            Event Title
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Calgary FinTech Meetup"
            required
          />
        </div>

        <div>
          <label className="fc-form-label">
            Event Info
          </label>
          <textarea
            className="form-input min-h-[100px]"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Share what the event is about and why the community should attend..."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="fc-form-label">
              Event Date
            </label>
            <input
              type="date"
              className="form-input"
              value={formData.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="fc-form-label">
              Event Time (optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.eventTime}
              onChange={(e) => updateField("eventTime", e.target.value)}
              placeholder="e.g. 6:00 PM MT"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="fc-form-label">
              Organization (optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.organizationName}
              onChange={(e) => updateField("organizationName", e.target.value)}
              placeholder="Hosting organization"
            />
          </div>
          <div>
            <label className="fc-form-label">
              Location (optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Venue or online"
            />
          </div>
        </div>

        <div>
          <label className="fc-form-label">
            Registration Link
          </label>
          <input
            type="url"
            className="form-input"
            value={formData.registrationUrl}
            onChange={(e) => updateField("registrationUrl", e.target.value)}
            placeholder="https://..."
            required
          />
        </div>

        <div>
          <label className="fc-form-label">
            Event Banner (optional)
          </label>
          {formData.bannerUrl ? (
            <div className="relative mb-3 overflow-hidden rounded-xl border border-gray-700/50">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={formData.bannerUrl}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => updateField("bannerUrl", "")}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                aria-label="Remove banner"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600/50 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:border-primary/40 hover:text-primary">
            <FiImage className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Banner"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={uploading || submitting}
            />
          </label>
        </div>
      </form>
    </ContentModal>
  );
}
