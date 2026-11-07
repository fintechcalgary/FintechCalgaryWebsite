"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal/ConfirmModal";
import Button from "@/components/ui/Button";
import AdminBackLink from "@/components/ui/AdminBackLink";
import { AdminPageTitle } from "@/components/ui/SectionHeading";
import IconButton from "@/components/ui/IconButton";
import {
  FiMail,
  FiCalendar,
  FiUser,
  FiMessageSquare,
  FiDownload,
  FiTrash2,
  FiHash,
  FiBook,
} from "react-icons/fi";
import useConfirmDelete from "@/hooks/useConfirmDelete";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { downloadCsv } from "@/lib/csv";
import { formatDateShort, formatDateTime, formatEventDate } from "@/lib/dates";
import { LoadingState, InlineSpinner } from "@/components/ui/Spinner";

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
      headers: [
        "Name",
        "Email",
        "UofC Student",
        "UCID",
        "School",
        "Major",
        "Registration Date",
        "Comments",
      ],
      rows: event.registrations.map((reg) => [
        reg.name,
        reg.userEmail,
        reg.isUofCStudent === true
          ? "Yes"
          : reg.isUofCStudent === false
            ? "No"
            : "",
        reg.ucid || "",
        reg.school || "",
        reg.major || "",
        formatDateTime(reg.registeredAt),
        reg.comments || "",
      ]),
      filename: `${event.title}-registrations.csv`,
    });
  };

  if (loading) {
    return <LoadingState fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="container relative mx-auto max-w-7xl animate-fadeIn px-6 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <AdminBackLink className="!mb-0" />
          <Button onClick={exportToCSV} variant="success-soft">
            <FiDownload className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="fc-admin-panel mb-8 p-8 shadow-xl">
          <AdminPageTitle className="mb-4" sizeClass="text-3xl sm:text-4xl">
            {event?.title}
          </AdminPageTitle>
          <div className="flex items-center fc-body text-lg">
            <span className="fc-icon mr-3">
              <FiCalendar className="h-5 w-5" />
            </span>
            <span className="text-lg">
              {formatEventDate(event?.date)}
            </span>
          </div>
        </div>

        {/* Registrations Section */}
        <div className="fc-admin-panel overflow-hidden shadow-xl">
          <div className="border-b border-gray-800/50 p-8">
            <h2 className="fc-title flex items-center gap-3 text-2xl">
              <span className="fc-icon-tile">
                <FiUser className="h-5 w-5" />
              </span>
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
                      <IconButton
                        variant="danger"
                        label="Delete registration"
                        disabled={deletingRegistration === index}
                        onClick={() => handleDeleteRegistration(index)}
                      >
                        {deletingRegistration === index ? (
                          <InlineSpinner className="text-red-400" />
                        ) : (
                          <FiTrash2 className="w-5 h-5" />
                        )}
                      </IconButton>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div className="flex items-center fc-body text-lg">
                        <span className="fc-icon mr-3">
                          <FiMail className="h-4 w-4" />
                        </span>
                        <span>{reg.userEmail}</span>
                      </div>

                      {reg.ucid && (
                        <div className="flex items-center fc-body text-lg">
                          <span className="fc-icon mr-3">
                            <FiHash className="h-4 w-4" />
                          </span>
                          <span>UCID: {reg.ucid}</span>
                        </div>
                      )}

                      {reg.school && (
                        <div className="flex items-center fc-body text-lg">
                          <span className="fc-icon mr-3">
                            <FiUser className="h-4 w-4" />
                          </span>
                          <span>School: {reg.school}</span>
                        </div>
                      )}

                      {reg.major && (
                        <div className="flex items-center fc-body text-lg">
                          <span className="fc-icon mr-3">
                            <FiBook className="h-4 w-4" />
                          </span>
                          <span>Major: {reg.major}</span>
                        </div>
                      )}
                    </div>

                    {/* Comments */}
                    {reg.comments && (
                      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="flex items-center gap-2 fc-muted mb-2">
                          <span className="fc-icon">
                            <FiMessageSquare className="h-4 w-4" />
                          </span>
                          Comments
                        </div>
                        <p className="fc-body">
                          {reg.comments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div className="ml-8 text-right">
                    <div className="fc-muted mb-1">Registered</div>
                    <div className="text-lg font-medium text-white">
                      {formatDateShort(reg.registeredAt)}
                    </div>
                    <div className="fc-muted">
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
                <span className="fc-icon mx-auto mb-4">
                  <FiUser className="h-8 w-8" />
                </span>
                <h3 className="text-xl font-semibold fc-muted mb-2">
                  No registrations yet
                </h3>
                <p className="fc-muted">
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
            <div className="bg-gray-800/50 rounded-lg p-3 fc-muted">
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
              {event?.registrations?.[registrationToDelete]?.school && (
                <div>
                  <strong>School:</strong>{" "}
                  {event?.registrations?.[registrationToDelete]?.school}
                </div>
              )}
              {event?.registrations?.[registrationToDelete]?.major && (
                <div>
                  <strong>Major:</strong>{" "}
                  {event?.registrations?.[registrationToDelete]?.major}
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
