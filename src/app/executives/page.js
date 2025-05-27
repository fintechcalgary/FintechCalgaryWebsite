"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import { SiLinkedin } from "react-icons/si";
import { FiMail } from "react-icons/fi";
import Image from "next/image";

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState([]);
  const [groupedExecutives, setGroupedExecutives] = useState({});

  useEffect(() => {
    document.title = "Executives | FinTech Calgary";
  }, []);

  const fetchExecutives = async () => {
    try {
      const response = await fetch("/api/members");
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("API did not return an array:", data);
        return;
      }

      const grouped = data.reduce((acc, executive) => {
        if (!acc[executive.team]) acc[executive.team] = [];
        acc[executive.team].push(executive);
        return acc;
      }, {});

      setExecutives(data);
      setGroupedExecutives(grouped);
    } catch (error) {
      console.error("Failed to fetch executives:", error);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  if (executives.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <section className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 z-0"></div>

          {/* Content Section */}
          <div className="relative z-10 container mx-auto px-6 py-24 sm:px-8 lg:px-12">
            {/* Page Heading */}
            <div className="text-center mb-16 animate-fadeIn">
              <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
                Meet Our Executives
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our dedicated team is here to make a difference.
              </p>
            </div>

            {/* Executives Grid */}
            <div className="space-y-16">
              {Object.keys(groupedExecutives).map((role) => (
                <section key={role} className="space-y-8 animate-fadeIn">
                  {/* Role Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <h2 className="text-3xl font-bold text-white px-4">
                      {role}
                    </h2>
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  </div>

                  {/* Executives List */}
                  <div className="flex flex-wrap gap-8 justify-center">
                    {groupedExecutives[role].map((executive) => (
                      <div
                        key={executive._id}
                        className="flex flex-col items-center text-center gap-4 w-full max-w-[300px] hover:scale-102 transition-transform duration-300"
                      >
                        <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-colors duration-300 shadow-lg relative">
                          <Image
                            src={executive.imageUrl || "/placeholder.png"}
                            alt={`${executive.name}'s profile`}
                            fill
                            sizes="192px"
                            className="object-cover"
                            priority
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-primary">
                            {executive.position}
                          </p>
                          <h3 className="text-xl font-semibold text-white transition-colors">
                            {executive.name}
                          </h3>
                          <p className="text-base text-gray-300">
                            {executive.major}
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <a
                              href={`mailto:${executive.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-400 hover:text-primary transition-colors"
                              aria-label={`Email ${executive.name}`}
                            >
                              <FiMail className="w-5 h-5" />
                            </a>
                            {executive.linkedinUrl && (
                              <a
                                href={executive.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#0077b5] transition-colors"
                              >
                                <SiLinkedin className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                          {executive.description && (
                            <p className="text-sm text-gray-400 mt-2">
                              {executive.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
