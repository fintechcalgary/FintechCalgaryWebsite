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
    comments: "",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-[-4px] mb-8 group"
          >
            <FiArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
            Back to Home
          </Link>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-red-500/30 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-500"
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
                <h2 className="text-2xl font-bold text-white">
                  Registration Error
                </h2>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-gray-200">{error}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-gray-700/50">
          <h1 className="text-3xl font-bold mb-6 text-white">
            Register for Event
          </h1>

          {event && (
            <div className="mb-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-2">
                {event.title}
              </h2>
              <p className="text-gray-400">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="input-group">
              <label>Comments (Optional)</label>
              <textarea
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                placeholder="Any questions or comments?"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="w-2/3 bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-primary/25"
              >
                Register for Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
