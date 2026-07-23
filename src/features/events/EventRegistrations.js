"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal/ConfirmModal";
import {
  FiArrowLeft,
  FiMail,
  FiCalendar,
  FiUser,
  FiMessageSquare,
  FiDownload,
  FiTrash2,
  FiHash,
} from "react-icons/fi";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { downloadCsv } from "@/lib/csv";
import { formatDateShort, formatDateTime, formatEventDate } from "@/lib/dates";

export default function EventRegistrations({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingRegistration, setDeletingRegistration] = useState(null);
  const {
    isOpen: showDeleteModal,
    target: registrationToDelete,
    ask: handleDeleteRegistration,
    close: closeDeleteModal,
  } = useConfirmDelete();

  useDocumentTitle(
    event?.title
      ? `${event.title} - Registrations | FinTech Calgary`
      : "Event Registrations | FinTech Calgary"
  );

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error("Event not found");
        const data = await response.json();
        setEvent(data);
      } catch {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const confirmDeleteRegistration = async () => {
    const indexToDelete = registrationToDelete;

    if (!indexToDelete && indexToDelete !== 0) {
      return;
    }

    setDeletingRegistration(indexToDelete);
    closeDeleteModal();

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationIndex: indexToDelete }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete registration");
      }

      const updatedResponse = await fetch(`/api/events/${eventId}`);
      if (updatedResponse.ok) {
        const updatedEvent = await updatedResponse.json();
        setEvent(updatedEvent);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete registration: " + err.message);
    } finally {
      setDeletingRegistration(null);
    }
  };

  const exportToCSV = () => {
    if (!event?.registrations) return;

    downloadCsv({
      headers: ["Name", "Email", "UCID", "Registration Date", "Comments"],
      rows: event.registrations.map((reg) => [
        reg.name,
        reg.userEmail,
        reg.ucid || "",
        formatDateTime(reg.registeredAt),
        reg.comments || "",
      ]),
      filename: `${event.title}-registrations.csv`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors duration-200 group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </Link>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/80 
            text-white rounded-lg transition-all duration-200 gap-2 shadow-lg 
            hover:shadow-primary/15 hover:-translate-y-0.5"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Event Info Card */}
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 shadow-xl mb-8 border border-gray-800/50">
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
            {event?.title}
          </h1>
          <div className="flex items-center text-gray-300">
            <FiCalendar className="w-5 h-5 mr-3 text-primary" />
            <span className="text-lg">
              {formatEventDate(event?.date)}
            </span>
          </div>
        </div>

        {/* Registrations Section */}
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-800/50 overflow-hidden">
          <div className="p-8 border-b border-gray-800/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-primary" />
              </div>
              Registrations ({event?.registrations?.length || 0})
            </h2>
          </div>

          <div className="divide-y divide-gray-800/50">
            {event?.registrations?.map((reg, index) => (
              <div
                key={index}
                className="p-8 hover:bg-gray-800/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    {/* Name and Delete Button */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors duration-300">
                        {reg.name}
                      </h3>
                      <button
                        onClick={() => handleDeleteRegistration(index)}
                        disabled={deletingRegistration === index}
                        className="text-red-400 hover:text-red-300 transition-all duration-200 p-2 rounded-full hover:bg-red-500/10 disabled:opacity-50 group/delete"
                        title="Delete registration"
                      >
                        {deletingRegistration === index ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-400"></div>
                        ) : (
                          <FiTrash2 className="w-5 h-5 group-hover/delete:scale-110 transition-transform duration-200" />
                        )}
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <div className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center mr-3">
                          <FiMail className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-lg">{reg.userEmail}</span>
                      </div>

                      {reg.ucid && (
                        <div className="flex items-center text-gray-300">
                          <div className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center mr-3">
                            <FiHash className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-lg">UCID: {reg.ucid}</span>
                        </div>
                      )}
                    </div>

                    {/* Comments */}
                    {reg.comments && (
                      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <FiMessageSquare className="w-4 h-4 text-primary" />
                          Comments
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {reg.comments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div className="ml-8 text-right">
                    <div className="text-sm text-gray-400 mb-1">Registered</div>
                    <div className="text-lg font-medium text-white">
                      {formatDateShort(reg.registeredAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(reg.registeredAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {event?.registrations?.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No registrations yet
                </h3>
                <p className="text-gray-500">
                  Registrations will appear here once people sign up for this
                  event.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteRegistration}
        title="Delete Registration"
        message={
          <div>
            <p className="mb-3">
              Are you sure you want to delete the registration for{" "}
              <span className="text-white font-medium">
                {event?.registrations?.[registrationToDelete]?.name}
              </span>
              ?
            </p>
            <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-400">
              <div>
                <strong>Email:</strong>{" "}
                {event?.registrations?.[registrationToDelete]?.userEmail}
              </div>
              {event?.registrations?.[registrationToDelete]?.ucid && (
                <div>
                  <strong>UCID:</strong>{" "}
                  {event?.registrations?.[registrationToDelete]?.ucid}
                </div>
              )}
            </div>
            <p className="text-red-400 text-xs mt-3">
              This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete Registration"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
