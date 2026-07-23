"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AboutUs from "@/features/landing/AboutUs";
import UpcomingEvents from "@/features/landing/UpcomingEvents";
import Contact from "@/features/landing/Contact";
import { FiArrowRight } from "react-icons/fi";
import MissionStatement from "@/features/landing/MissionStatement";
import Partners from "@/features/partners/LandingPartners";
import ExecutiveApplications from "@/features/landing/ExecutiveApplications";
import ExecutiveApplicationBanner from "@/features/executives/ExecutiveApplicationBanner";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { normalizeDate, startOfToday } from "@/lib/dates";

export default function Home() {
  const [allEvents, setAllEvents] = useState([]);
  const { executiveApplicationsOpen, settingsLoaded } = useSettings();

  useEffect(() => {
    let isMounted = true;

    // fetches both events and webinars
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok && isMounted) {
          const data = await response.json();
          const normalizedCurrentDate = startOfToday();

          // Filter only upcoming events and webinars
          const upcomingEventsAndWebinars = data
            .filter((e) => normalizeDate(e.date) >= normalizedCurrentDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 4); // Only show first 4 upcoming events/webinars

          if (isMounted) {
            setAllEvents(upcomingEventsAndWebinars);
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PublicPageShell
      title="FinTech Calgary"
      mainClassName="flex flex-col min-h-screen overflow-hidden relative"
    >
      <div className="relative flex-grow">
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-24 pb-20 md:pt-28 md:pb-24">
          {/* Layered backdrop */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(202,60,255,0.22),transparent),radial-gradient(ellipse_60%_45%_at_100%_40%,rgba(168,85,247,0.12),transparent),radial-gradient(ellipse_50%_40%_at_0%_60%,rgba(236,72,153,0.08),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage:
                "radial-gradient(ellipse 85% 65% at 50% 35%, black 20%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 85% 65% at 50% 35%, black 20%, transparent 75%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-0 z-[1] overflow-visible">
            <Image
              src="/globe.svg"
              alt=""
              width={900}
              height={900}
              priority
              className="absolute left-1/2 top-[42%] min-h-[115vmin] min-w-[115vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.72] saturate-[1.05] contrast-[1.02] drop-shadow-[0_0_50px_rgba(202,60,255,0.18)] sm:opacity-[0.82] md:top-[44%] md:min-h-[132vmin] md:min-w-[132vmin] md:opacity-[0.92] lg:top-[51%] lg:min-h-[135vmin] lg:min-w-[135vmin] xl:top-[57%] xl:min-h-[138vmin] xl:min-w-[138vmin] 2xl:top-[60%] 2xl:min-h-[141vmin] 2xl:min-w-[141vmin]"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <h1 className="animate-fade-in-down font-sans bg-gradient-to-br from-white via-white to-white/75 bg-clip-text pb-2 text-[clamp(3.125rem,calc(2.25rem+5vw),3.75rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-transparent drop-shadow-[0_3px_28px_rgba(0,0,0,0.55)] max-[380px]:text-[clamp(3rem,calc(1.85rem+7.5vw),3.5rem)] sm:pb-3 sm:text-6xl sm:tracking-tight sm:leading-[1.05] md:text-7xl xl:text-8xl xl:leading-[1.02]">
              FinTech{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400/70 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
                Calgary
              </span>
            </h1>

            <p className="animation-delay-300 animate-fade-in-down mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed tracking-wide text-gray-400 max-[380px]:mt-3 sm:mt-5 sm:text-lg md:text-xl md:leading-relaxed">
              Innovating the future of finance through events, partnerships, and
              hands-on collaboration between builders and decision-makers.
            </p>

            <div className="animation-delay-600 animate-fade-in-up mx-auto mt-10 flex max-w-[320px] flex-col items-stretch gap-3 sm:mx-0 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/join"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-purple-500/80 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/15 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/15 sm:w-auto sm:py-4 sm:text-lg"
              >
                Join Us
              </Link>
              <Link
                href="/partner-signup"
                className="group inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-primary/35 hover:bg-white/[0.07] sm:w-auto sm:py-4 sm:text-lg"
              >
                Become an Associate
                <FiArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="animation-delay-600 animate-fade-in-up mx-auto mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8 text-center motion-reduce:animate-none motion-reduce:opacity-100 sm:max-w-2xl sm:gap-8">
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                  B2B
                </p>
                <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:text-[11px]">
                  Focused programs
                </p>
              </div>
              <div className="border-x border-white/10 px-2">
                <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                  Events
                </p>
                <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:text-[11px]">
                  & educational talks
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                  Network
                </p>
                <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 sm:text-[11px]">
                  Industry partners
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="relative">
        {settingsLoaded && executiveApplicationsOpen && (
          <ExecutiveApplications />
        )}
      </div>

      <div className="relative">
        <AboutUs />
      </div>

      <div className="relative">
        <MissionStatement />
      </div>

      <div className="relative">
        <UpcomingEvents events={allEvents} />
      </div>

      <div className="relative">
        <Partners />
      </div>

      <div className="relative">
        <Contact />
      </div>

      <div className="relative">
        <ExecutiveApplicationBanner />
      </div>
    </PublicPageShell>
  );
}
