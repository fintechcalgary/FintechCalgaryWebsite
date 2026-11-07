"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { PageTitle } from "@/components/ui/SectionHeading";
import { LoadingState } from "@/components/ui/Spinner";
import {
  isRegistrationOpen,
  REGISTRATION_CLOSED_MESSAGE,
} from "@/lib/eventRegistration";

export default function RegisterEventForm({ eventId }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    isUofCStudent: "",
    ucid: "",
    school: "",
    major: "",
    comments: "",
    companyName: "",
    companyRole: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleStudentStatusChange = (value) => {
    setFormData({
      ...formData,
      isUofCStudent: value,
      ucid: value === "yes" ? formData.ucid : "",
      school: value === "no" ? formData.school : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        isUofCStudent: formData.isUofCStudent === "yes",
        ucid: formData.isUofCStudent === "yes" ? formData.ucid : "",
        school: formData.isUofCStudent === "no" ? formData.school : "",
      };

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      // Redirect to success page or back to event
      router.push(`/events/register/${eventId}/success`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingState fullScreen />;
  }

  if (event && !isRegistrationOpen(event)) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl">
          <Link
            href={`/events/${eventId}`}
            className="fc-link group mb-4 inline-flex items-center"
          >
            <FiArrowLeft className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Event
          </Link>

          <div className="fc-card border-amber-500/30 p-6 shadow-2xl md:p-8">
            <PageTitle sizeClass="text-2xl md:text-3xl">
              {REGISTRATION_CLOSED_MESSAGE}
            </PageTitle>
            <p className="fc-muted mt-3">{event.title}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Link
              href="/"
              className="fc-link group mb-4 inline-flex items-center"
            >
              <FiArrowLeft className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to Home
            </Link>

            <div className="fc-card animate-fade-in border-red-500/30 p-4 shadow-2xl md:p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Registration Error
                  </h2>
                </div>

                <div className="fc-alert-error">
                  <p className="text-gray-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <Link href="/" className="fc-link group mb-6 inline-flex items-center">
          <FiArrowLeft className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="fc-card p-6 shadow-xl md:p-8">
          <PageTitle sizeClass="mb-4 text-2xl md:text-3xl">
            {event && event.eventType === "webinar"
              ? "Register for Webinar"
              : "Register for Event"}
          </PageTitle>

          {event && (
            <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <h2 className="fc-title mb-1 text-lg">
                {event.title}
              </h2>
              <p className="fc-muted">
                {new Date(event.date + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="Your email address"
                />
              </div>

              {event && event.eventType === "webinar" && (
                <>
                  <div className="input-group">
                    <label>Company Name (if applicable)</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      placeholder="Your company name"
                    />
                  </div>

                  <div className="input-group">
                    <label>Company Role/Position (if applicable)</label>
                    <input
                      type="text"
                      value={formData.companyRole}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyRole: e.target.value,
                        })
                      }
                      placeholder="Your role or position at the company"
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label>
                  Are you a University of Calgary student?{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.isUofCStudent}
                  onChange={(e) => handleStudentStatusChange(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  Major <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  required
                  placeholder="Your major"
                />
              </div>

              {formData.isUofCStudent === "yes" && (
                <div className="input-group">
                  <label>
                    UCID{" "}
                    {event?.eventType === "webinar" ? (
                      "(if applicable)"
                    ) : (
                      <span className="text-gray-500 font-normal">
                        (Optional)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.ucid}
                    onChange={(e) =>
                      setFormData({ ...formData, ucid: e.target.value })
                    }
                    placeholder="Your UCID (e.g., 12345678)"
                  />
                </div>
              )}

              {formData.isUofCStudent === "no" && (
                <div className="input-group">
                  <label>
                    School <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) =>
                      setFormData({ ...formData, school: e.target.value })
                    }
                    required
                    placeholder="Your school or university"
                  />
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Comments (Optional)</label>
              <textarea
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                placeholder="Any questions or comments?"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/"
                className="fc-btn-dashboard-cancel flex-1 !py-3 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="fc-btn-gradient-primary flex-1 !px-4 !py-3"
              >
                {event && event.eventType === "webinar"
                  ? "Register for Webinar"
                  : "Register for Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
