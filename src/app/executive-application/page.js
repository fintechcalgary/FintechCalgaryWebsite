"use client";
import { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

const ROLES = [
  "President",
  "VP Finance",
  "VP Marketing",
  "VP Events",
  "VP Technology",
  "VP Partnerships",
  "Other",
];

export default function ExecutiveApplicationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    year: "",
    linkedin: "",
    resume: "",
    role: "",
    why: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.role) errs.role = "Role is required";
    if (!form.program) errs.program = "Program/Major is required";
    if (!form.year) errs.year = "Year is required";
    if (!form.why) errs.why = "This field is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/executive-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({
          name: "",
          email: "",
          phone: "",
          program: "",
          year: "",
          linkedin: "",
          resume: "",
          role: "",
          why: "",
        });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Update the base input class styling to match associate signup
  const inputClassName =
    "w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-gray-600/50";

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 pt-24 relative z-10">
          <div className="text-center animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
              Executive Application
            </h1>
            <p className="text-xl text-gray-300 mx-auto">
              Apply to join the FinTech Calgary executive team! Please fill out
              all required fields. We look forward to learning more about you.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
              {status === "success" ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Thank you for your application!
                  </h2>
                  <p className="text-gray-300">
                    We will review your application and be in contact with you
                    shortly.
                  </p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-xl font-semibold">
                      Role Information
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>

                    <div className="mb-5">
                      <input
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        placeholder="Role You Are Applying For"
                        className={`${inputClassName} ${
                          errors.role
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    <div className="text-xl font-semibold">
                      Personal Information
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className={`${inputClassName} ${
                          errors.name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className={`${inputClassName} ${
                          errors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />
                    </div>

                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className={inputClassName}
                      />
                      <input
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="LinkedIn URL"
                        className={inputClassName}
                      />
                    </div>

                    <div className="text-xl font-semibold">
                      Academic Information
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <input
                        name="program"
                        value={form.program}
                        onChange={handleChange}
                        placeholder="Program/Major"
                        className={`${inputClassName} ${
                          errors.program
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />
                      <input
                        name="year"
                        value={form.year}
                        onChange={handleChange}
                        placeholder="Year of Study"
                        className={`${inputClassName} ${
                          errors.year
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />
                    </div>

                    {errors.program && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.program}
                      </p>
                    )}
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-400">{errors.year}</p>
                    )}

                    <div className="mb-5">
                      <input
                        name="resume"
                        value={form.resume}
                        onChange={handleChange}
                        placeholder="Resume Link (Google Drive, etc)"
                        className={inputClassName}
                      />
                    </div>

                    <div className="text-xl font-semibold">
                      Application Questions
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>

                    <div className="flex gap-x-2 mb-2">
                      <textarea
                        name="why"
                        value={form.why}
                        onChange={handleChange}
                        placeholder="Why do you want to be an executive?"
                        rows={4}
                        className={`${inputClassName} min-h-40 resize-none ${
                          errors.why
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />
                    </div>

                    {errors.why && (
                      <p className="mt-1 text-sm text-red-400">{errors.why}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </form>

                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start max-w-4xl mx-auto mt-6">
                      <FiAlertCircle className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-red-400">
                          Failed to submit application. Please check the form
                          and try again.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
