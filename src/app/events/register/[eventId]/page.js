"use client";
import { useEffect, useRef, useState, useCallback, use } from "react";
import RegisterEventForm from "@/components/RegisterEventForm";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function RegisterEventPage({ params }) {
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 1200 } },
      color: { value: "#8b5cf6" },
      opacity: { value: 0.8 },
      size: { value: 2 },
      move: { enable: true, speed: 0.8, random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" } },
    },
    retina_detect: true,
  };

  return (
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <div className="relative z-10">
          <RegisterEventForm eventId={eventId} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
