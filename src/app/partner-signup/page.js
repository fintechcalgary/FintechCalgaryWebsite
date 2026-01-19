"use client";
import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { FaEnvelope } from "react-icons/fa";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import logger from "@/lib/logger";
import {
  createDragHandlers,
  validateFile,
  uploadFile,
  scrollToFirstError,
  createFormChangeHandler,
  validatePassword,
  validateUsername,
} from "@/lib/frontend-helpers";
import { API_ENDPOINTS, UPLOAD_FOLDERS, FILE_TYPES, ERROR_MESSAGES } from "@/lib/constants";

export default function PartnerSignupPage() {
  useEffect(() => {
    document.title = "Partner | FinTech Calgary";
  }, []);

  const [formData, setFormData] = useState({
    // Organization Info
    logo: null,
    organizationName: "",

    // Account Info
    username: "",

    // Main Contact Info
    title: "",
    firstName: "",
    lastName: "",
    contactEmail: "",
    contactPhoneNumber: "",

    // Organization Contact Info
    organizationEmail: "",
    organizationPhoneNumber: "",
    website: "",
    facebook: "",
    twitter: "",
    linkedin: "",

    // Organization Address
    address: "",
    country: "",
    province: "",
    city: "",
    postalCode: "",

    // Directory Listing
    aboutUs: "",

    // New field
    password: "",
  });

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

      const response = await fetch(API_ENDPOINTS.PARTNER, {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
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

  const dragHandlers = createDragHandlers(handleFile, setIsDragOver);

  // Update the base input class styling
  const inputClassName =
    "w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-gray-600/50 scrollbar-thin scrollbar-track-gray-900/50 scrollbar-thumb-gray-500/50 hover:scrollbar-thumb-gray-400/80";

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 pt-24 relative z-10">
          <div className="text-center animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-xl font-semibold">
                      Organization Information
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload your Logo
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="logo-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/60 transition-all duration-200 ${
                          isDragOver ? "border-primary/60" : ""
                        }`}
                        onDragOver={dragHandlers.onDragOver}
                        onDragEnter={dragHandlers.onDragEnter}
                        onDragLeave={dragHandlers.onDragLeave}
                        onDrop={dragHandlers.onDrop}
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-full p-4 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt="Logo preview"
                              className="max-h-full max-w-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white">Click to change logo</p>
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
                                Click to upload your logo
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">
                              JPG, PNG, or SVG only
                            </p>
                          </div>
                        )}
                      </label>
                      {fileError && (
                        <p className="mt-2 text-sm text-red-400">{fileError}</p>
                      )}
                    </div>

                    <div className="mb-5">
                      <input
                        type="text"
                        placeholder="Organization Name"
                        value={formData.organizationName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            organizationName: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.organizationName) {
                            setErrors({ ...errors, organizationName: null });
                          }
                        }}
                        required
                        data-error="organizationName"
                        className={`${inputClassName} ${
                          errors.organizationName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                      />
                      {errors.organizationName && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.organizationName}
                        </p>
                      )}
                    </div>
                    <div className="mb-5">
                      <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            username: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.username) {
                            setErrors({ ...errors, username: null });
                          }
                        }}
                        required
                        data-error="username"
                        className={`${inputClassName} ${
                          errors.username
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                      />
                      {errors.username ? (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.username}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-400">
                          Choose a unique username for your account
                        </p>
                      )}
                    </div>
                    <div className="mb-5">
                      <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.password) {
                            setErrors({ ...errors, password: null });
                          }
                        }}
                        required
                        data-error="password"
                        className={`${inputClassName} ${
                          errors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                      />
                      {errors.password ? (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.password}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-400">
                          Password must be at least 6 characters long
                        </p>
                      )}
                    </div>
                    <div className="text-xl font-semibold">Contacts</div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>
                    <div className="mb-2 text-gray-200 text-md">
                      <p>
                        Please enter the information for the Main Contact of
                        your organization.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-5">
                      <input
                        type="text"
                        placeholder="Title / Position"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className={inputClassName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                        className={inputClassName}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        className={inputClassName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <input
                        type="text"
                        placeholder="Email"
                        value={formData.contactEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactEmail: e.target.value,
                          })
                        }
                        required
                        className={inputClassName}
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={formData.contactPhoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhoneNumber: e.target.value,
                          })
                        }
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div className="text-xl font-semibold">
                      Organization Contact Information
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>
                    <div className="space-y-4 mb-5">
                      <input
                        type="text"
                        placeholder="Email"
                        value={formData.organizationEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organizationEmail: e.target.value,
                          })
                        }
                        required
                        className={inputClassName}
                      />
                      <input
                        type="text"
                        placeholder="Website URL"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        required
                        className={inputClassName}
                      />
                      <div className="grid grid-cols-1 gap-4 mb-5">
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={formData.organizationPhoneNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organizationPhoneNumber: e.target.value,
                            })
                          }
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>
                    <div className="space-y-4 mb-5">
                      <input
                        type="text"
                        placeholder="Facebook URL (Leave blank if not applicable)"
                        value={formData.facebook}
                        onChange={(e) =>
                          setFormData({ ...formData, facebook: e.target.value })
                        }
                        className={inputClassName}
                      />
                      <input
                        type="text"
                        placeholder="Twitter URL (Leave blank if not applicable)"
                        value={formData.twitter}
                        onChange={(e) =>
                          setFormData({ ...formData, twitter: e.target.value })
                        }
                        className={inputClassName}
                      />
                      <input
                        type="text"
                        placeholder="LinkedIn URL (Leave blank if not applicable)"
                        value={formData.linkedin}
                        onChange={(e) =>
                          setFormData({ ...formData, linkedin: e.target.value })
                        }
                        className={inputClassName}
                      />
                    </div>
                    <div className="text-xl font-semibold">
                      Organization Address
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>
                    <div className="space-y-4 mb-5">
                      <input
                        type="text"
                        placeholder="Address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                        className={inputClassName}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Country"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          required
                          className={inputClassName}
                        />
                        <input
                          type="text"
                          placeholder="Province / State"
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              province: e.target.value,
                            })
                          }
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          required
                          className={inputClassName}
                        />
                        <input
                          type="text"
                          placeholder="Postal Code / Zip Code"
                          value={formData.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postalCode: e.target.value,
                            })
                          }
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>
                    <div className="text-xl font-semibold">
                      Directory Listing
                    </div>
                    <div className="my-2 border-t-2 border-primary/60 w-full"></div>
                    <div className="flex gap-x-2 mb-2">
                      <textarea
                        placeholder="About Us Section"
                        value={formData.aboutUs}
                        onChange={(e) =>
                          setFormData({ ...formData, aboutUs: e.target.value })
                        }
                        required
                        className={`${inputClassName} min-h-40 resize-none`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : <>Submit Application</>}
                    </button>
                  </form>

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

      <Footer />
    </main>
  );
}
