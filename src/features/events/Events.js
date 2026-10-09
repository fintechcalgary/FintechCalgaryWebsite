"use client";
import { useState, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiImage,
  FiUser,
} from "react-icons/fi";
import Modal from "@/components/ui/Modal/ConfirmModal";
import PortalModal from "@/components/ui/Modal/ContentModal";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Link from "next/link";
import Image from "next/image";
import { uploadFile } from "@/lib/frontend-helpers";
import { UPLOAD_FOLDERS } from "@/lib/constants";
import { formatEventDate } from "@/lib/dates";
import EmptyState from "@/components/ui/EmptyState";

export default function Events({ mode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname === "/dashboard" || pathname === "/partner-dashboard";
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    imageUrl: "",
    images: [],
    eventType: "event",
    recordingUrl: "",
    isPartner: mode === "partner" ? true : false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/events`);
      const data = await response.json();

      if (mode === "partner") {
        const session = await getSession();
        const userId = session?.user?.id;

        const filteredEvents = data.filter((event) => event.ownerId === userId);
        setEvents(filteredEvents);
        return;
      }

      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  }, [mode]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingEvent
      ? `/api/events/${editingEvent._id}`
      : "/api/events";

    // Include existing registrations when editing
    const body = editingEvent
      ? { ...formData, registrations: editingEvent.registrations }
      : formData;

    const response = await fetch(url, {
      method: editingEvent ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        imageUrl: "",
        images: [],
        eventType: "event",
        recordingUrl: "",
        isPartner: mode === "partner" ? true : false,
      });
      setShowForm(false);
      setEditingEvent(null);
      fetchEvents();
    }
  };

  const handleDelete = async (eventId) => {
    setDeleteModal({
      isOpen: true,
      eventId,
    });
  };

  const confirmDelete = async () => {
    const response = await fetch(`/api/events/${deleteModal.eventId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchEvents();
      setDeleteModal({ isOpen: false, eventId: null });
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split("T")[0], // Keep existing date handling
      time: event.time || "", // Populate the time field
      imageUrl: event.imageUrl || "",
      images: event.images || [],
      registrations: event.registrations?.length || 0,
      eventType: event.eventType || "event",
      recordingUrl: event.recordingUrl || "",
      isPartner: event.isPartner || false,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadFile(file, UPLOAD_FOLDERS.EVENT_IMAGES))
      );

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadedUrls[0], // Set first image as main image for backward compatibility
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      imageUrl: "",
      images: [],
      eventType: "event",
      recordingUrl: "",
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="fc-title text-2xl flex items-center gap-2">
          <FiCalendar className="text-primary" />
          Your Events
        </h3>
        <Button
          type="button"
          variant={showForm ? "cancel" : "primary"}
          onClick={(e) => {
            e.stopPropagation();
            showForm ? resetForm() : setShowForm(true);
          }}
          className="!flex-none !px-4 !py-2"
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      <PortalModal
        isOpen={showForm}
        onClose={resetForm}
        title={editingEvent ? "Edit Event" : "Create Event"}
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="cancel"
              onClick={resetForm}
              disabled={uploading}
              className="!flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="eventForm"
              variant="primary"
              disabled={uploading}
              className="!flex-none"
            >
              {editingEvent ? <FiEdit2 className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
              {uploading
                ? "Please wait..."
                : editingEvent
                  ? "Update Event"
                  : "Add Event"}
            </Button>
          </>
        }
      >
        <form id="eventForm" onSubmit={handleSubmit} className="fc-modal-body">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
            {/* Primary fields — left on desktop */}
            <div className="space-y-4 lg:col-span-3">
              <div
                className={`grid gap-4 ${
                  formData.eventType === "webinar"
                    ? "sm:grid-cols-5"
                    : "sm:grid-cols-2"
                }`}
              >
                <div
                  className={
                    formData.eventType === "webinar" ? "sm:col-span-2" : ""
                  }
                >
                  <label
                    htmlFor="eventType"
                    className="fc-form-label"
                  >
                    Event Type
                  </label>
                  <select
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eventType: e.target.value,
                      })
                    }
                    className="form-input"
                    required
                  >
                    <option value="event">Event</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                {formData.eventType === "webinar" ? (
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="recordingUrl"
                      className="fc-form-label"
                    >
                      Webinar Link (Optional)
                    </label>
                    <input
                      id="recordingUrl"
                      type="text"
                      placeholder="Webinar link (can be added later)"
                      value={formData.recordingUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recordingUrl: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="fc-form-label">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="fc-form-label">
                  Description
                </label>
                <textarea
                  placeholder="Event Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="form-input min-h-[120px] lg:min-h-[160px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="fc-form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="fc-form-label">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5:30PM-7:30PM"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Media / tip — right rail on desktop */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                <div className="flex-shrink-0 pt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="fc-muted text-xs leading-relaxed sm:text-sm">
                  <span className="font-medium text-white">Tip:</span> Use
                  high-resolution images. Include{" "}
                  <span className="font-medium text-white">AM / PM</span> in the
                  time.
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-700/50 bg-gray-900/40 p-4">
                <label className="fc-form-label">
                  Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="eventImageUpload"
                  multiple
                  required={formData.images.length === 0}
                />
                <label
                  htmlFor="eventImageUpload"
                  className={`fc-modal-file-btn w-full justify-center ${
                    uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <FiImage className="h-5 w-5" />
                  {uploading ? "Uploading..." : "Choose Images"}
                </label>

                {formData.images.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                    {formData.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square w-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="rounded-lg border border-gray-700 object-cover"
                          fill
                          sizes="(max-width: 1024px) 33vw, 160px"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                              imageUrl:
                                index === 0
                                  ? prev.images[1] || ""
                                  : prev.imageUrl,
                            }))
                          }
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 hover:bg-red-600 p-1.5 text-white"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="fc-muted mt-4 text-center text-xs">
                    Add at least one image for the event banner.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </PortalModal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event._id}
            className="fc-admin-panel overflow-hidden"
          >
            <div className="aspect-video w-full relative group">
              {event.images?.length > 0 ? (
                <div className="relative w-full h-full">
                  <Image
                    src={event.images[0]}
                    alt={event.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                  {event.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
                      +{event.images.length - 1} more
                    </div>
                  )}
                </div>
              ) : (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-semibold text-foreground">
                  {event.title}
                </h4>
                <div className="flex gap-2 relative z-20">
                  <IconButton
                    variant="edit"
                    label="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(event);
                    }}
                  >
                    <FiEdit2 />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event._id);
                    }}
                  >
                    <FiTrash2 />
                  </IconButton>
                </div>
              </div>
              <p className="fc-body mb-4 line-clamp-3">
                {event.description}
              </p>
              <div className="fc-muted">
                {formatEventDate(event.date)}
                {event.time && ` at ${event.time}`}{" "}
                {/* Display time if available */}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="fc-muted">
                      {event.registrations?.length || 0} registered
                    </p>
                  </div>
                  {!isDashboard && (
                    <Link
                      href={`/events/register/${event._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="fc-btn-gradient-primary !px-4 !py-2 text-sm"
                    >
                      Register for Event
                    </Link>
                  )}
                </div>
                {isDashboard && event.registrations?.length > 0 && (
                  <div className="mt-3">
                    <Link
                      href={`/events/${event._id}/registrations`}
                      onClick={(e) => e.stopPropagation()}
                      className="fc-link text-sm transition-all duration-200 inline-flex items-center gap-2 hover:scale-105 relative z-20"
                    >
                      <FiUser className="w-4 h-4" />
                      View {event.registrations.length} Registration
                      {event.registrations.length !== 1 ? "s" : ""}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !showForm && (
        <EmptyState
          variant="public"
          icon={FiCalendar}
          minHeightClass="min-h-[400px]"
        >
          No events yet. Create your first event!
        </EmptyState>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null })}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete Event"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
