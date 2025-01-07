"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import * as THREE from "three";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [groupedMembers, setGroupedMembers] = useState({});
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 1000 } },
      color: { value: "#8b5cf6" },
      opacity: { value: 0.6 },
      size: { value: 2.5 },
      move: { enable: true, speed: 1, random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" } },
    },
    retina_detect: true,
  };

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      import("vanta/dist/vanta.globe.min").then((GLOBE) => {
        setVantaEffect(
          GLOBE.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x6d28d9,
            backgroundColor: 0x1e1b2e,
          })
        );
      });
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      const data = await response.json();

      const grouped = data.reduce((acc, member) => {
        if (!acc[member.position]) acc[member.position] = [];
        acc[member.position].push(member);
        return acc;
      }, {});

      setMembers(data);
      setGroupedMembers(grouped);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      {/* Navbar */}
      <PublicNavbar />

      {/* Particles + Vanta background */}
      <div className="relative flex-grow">
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />
        <motion.section
          ref={vantaRef}
          className="relative z-10 flex items-center justify-center min-h-screen"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 z-0"></div>

          {/* Content Section */}
          <div className="relative z-10 container mx-auto px-6 py-16 sm:px-8 lg:px-10">
            {/* Page Heading */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h1 className="text-5xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-4">
                Meet Our Team
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Our dedicated team of professionals is here to make a
                difference.
              </p>
            </motion.div>

            {/* Members Grid */}
            <div className="space-y-10">
              {Object.keys(groupedMembers).map((role) => (
                <motion.section
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Role Header */}
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    {role}
                  </h2>

                  {/* Members List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {groupedMembers[role].map((member) => (
                      <div
                        key={member._id}
                        className="relative bg-gray-800/70 p-5 rounded-xl border border-gray-700 hover:bg-gray-800 hover:border-primary/50 transition-all duration-300 shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                            <img
                              src={member.imageUrl || "/placeholder.png"}
                              alt={`${member.name}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {member.major}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
