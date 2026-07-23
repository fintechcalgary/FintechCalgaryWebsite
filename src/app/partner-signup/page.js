"use client";
import { useState } from "react";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { FaEnvelope } from "react-icons/fa";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import logger from "@/lib/logger";
import {
  validateFile,
  uploadFile,
  scrollToFirstError,
  validatePassword,
  validateUsername,
} from "@/lib/frontend-helpers";
import { API_ENDPOINTS, UPLOAD_FOLDERS, FILE_TYPES, ERROR_MESSAGES } from "@/lib/constants";
import PartnerForm from "@/features/partners/PartnerForm";
import {
  INITIAL_PARTNER_FORM,
  createPartnerFieldChangeHandler,
} from "@/features/partners/partnerFormFields";

export default function PartnerSignupPage() {

  const [formData, setFormData] = useState({ ...INITIAL_PARTNER_FORM, password: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Username validation
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }

    setErrors(newErrors);

    // Scroll to first error if any exist
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      let logoUrl = "";

      if (formData.logo) {
        logoUrl = await uploadFile(formData.logo, UPLOAD_FOLDERS.PARTNER_LOGOS);
      }

      const memberData = {
        ...formData,
        logo: logoUrl,
      };

      const response = await fetch(API_ENDPOINTS.PARTNER_APPLICATIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      setSubmitStatus("success");
      setFormData({
        logo: null,
        organizationName: "",
        username: "",
        title: "",
        firstName: "",
        lastName: "",
        contactEmail: "",
        contactPhoneNumber: "",
        organizationEmail: "",
        organizationPhoneNumber: "",
        website: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        address: "",
        country: "",
        province: "",
        city: "",
        postalCode: "",
        aboutUs: "",
        password: "",
      });
      setErrors({});
      setGeneralError(null);
    } catch (error) {
      setSubmitStatus("error");
      const newErrors = {};
      let errorMessage = null;

      // Log the error for monitoring
      logger.logFormError("partner_signup", error, {
        organizationName: formData.organizationName,
        username: formData.username,
        contactEmail: formData.contactEmail,
        hasLogo: !!formData.logo,
        logoSize: formData.logo?.size,
        logoType: formData.logo?.type,
      });

      if (error.message === ERROR_MESSAGES.USERNAME_EXISTS) {
        newErrors.username = ERROR_MESSAGES.USERNAME_EXISTS_DETAILED;
      } else if (error.message === ERROR_MESSAGES.ORGANIZATION_EXISTS) {
        newErrors.organizationName = ERROR_MESSAGES.ORGANIZATION_EXISTS_DETAILED;
      } else if (error.message === ERROR_MESSAGES.PASSWORD_MIN_LENGTH) {
        newErrors.password = ERROR_MESSAGES.PASSWORD_MIN_LENGTH;
      } else if (error.message === ERROR_MESSAGES.USERNAME_MIN_LENGTH) {
        newErrors.username = ERROR_MESSAGES.USERNAME_MIN_LENGTH;
      } else if (error.message === "Upload failed" || error.message.includes("upload")) {
        errorMessage = ERROR_MESSAGES.LOGO_UPLOAD_FAILED;
        logger.logUploadError(formData.logo?.name || "unknown", error, {
          size: formData.logo?.size,
          type: formData.logo?.type,
        });
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      } else if (error.message.includes("timeout")) {
        errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
      } else {
        errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
      }

      setErrors(newErrors);
      setGeneralError(errorMessage);

      // Scroll to first error if any backend validation errors exist
      if (Object.keys(newErrors).length > 0) {
        scrollToFirstError(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFile = (file) => {
    // Clear any previous file errors
    setFileError(null);

    const validation = validateFile(file, {
      allowedTypes: FILE_TYPES.IMAGE.MIME_TYPES,
      allowedExtensions: FILE_TYPES.IMAGE.EXTENSIONS,
    });

    if (!validation.valid) {
      setFileError(validation.error);
      return;
    }

    if (file && (file.type.startsWith("image/") || file.type === "image/svg+xml")) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = createPartnerFieldChangeHandler(setFormData, setErrors);

  return (
    <PublicPageShell title="Partner | FinTech Calgary">

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 pt-36 relative z-10">
          <div className="text-center animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75 mb-6">
              Partner Sign Up
            </h1>
            <p className="text-xl text-gray-300 mx-auto">
              Interested in learning more about Partnership before
              applying? Contact us at{" "}
              <a
                href="mailto:fintech.calgary@gmail.com"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 ml-1"
              >
                <FaEnvelope className="w-4 h-4" />
                fintech.calgary@gmail.com
              </a>
            </p>
          </div>

          <div className="flex justify-center items-center">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
              {submitStatus === "success" ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Thank you for your interest in becoming a Partner!
                  </h2>
                  <p className="text-gray-300">
                    We will be in contact with you shortly to discuss the next
                    steps.
                  </p>
                </div>
              ) : (
                <>
                  <PartnerForm
                    mode="signup"
                    values={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                    onSubmit={handleSubmit}
                    submitting={isSubmitting}
                    submitLabel={isSubmitting ? "Submitting..." : "Submit Application"}
                    showLogoUpload
                    logoRequired
                    previewUrl={previewUrl}
                    isDragOver={isDragOver}
                    setIsDragOver={setIsDragOver}
                    onLogoSelect={handleFile}
                    fileError={fileError}
                  />

                  {submitStatus === "error" && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start max-w-4xl mx-auto mt-6">
                      <FiAlertCircle className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-red-400 font-semibold mb-2">
                          Application Submission Failed
                        </h3>
                        {generalError ? (
                          <p className="text-red-400">{generalError}</p>
                        ) : (
                          <div>
                            <p className="text-red-400 mb-2">
                              Please correct the following issues and try again:
                            </p>
                            <ul className="text-red-400 text-sm space-y-1">
                              <li>
                                • Check that all required fields are filled out
                              </li>
                              <li>
                                • Ensure your logo is in JPG, PNG, or SVG format
                              </li>
                              <li>• Verify your email address is valid</li>
                              <li>
                                • Make sure your username is unique and at least
                                3 characters
                              </li>
                              <li>
                                • Ensure your password is at least 6 characters
                                long
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
    </PublicPageShell>
  );
}
