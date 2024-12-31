"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import Modal from "./Modal";
import Link from "next/link";

export default function Events() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    imageUrl: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
  });
  const [showRegistrations, setShowRegistrations] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const response = await fetch("/api/events");
    const data = await response.json();
    setEvents(data);
  };

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
      setFormData({ title: "", description: "", date: "" });
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
      date: event.date.split("T")[0],
      imageUrl: event.imageUrl || "",
      registrations: event.registrations?.length || 0,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      });

      if (response.ok) {
        fetchEvents(); // Refresh the events list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register for event");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      imageUrl: "",
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FiCalendar className="text-primary" />
          Your Events
        </h3>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Cancel" : "Add Event"}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4">
          <div className="relative w-full max-w-4xl mx-auto bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Form Section */}
              <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter event description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                      required={!formData.imageUrl}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-700 text-white border border-gray-700 hover:border-primary transition-all duration-200"
                    >
                      <FiImage className="w-5 h-5" />
                      <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                    </label>
                    {formData.imageUrl && (
                      <div className="relative w-16 h-16">
                        <img
                          src={formData.imageUrl}
                          alt="Event preview"
                          className="w-full h-full object-cover rounded-lg border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, imageUrl: "" }))
                          }
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-200"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {editingEvent ? (
                      <>
                        <FiEdit2 className="w-4 h-4" />
                        Update Event
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4" />
                        Create Event
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Preview Section - Hidden on mobile */}
              <div className="flex-1 bg-gray-800/50 rounded-lg overflow-hidden shadow-lg hidden md:block">
                <h3 className="text-lg font-semibold text-white px-4 pt-4">
                  Preview Event
                </h3>
                <div className="mt-2">
                  <div className="aspect-video w-full">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt={formData.title || "Event Image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
                        No Image Selected
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-semibold text-white">
                        {formData.title || "Event Title"}
                      </h4>
                    </div>
                    <p className="text-gray-400 mb-3 line-clamp-3">
                      {formData.description ||
                        "Event description will appear here."}
                    </p>
                    <div className="text-sm text-gray-500">
                      {formData.date
                        ? new Date(formData.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Select a date"}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">
                          {formData.registrations || 0} registered
                        </p>
                        <button className="px-3 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors text-sm font-medium">
                          Register for Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-gray-800/50 rounded-lg overflow-hidden"
          >
            <div className="aspect-video w-full">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-semibold text-foreground">
                  {event.title}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <p className="text-gray-400 mb-4 line-clamp-3">
                {event.description}
              </p>
              <div className="text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">
                      {event.registrations?.length || 0} registered
                    </p>
                  </div>
                  {!isDashboard && (
                    <Link
                      href={`/events/register/${event._id}`}
                      className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Register for Event
                    </Link>
                  )}
                </div>
                {isDashboard && event.registrations?.length > 0 && (
                  <div className="mt-3">
                    <Link
                      href={`/events/${event._id}/registrations`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
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
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <FiCalendar className="mx-auto text-4xl text-primary mb-4" />
          <p className="text-gray-400">
            No events yet. Create your first event!
          </p>
        </div>
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
