"use client";
import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";

export default function AssociateMemberSignupPage() {
  useEffect(() => {
    document.title = "Associate Member | FinTech Calgary";
  }, []);

  const [formData, setFormData] = useState({
    // Organization Info
    logo: null,
    organizationName: "",

    // Main Contact Info
    prefix: "",
    title: "",
    firstName: "",
    lastName: "",
    contactEmail: "",
    contactPhoneNumber: "",
    contactExtension: "",

    // Organization Contact Info
    organizationEmail: "",
    organizationPhoneNumber: "",
    organizationExtension: "",
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/associateMember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitStatus("success");
      setFormData({
        logo: null,
        organizationName: "",
        prefix: "",
        title: "",
        firstName: "",
        lastName: "",
        contactEmail: "",
        contactPhoneNumber: "",
        contactExtension: "",
        organizationEmail: "",
        organizationPhoneNumber: "",
        organizationExtension: "",
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
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
              Associate Member Sign Up
            </h1>
            <p className="text-xl text-gray-300 mx-auto">
              Interested in learning more about Associate Membership before
              applying? Contact us at fintech.calgary@gmail.com.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <form className="bg-gray-800/50 backdrop-blur-sm rounded-lg py-5 px-8 w-full max-w-6xl">
              <div className="text-xl font-semibold">
                Organization Information
              </div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="flex gap-x-2 mb-2">
                <input
                  id="logo-upload"
                  type="file"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData({ ...formData, logo: file });
                  }}
                  className="hidden"
                />

                <label
                  htmlFor="logo-upload"
                  className="flex justify-between items-stretch cursor-pointer max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 w-full"
                >
                  <span
                    className={`truncate self-center ${
                      formData.logo ? "" : "text-gray-400"
                    }`}
                  >
                    {formData.logo ? formData.logo.name : "Organization Logo"}
                  </span>

                  <span className="flex items-center pl-4 border-l border-gray-600 text-gray-400">
                    Browse
                  </span>
                </label>
              </div>

              <div className="flex gap-x-2 mb-5">
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
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="text-xl font-semibold">Contacts</div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="mb-2 text-gray-200 text-md">
                <p>
                  Please enter the information for the Main Contact of your
                  organization.
                </p>
              </div>
              <div className="grid lg:grid-cols-4 gap-x-5">
                <div className="flex gap-x-2 mb-2 col-span-1">
                  <input
                    type="text"
                    placeholder="Prefix"
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2 mb-2 col-span-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-x-5 mb-5">
                <div className="flex gap-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2">
                  <input
                    type="text"
                    placeholder="Email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2 max-w-2xl">
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
                    className="flex-grow px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />

                  <input
                    type="text"
                    placeholder="Ext."
                    value={formData.contactExtension}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactExtension: e.target.value,
                      })
                    }
                    className="w-20 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="text-xl font-semibold">
                Organization Contact Information
              </div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="flex gap-x-2 mb-2">
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
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Website URL"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  required
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-x-2 mb-2 max-w-3xl">
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
                  className="flex-grow px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />

                <input
                  type="text"
                  placeholder="Ext."
                  value={formData.organizationExtension}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationExtension: e.target.value,
                    })
                  }
                  className="w-20 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Facebook"
                  value={formData.facebook}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook: e.target.value })
                  }
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Twitter"
                  value={formData.twitter}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter: e.target.value })
                  }
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-x-2 mb-5">
                <input
                  type="text"
                  placeholder="LinkedIn"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="text-xl font-semibold">Organization Address</div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="flex gap-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="grid lg:grid-cols-2 gap-x-5 mb-5">
                <div className="flex gap-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Province"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    required
                    className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="text-xl font-semibold">Directory Listing</div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="flex gap-x-2 mb-2">
                <textarea
                  placeholder="About Us Section"
                  value={formData.aboutUs}
                  onChange={(e) =>
                    setFormData({ ...formData, aboutUs: e.target.value })
                  }
                  required
                  className="w-full min-h-40 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 resize-none"
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
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
