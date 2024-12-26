"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/50 rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-white">
            Register for Event
          </h1>

          {event && (
            <div className="mb-8">
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

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-primary/25"
            >
              Register for Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
