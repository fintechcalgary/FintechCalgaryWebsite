"use client";
import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { FaEnvelope } from "react-icons/fa";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

export default function AssociateMemberSignupPage() {
  useEffect(() => {
    document.title = "Associate Member | FinTech Calgary";
  }, []);

  const [formData, setFormData] = useState({
    // Organization Info
    logo: null,
    organizationName: "",

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let logoUrl = "";

      if (formData.logo) {
        const logoData = new FormData();
        logoData.append("file", formData.logo);
        logoData.append("folder", "associateMemberLogos");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: logoData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const logoResult = await response.json();
        logoUrl = logoResult.url;
      }

      const memberData = {
        ...formData,
        logo: logoUrl,
      };

      const response = await fetch("/api/associateMember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitStatus("success");
      setFormData({
        logo: null,
        organizationName: "",
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
    } catch (error) {
      setSubmitStatus("error");
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
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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

  // Update the base input class styling
  const inputClassName =
    "w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-gray-600/50";

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 pt-24 relative z-10">
          <div className="text-center animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
              Associate Sign Up
            </h1>
            <p className="text-xl text-gray-300 mx-auto">
              Interested in learning more about Associate Membership before
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
                    Thank you for your interest in becoming an Associate Member!
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
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="logo-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/60 transition-all duration-200 ${
                          isDragOver ? "border-primary/60" : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-full p-4 flex items-center justify-center">
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
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">
                              SVG, PNG, JPG or GIF
                            </p>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="mb-5">
                      <input
                        type="text"
                        placeholder="Organization Name"
                        value={formData.organizationName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organizationName: e.target.value,
                          })
                        }
                        required
                        className={inputClassName}
                      />
                    </div>
                    <div className="mb-5">
                      <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        required
                        className={inputClassName}
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Password must be at least 8 characters long
                      </p>
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
                        placeholder="Title"
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
                        <p className="text-red-400">
                          Failed to submit application. Please try again.
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
