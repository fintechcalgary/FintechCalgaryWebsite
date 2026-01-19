"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import Image from "next/image";
import logger from "@/lib/logger";
import {
  createDragHandlers,
  validateFile,
  uploadFile,
  scrollToFirstError,
  createFormChangeHandler,
  validateRequiredFields,
  validateEmail,
} from "@/lib/frontend-helpers";
import { API_ENDPOINTS, UPLOAD_FOLDERS, FILE_TYPES, ERROR_MESSAGES } from "@/lib/constants";

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
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applicationQuestions, setApplicationQuestions] = useState([]);
  const [selectedRoleQuestions, setSelectedRoleQuestions] = useState([]);
  const previousRoleRef = useRef(null);

  useEffect(() => {
    fetchRoles();
    fetchSettings();
  }, []);

  // Initialize form with dynamic question fields
  useEffect(() => {
    if (applicationQuestions.length > 0) {
      const questionFields = {};
      applicationQuestions.forEach((question) => {
        questionFields[question.id] = "";
      });
      setForm((prev) => ({
        ...prev,
        ...questionFields,
      }));
    }
  }, [applicationQuestions]);

  // Update selected role questions when role changes
  const updateRoleQuestions = useCallback(
    (roleTitle) => {
      if (roleTitle && availableRoles.length > 0) {
        const selectedRole = availableRoles.find(
          (role) => role.title === roleTitle
        );
        if (selectedRole && selectedRole.questions) {
          setSelectedRoleQuestions(selectedRole.questions);

          // Initialize form fields for role-specific questions
          const questionFields = {};
          selectedRole.questions.forEach((question) => {
            questionFields[question.id] = "";
          });
          setForm((prev) => ({
            ...prev,
            ...questionFields,
          }));
        } else {
          setSelectedRoleQuestions([]);
        }
      } else {
        setSelectedRoleQuestions([]);
      }
    },
    [availableRoles]
  );

  useEffect(() => {
    // Only run if the role actually changed
    if (form.role !== previousRoleRef.current) {
      previousRoleRef.current = form.role;
      updateRoleQuestions(form.role);
    }
  }, [form.role, updateRoleQuestions]);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await fetch("/api/executive-roles");
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SETTINGS);
      if (response.ok) {
        const data = await response.json();
        setApplicationsOpen(!!data.executiveApplicationsOpen);
        setApplicationQuestions(data.executiveApplicationQuestions || []);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const validate = () => {
    const errs = validateRequiredFields(form, [
      "name",
      "email",
      "role",
      "program",
      "year",
    ]);

    // Validate email format
    const emailError = validateEmail(form.email);
    if (emailError) {
      errs.email = emailError;
    }

    // Validate role-specific questions first, then fallback to general questions
    const questionsToValidate =
      selectedRoleQuestions.length > 0
        ? selectedRoleQuestions
        : applicationQuestions;
    questionsToValidate.forEach((question) => {
      if (question.required && !form[question.id]) {
        errs[question.id] = `${question.label} is required`;
      }
    });

    // Resume file validation
    if (!form.resumeFile) {
      errs.resumeFile = ERROR_MESSAGES.FILE_REQUIRED("Resume");
    } else {
      const validation = validateFile(form.resumeFile, {
        allowedTypes: FILE_TYPES.PDF.MIME_TYPES,
        maxSize: FILE_TYPES.PDF.MAX_SIZE,
      });
      if (!validation.valid) {
        errs.resumeFile = validation.error;
      }
    }

    return errs;
  };

  const handleChange = createFormChangeHandler(setForm);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    const validation = validateFile(file, {
      allowedTypes: FILE_TYPES.PDF.MIME_TYPES,
      maxSize: FILE_TYPES.PDF.MAX_SIZE,
    });

    if (validation.valid) {
      setForm({ ...form, resumeFile: file });
      setResumeFileName(file.name);
      // Clear error when user selects a file
      if (errors.resumeFile) {
        setErrors({ ...errors, resumeFile: null });
      }
    } else {
      setErrors({ ...errors, resumeFile: validation.error });
    }
  };

  const dragHandlers = createDragHandlers(handleFile, setIsDragOver);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Upload resume file first
      let resumeUrl = "";
      if (form.resumeFile) {
        resumeUrl = await uploadFile(form.resumeFile, UPLOAD_FOLDERS.RESUMES);
      }

      // Submit application with resume URL
      const applicationData = {
        ...form,
        resume: resumeUrl, // Store the URL in the resume field
      };
      delete applicationData.resumeFile; // Remove the file object

      const res = await fetch(API_ENDPOINTS.EXECUTIVE_APPLICATION, {
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
        setErrorMessage(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatus("error");

        // Log API error
        logger.logApiError(
          API_ENDPOINTS.EXECUTIVE_APPLICATION,
          new Error(errorData.error || "Unknown API error"),
          {
            name: form.name,
            email: form.email,
            role: form.role,
            hasResume: !!form.resumeFile,
          }
        );

        if (errorData.error) {
          setErrorMessage(errorData.error);
        } else {
          setErrorMessage(ERROR_MESSAGES.APPLICATION_SUBMIT_FAILED);
        }
      }
    } catch (error) {
      setStatus("error");

      // Log form submission error
      logger.logFormError("executive_application", error, {
        name: form.name,
        email: form.email,
        role: form.role,
        hasResume: !!form.resumeFile,
        resumeSize: form.resumeFile?.size,
        resumeType: form.resumeFile?.type,
      });

      if (error.message === "Failed to upload resume" || error.message.includes("upload")) {
        setErrorMessage(ERROR_MESSAGES.RESUME_UPLOAD_FAILED);
        logger.logUploadError(form.resumeFile?.name || "unknown", error, {
          size: form.resumeFile?.size,
          type: form.resumeFile?.type,
        });
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        setErrorMessage(
          "Network error. Please check your internet connection and try again."
        );
      } else if (error.message.includes("timeout")) {
        setErrorMessage("Request timed out. Please try again.");
      } else {
        setErrorMessage(
          "An unexpected error occurred. Please try again or contact support if the problem persists."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Update the base input class styling to match associate signup
  const inputClassName =
    "w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-gray-600/50 scrollbar-thin scrollbar-track-gray-900/50 scrollbar-thumb-gray-500/50 hover:scrollbar-thumb-gray-400/80";

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
              {!applicationsOpen ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiAlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Applications Currently Closed
                  </h2>
                  <p className="text-gray-300">
                    Executive applications are not currently open. Please check
                    back later for new opportunities.
                  </p>
                </div>
              ) : status === "success" ? (
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
                      {rolesLoading ? (
                        <div className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400">
                          Loading available roles...
                        </div>
                      ) : availableRoles.length === 0 ? (
                        <div className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400">
                          No roles currently available
                        </div>
                      ) : (
                        <select
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          className={`${inputClassName} ${
                            errors.role
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                          required
                        >
                          <option value="">Select a role to apply for</option>
                          {availableRoles.map((role) => (
                            <option key={role._id} value={role.title}>
                              {role.title}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    {/* Role Responsibilities Display */}
                    {form.role && availableRoles.length > 0 && (
                      <div className="mb-5">
                        {(() => {
                          const selectedRole = availableRoles.find(
                            (role) => role.title === form.role
                          );
                          return selectedRole ? (
                            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                              <h4 className="text-white font-medium mb-3">
                                {selectedRole.title} - Responsibilities
                              </h4>
                              <div className="relative group">
                                <Image
                                  src={selectedRole.responsibilitiesImageUrl}
                                  alt={`${selectedRole.title} responsibilities`}
                                  width={600}
                                  height={400}
                                  className="w-full max-h-64 object-contain rounded-lg border border-gray-600/50 cursor-pointer transition-transform group-hover:scale-105"
                                  onClick={() =>
                                    window.open(
                                      selectedRole.responsibilitiesImageUrl,
                                      "_blank"
                                    )
                                  }
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                                  <span className="text-white text-sm font-medium">
                                    Click to view full size
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

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
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="resume-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/60 transition-all duration-200 ${
                          isDragOver ? "border-primary/60" : ""
                        }`}
                        onDragOver={dragHandlers.onDragOver}
                        onDragEnter={dragHandlers.onDragEnter}
                        onDragLeave={dragHandlers.onDragLeave}
                        onDrop={dragHandlers.onDrop}
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
                              PDF only (max 5MB)
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

                    {selectedRoleQuestions.length > 0 ||
                    applicationQuestions.length > 0 ? (
                      (selectedRoleQuestions.length > 0
                        ? selectedRoleQuestions
                        : applicationQuestions
                      ).map((question, index) => (
                        <div key={question.id} className="flex gap-x-2 mb-2">
                          <div className="w-full">
                            <label
                              htmlFor={question.id}
                              className="block text-sm font-medium text-gray-300 mb-2"
                            >
                              {question.label}
                              {question.required && (
                                <span className="text-red-400 ml-1">*</span>
                              )}
                            </label>
                            <textarea
                              id={question.id}
                              name={question.id}
                              value={form[question.id] || ""}
                              onChange={handleChange}
                              placeholder={question.placeholder}
                              rows={4}
                              className={`${inputClassName} min-h-40 resize-none ${
                                errors[question.id]
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                  : ""
                              }`}
                              required={question.required}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to default questions if no custom questions are set
                      <>
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
                              value={form.why || ""}
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

                        <div className="flex gap-x-2 mb-2">
                          <div className="w-full">
                            <label
                              htmlFor="fintechVision"
                              className="block text-sm font-medium text-gray-300 mb-2"
                            >
                              What does &apos;fintech&apos; mean to you, and how
                              do you see its role in the future of business and
                              innovation?
                            </label>
                            <textarea
                              id="fintechVision"
                              name="fintechVision"
                              value={form.fintechVision || ""}
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
                              value={form.otherCommitments || ""}
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
                      </>
                    )}

                    {/* Display errors for dynamic questions */}
                    {(selectedRoleQuestions.length > 0
                      ? selectedRoleQuestions
                      : applicationQuestions
                    ).map(
                      (question) =>
                        errors[question.id] && (
                          <p
                            key={`error-${question.id}`}
                            className="mt-1 text-sm text-red-400"
                          >
                            {errors[question.id]}
                          </p>
                        )
                    )}

                    {/* Display errors for fallback questions */}
                    {selectedRoleQuestions.length === 0 &&
                      applicationQuestions.length === 0 && (
                        <>
                          {errors.why && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.why}
                            </p>
                          )}
                          {errors.fintechVision && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.fintechVision}
                            </p>
                          )}
                          {errors.otherCommitments && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.otherCommitments}
                            </p>
                          )}
                        </>
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
                        <h3 className="text-red-400 font-semibold mb-2">
                          Application Submission Failed
                        </h3>
                        {errorMessage ? (
                          <p className="text-red-400">{errorMessage}</p>
                        ) : (
                          <div>
                            <p className="text-red-400 mb-2">
                              Please correct the following issues and try again:
                            </p>
                            <ul className="text-red-400 text-sm space-y-1">
                              <li>
                                • Check that all required fields are filled out
                              </li>
                              <li>• Ensure your resume is in PDF format</li>
                              <li>• Verify your email address is valid</li>
                              <li>• Make sure your phone number is correct</li>
                              <li>
                                • Ensure all text fields are properly completed
                              </li>
                            </ul>
                          </div>
                        )}
                        <p className="text-red-300 text-sm mt-3">
                          If you continue to experience issues, please contact
                          us at{" "}
                          <a
                            href="mailto:fintech.calgary@gmail.com"
                            className="underline hover:text-red-200"
                          >
                            fintech.calgary@gmail.com
                          </a>
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
