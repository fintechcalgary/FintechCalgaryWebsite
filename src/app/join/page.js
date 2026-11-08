"use client";
import { body, linkUnderline, muted, titleAccent } from "@/lib/uiClassNames";
import { ALERT_ERROR_CLASS, BTN_GRADIENT_PRIMARY_CLASS, ICON_GLYPH_CLASS } from "@/lib/uiTokens";

import { useState } from "react";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  UPLOAD_FOLDERS,
  FILE_TYPES,
} from "@/lib/constants";
import { motion } from "framer-motion";
import { FiCheck, FiAlertCircle, FiUpload, FiX } from "react-icons/fi";
import BackLink from "@/components/ui/BackLink";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  uploadFile,
  validateFile,
  createDragHandlers,
} from "@/lib/frontend-helpers";

export default function JoinPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    ucid: "",
    email: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [membershipType, setMembershipType] = useState("free");

  const handleFile = (file) => {
    const validation = validateFile(file, {
      allowedTypes: FILE_TYPES.PDF.MIME_TYPES,
      allowedExtensions: FILE_TYPES.PDF.EXTENSIONS,
      maxSize: FILE_TYPES.PDF.MAX_SIZE,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
    setErrorMessage("");
  };

  const dragHandlers = createDragHandlers(handleFile, setIsDragOver);

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Clear any previous error messages

    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.ucid ||
      !formData.email
    ) {
      setErrorMessage("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    // Validate resume is required
    if (!resumeFile) {
      setErrorMessage("Resume is required. Please upload your resume.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload resume file
      let resumeUrl = "";
      try {
        resumeUrl = await uploadFile(resumeFile, UPLOAD_FOLDERS.RESUMES);
      } catch {
        throw new Error(ERROR_MESSAGES.RESUME_UPLOAD_FAILED);
      }

      // Submit form data
      const response = await fetch(API_ENDPOINTS.SUBSCRIBE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          membershipType,
          hasPaid: false, // Set to false for now, will be updated when payment is processed
          resume: resumeUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.SUBSCRIBE_FAILED);
      }

      setSubmitStatus("success");
      setFormData({ firstName: "", lastName: "", ucid: "", email: "" });
      setResumeFile(null);
      setResumeFileName("");
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error.message);
      // Error logged by API
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageShell>
      <div className="relative flex flex-grow items-center justify-center px-6 pb-24 pt-36 sm:px-8 lg:px-12">
        <div className="relative container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative z-50">
              <BackLink href="/" label="Back to Home" />
            </div>

            <div className="relative z-40">
              <GlowCard
                customSize
                glowColor="purple"
                className="w-full !gap-0 !p-8"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="w-full md:w-1/2">
                    <DotLottieReact
                      src="/lottie/blockchain3.lottie"
                      autoplay
                      loop
                      className="w-full mx-auto"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <PageTitle sizeClass="text-3xl sm:text-4xl mb-4">
                      Join Us
                    </PageTitle>
                    <p className="text-body-lg">
                      Join the FinTech Calgary community to stay updated with
                      our latest events, workshops, and opportunities. Connect
                      with industry leaders and innovators in the blockchain and
                      financial technology space.
                    </p>
                  </div>
                </div>

                {submitStatus === "success" ? (
                  <div className="relative z-10 text-center py-8">
                    <span className={`${ICON_GLYPH_CLASS} mx-auto mb-4`.trim()}>
                      <FiCheck className="h-8 w-8" />
                    </span>
                    <h2 className="mb-2 text-2xl">
                      Thank you for joining!
                    </h2>
                    <p>
                      Check your email for a welcome message from our team.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Membership Options */}
                    <div className="relative z-10 mb-6">
                      <h2 className={`${titleAccent} mb-4 text-xl`.trim()}>
                        Choose Your Membership
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Free Membership Option */}
                        <GlowCard
                          customSize
                          glowColor="purple"
                          className={`w-full !gap-0 !p-5 cursor-pointer transition-all duration-200 ${
                            membershipType === "free"
                              ? "!border-primary"
                              : ""
                          }`}
                        >
                          <div
                            className="relative z-10"
                            onClick={() => setMembershipType("free")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setMembershipType("free");
                              }
                            }}
                          >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg">
                              Free Membership
                            </h3>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                membershipType === "free"
                                  ? "bg-primary"
                                  : "border border-gray-500"
                              }`}
                            >
                              {membershipType === "free" && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <p className="mb-3">
                            Stay updated with our community
                          </p>
                          <ul className={`space-y-1 ${body}`.trim()}>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Email newsletters</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Event announcements</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Community updates</span>
                            </li>
                          </ul>
                          <div className="mt-3 text-center">
                            <span className="text-xl font-bold text-white">
                              $0
                            </span>
                            <span className={muted}>
                              {" "}
                              / forever
                            </span>
                          </div>
                          </div>
                        </GlowCard>

                        {/* Resume Submission Option (temporary label; backend still "premium") */}
                        <GlowCard
                          customSize
                          glowColor="purple"
                          className={`w-full !gap-0 !p-5 cursor-pointer transition-all duration-200 ${
                            membershipType === "premium"
                              ? "!border-primary"
                              : ""
                          }`}
                        >
                          <div
                            className="relative z-10"
                            onClick={() => setMembershipType("premium")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setMembershipType("premium");
                              }
                            }}
                          >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg">
                                Resume Submission
                              </h3>
                              <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs rounded-full mt-1">
                                Members only
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                membershipType === "premium"
                                  ? "bg-primary"
                                  : "border border-gray-500"
                              }`}
                            >
                              {membershipType === "premium" && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <p className="mb-3">
                            Submit your resume (members only)
                          </p>
                          <ul className={`space-y-1 ${body}`.trim()}>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>All free benefits</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Priority event access</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Exclusive networking opportunities</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Member-only resources</span>
                            </li>
                          </ul>
                          <div className="mt-3 text-center">
                            <span className="text-xl font-bold text-white">
                              $5
                            </span>
                            <span className={muted}>
                              {" "}
                              / year
                            </span>
                          </div>
                          </div>
                        </GlowCard>
                      </div>
                    </div>

                    <div className="relative z-10 mt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {membershipType === "premium" && (
                          <div className={`rounded-lg border border-primary/30 bg-primary/10 p-4 ${body}`.trim()}>
                            <p className="mb-1 font-medium text-white">
                              Resume submission is for members only.
                            </p>
                            <p>
                              Not a member yet? Select{" "}
                              <button
                                type="button"
                                onClick={() => setMembershipType("free")}
                                className={linkUnderline}
                              >
                                Free Membership
                              </button>{" "}
                              above to join first, then return to submit your
                              resume.
                            </p>
                          </div>
                        )}
                        {errorMessage && (
                          <div className={`${ALERT_ERROR_CLASS} flex items-start`.trim()}>
                            <FiAlertCircle className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-red-400">{errorMessage}</p>
                              {errorMessage.includes("already subscribed") && (
                                <p className="text-muted mt-1">
                                  Please use a different email address or check
                                  your inbox for previous communications.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-label">
                              First Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  firstName: e.target.value,
                                })
                              }
                              required
                              className="form-input"
                              placeholder="Your first name"
                            />
                          </div>

                          <div>
                            <label className="text-label">
                              Last Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  lastName: e.target.value,
                                })
                              }
                              required
                              className="form-input"
                              placeholder="Your last name"
                            />
                          </div>

                          <div>
                            <label className="text-label">
                              UCID <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.ucid}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  ucid: e.target.value,
                                })
                              }
                              required
                              className="form-input"
                              placeholder="Your UCID"
                            />
                          </div>

                          <div>
                            <label className="text-label">
                              Email <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              required
                              className="form-input"
                              placeholder="Your email address"
                            />
                          </div>
                        </div>

                        {/* Resume Upload */}
                        <div>
                          <label className="text-label">
                            Resume (PDF, max 5MB){" "}
                            <span className="text-red-400">*</span>
                          </label>
                          {resumeFileName ? (
                            <div className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FiUpload className="text-primary" />
                                <span className="text-white text-sm">
                                  {resumeFileName}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveResume}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              {...dragHandlers}
                              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                isDragOver
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-700 bg-gray-900/30 hover:border-gray-600"
                              }`}
                            >
                              <input
                                type="file"
                                id="resume-upload"
                                accept=".pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFile(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor="resume-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <FiUpload className="w-8 h-8 text-gray-400" />
                                <span className={body}>
                                  Click to upload or drag and drop
                                </span>
                                <span className={`${muted} text-xs`.trim()}>
                                  PDF only, max 5MB
                                </span>
                              </label>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`${BTN_GRADIENT_PRIMARY_CLASS} mt-2 w-full !px-4 !py-2.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`.trim()}
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : membershipType === "premium"
                              ? "Submit Resume"
                              : "Join Free"}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </GlowCard>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicPageShell>
  );
}
