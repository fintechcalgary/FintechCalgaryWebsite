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
    resumeFile: null,
    role: "",
    why: "",
    fintechVision: "",
    otherCommitments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [resumeFileName, setResumeFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.role) errs.role = "Role is required";
    if (!form.program) errs.program = "Program/Major is required";
    if (!form.year) errs.year = "Year is required";
    if (!form.why) errs.why = "This field is required";
    if (!form.fintechVision) errs.fintechVision = "This field is required";
    if (!form.otherCommitments)
      errs.otherCommitments = "This field is required";

    // Resume file validation
    if (!form.resumeFile) {
      errs.resumeFile = "Resume file is required";
    } else {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(form.resumeFile.type)) {
        errs.resumeFile = "Please upload a PDF, DOC, or DOCX file";
      }
      if (form.resumeFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        errs.resumeFile = "File size must be less than 5MB";
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file && allowedTypes.includes(file.type)) {
      setForm({ ...form, resumeFile: file });
      setResumeFileName(file.name);
      // Clear error when user selects a file
      if (errors.resumeFile) {
        setErrors({ ...errors, resumeFile: null });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      // Upload resume file first
      let resumeUrl = "";
      if (form.resumeFile) {
        const formData = new FormData();
        formData.append("file", form.resumeFile);
        formData.append("folder", "resumes");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload resume");
        }

        const uploadResult = await uploadResponse.json();
        resumeUrl = uploadResult.url;
      }

      // Submit application with resume URL
      const applicationData = {
        ...form,
        resume: resumeUrl, // Store the URL in the resume field
      };
      delete applicationData.resumeFile; // Remove the file object

      const res = await fetch("/api/executive-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
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
          resumeFile: null,
          role: "",
          why: "",
          fintechVision: "",
          otherCommitments: "",
        });
        setResumeFileName("");
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
                      <label
                        htmlFor="resumeFile"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Resume/CV
                      </label>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="resume-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/60 transition-all duration-200 ${
                          isDragOver ? "border-primary/60" : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {resumeFileName ? (
                          <div className="relative w-full h-full p-4 flex items-center justify-center">
                            <div className="text-center">
                              <svg
                                className="w-8 h-8 mb-2 text-primary mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path>
                              </svg>
                              <p className="text-white text-sm font-medium">
                                {resumeFileName}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Click to change file
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-8 h-8 mb-4 text-gray-400"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">
                              PDF, DOC, or DOCX (max 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                      {errors.resumeFile && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.resumeFile}
                        </p>
                      )}
                    </div>

                    <div className="text-xl font-semibold">
                      Application Questions
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>

                    <div className="flex gap-x-2 mb-2">
                      <div className="w-full">
                        <label
                          htmlFor="why"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Why do you want to be an executive?
                        </label>
                        <textarea
                          id="why"
                          name="why"
                          value={form.why}
                          onChange={handleChange}
                          placeholder="Please share your motivation for joining the executive team..."
                          rows={4}
                          className={`${inputClassName} min-h-40 resize-none ${
                            errors.why
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {errors.why && (
                      <p className="mt-1 text-sm text-red-400">{errors.why}</p>
                    )}

                    <div className="flex gap-x-2 mb-2">
                      <div className="w-full">
                        <label
                          htmlFor="fintechVision"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          What does &apos;fintech&apos; mean to you, and how do
                          you see its role in the future of business and
                          innovation?
                        </label>
                        <textarea
                          id="fintechVision"
                          name="fintechVision"
                          value={form.fintechVision}
                          onChange={handleChange}
                          placeholder="Please share your understanding of fintech and your vision for its future..."
                          rows={4}
                          className={`${inputClassName} min-h-40 resize-none ${
                            errors.fintechVision
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {errors.fintechVision && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.fintechVision}
                      </p>
                    )}

                    <div className="flex gap-x-2 mb-2">
                      <div className="w-full">
                        <label
                          htmlFor="otherCommitments"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Are you currently involved with any other clubs or
                          commitments? How do you plan to balance your
                          responsibilities?
                        </label>
                        <textarea
                          id="otherCommitments"
                          name="otherCommitments"
                          value={form.otherCommitments}
                          onChange={handleChange}
                          placeholder="Please describe your current commitments and how you plan to manage your time..."
                          rows={4}
                          className={`${inputClassName} min-h-40 resize-none ${
                            errors.otherCommitments
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {errors.otherCommitments && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.otherCommitments}
                      </p>
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
