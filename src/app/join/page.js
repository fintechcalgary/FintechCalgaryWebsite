"use client";

import { useState } from "react";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES, UPLOAD_FOLDERS, FILE_TYPES } from "@/lib/constants";
import { motion } from "framer-motion";
import { FiCheck, FiArrowLeft, FiAlertCircle, FiUpload, FiX } from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { uploadFile, validateFile, createDragHandlers } from "@/lib/frontend-helpers";

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
    if (!formData.firstName || !formData.lastName || !formData.ucid || !formData.email) {
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
      } catch (uploadError) {
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
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow flex items-center justify-center py-12">
        <div className="relative container mx-auto px-6 my-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative z-50">
              <Link
                href="/"
                className="inline-flex items-center text-gray-400 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 mb-6 group"
              >
                <FiArrowLeft className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-200" />
                Back to Home
              </Link>
            </div>

            <div className="relative z-40">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="w-full md:w-1/2">
                    <DotLottieReact
                      src="/lottie/blockchain3.lottie"
                      autoplay
                      loop
                      className="w-full mx-auto"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <h1 className="text-3xl font-bold text-white mb-4">
                      Join Us
                    </h1>
                    <p className="text-gray-300">
                      Join the FinTech Calgary community to stay updated with
                      our latest events, workshops, and opportunities. Connect
                      with industry leaders and innovators in the blockchain and
                      financial technology space.
                    </p>
                  </div>
                </div>

                {submitStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Thank you for joining!
                    </h2>
                    <p className="text-gray-300">
                      Check your email for a welcome message from our team.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Membership Options */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Choose Your Membership
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Free Membership Option */}
                        <div
                          className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            membershipType === "free"
                              ? "bg-primary/10 border-primary"
                              : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                          }`}
                          onClick={() => setMembershipType("free")}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium text-white">
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
                          <p className="text-gray-400 text-sm mb-3">
                            Stay updated with our community
                          </p>
                          <ul className="space-y-1 text-sm text-gray-300">
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
                            <span className="text-gray-400 text-sm">
                              {" "}
                              / forever
                            </span>
                          </div>
                        </div>

                        {/* Resume Submission Option (temporary label; backend still "premium") */}
                        <div
                          className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            membershipType === "premium"
                              ? "bg-primary/10 border-primary"
                              : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                          }`}
                          onClick={() => setMembershipType("premium")}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-medium text-white">
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
                          <p className="text-gray-400 text-sm mb-3">
                            Submit your resume (members only)
                          </p>
                          <ul className="space-y-1 text-sm text-gray-300">
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
                            <span className="text-gray-400 text-sm">
                              {" "}
                              / year
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {membershipType === "premium" && (
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm text-gray-300">
                            <p className="font-medium text-white mb-1">Resume submission is for members only.</p>
                            <p>
                              Not a member yet? Select{" "}
                              <button
                                type="button"
                                onClick={() => setMembershipType("free")}
                                className="text-primary hover:underline font-medium"
                              >
                                Free Membership
                              </button>{" "}
                              above to join first, then return to submit your resume.
                            </p>
                          </div>
                        )}
                        {errorMessage && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                            <FiAlertCircle className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-red-400">{errorMessage}</p>
                              {errorMessage.includes(
                                "already subscribed"
                              ) && (
                                <p className="text-gray-400 text-sm mt-1">
                                  Please use a different email address or
                                  check your inbox for previous
                                  communications.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">
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
                              className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                              placeholder="Your first name"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">
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
                              className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                              placeholder="Your last name"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">
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
                              className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                              placeholder="Your UCID"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">
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
                              className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                              placeholder="Your email address"
                            />
                          </div>
                        </div>

                        {/* Resume Upload */}
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">
                            Resume (PDF, max 5MB) <span className="text-red-400">*</span>
                          </label>
                          {resumeFileName ? (
                            <div className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FiUpload className="text-primary" />
                                <span className="text-white text-sm">{resumeFileName}</span>
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
                                <span className="text-gray-300 text-sm">
                                  Click to upload or drag and drop
                                </span>
                                <span className="text-gray-500 text-xs">
                                  PDF only, max 5MB
                                </span>
                              </label>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
