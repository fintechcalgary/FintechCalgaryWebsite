"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

export default function RegisterEventForm({ eventId }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    ucid: "",
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
      } catch (err) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
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
              className="inline-flex items-center text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-[-4px] mb-4 group"
            >
              <FiArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
              Back to Home
            </Link>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-2xl border border-red-500/30 animate-fade-in">
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

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
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
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-gray-700/50">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            {event && event.eventType === "webinar"
              ? "Register for Webinar"
              : "Register for Event"}
          </h1>

          {event && (
            <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-1">
                {event.title}
              </h2>
              <p className="text-sm text-gray-400">
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

                  <div className="input-group">
                    <label>UCID (if applicable)</label>
                    <input
                      type="text"
                      value={formData.ucid}
                      onChange={(e) =>
                        setFormData({ ...formData, ucid: e.target.value })
                      }
                      placeholder="Your UCID (e.g., 12345678)"
                    />
                  </div>
                </>
              )}

              {event && event.eventType !== "webinar" && (
                <div className="input-group">
                  <label>UCID (Optional)</label>
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
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-primary/25"
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
