"use client";

import PublicPageShell from "@/components/layout/PublicPageShell";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { PageTitle } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function AboutPage() {
  return (
    <PublicPageShell title="About | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12">
          <div className="relative mb-16 animate-fadeIn text-center">
            <PageTitle
              sizeClass="text-3xl sm:text-4xl md:text-5xl mb-6"
              className="relative z-10"
            >
              About Us
            </PageTitle>
            <p className="fc-lede relative z-10 mx-auto mb-6 max-w-3xl sm:mb-10">
              Welcome to FinTech Calgary!
            </p>
          </div>

          <div className="grid max-w-6xl mx-auto grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2">
            <div className="animate-slideInLeft">
              <GlowCard
                customSize
                glowColor="purple"
                className="group relative h-full w-full !gap-0 !p-6 sm:!p-8"
              >
                <h2 className="fc-title-accent relative z-10 mb-4 text-xl sm:mb-6 sm:text-2xl">
                  Who We Are
                </h2>
                <p className="fc-body-lg relative z-10">
                  FinTech Calgary is a fintech association dedicated to bridging
                  the gap between fintech companies and key business decision
                  makers. Through hands-on projects, industry events, and
                  collaborative initiatives, we create meaningful B2B engagement
                  opportunities for both students and industry partners. Our
                  association goes beyond visibility, we provide practical market
                  access, informed student-driven insights, and direct connections
                  that support real business outcomes.
                </p>
              </GlowCard>
            </div>

            <div className="flex items-center justify-center animate-slideInRight">
              <div className="w-full">
                <DotLottieReact
                  src="/lottie/blockchain4.lottie"
                  autoplay
                  loop
                  className="h-full w-full object-contain"
                  renderer="svg"
                />
              </div>
            </div>

            <div className="animate-slideInUp md:col-span-2">
              <GlowCard
                customSize
                glowColor="purple"
                className="group relative w-full !gap-0 !p-6 sm:!p-8"
              >
                <h2 className="fc-title-accent relative z-10 mb-4 text-xl sm:mb-6 sm:text-2xl">
                  Our Services
                </h2>
                <p className="fc-body-lg relative z-10">
                  We provide tech companies with a platform to showcase their
                  solutions to targeted businesses. Through digital marketing and
                  partner features, we connect innovative technologies with
                  decision-makers to drive adoption and growth.
                </p>
              </GlowCard>
            </div>

            <div className="flex items-center justify-center animate-slideInLeft">
              <div className="w-full">
                <DotLottieReact
                  src="/lottie/blockchain1.lottie"
                  autoplay
                  loop
                  className="h-full w-full object-contain"
                  renderer="svg"
                />
              </div>
            </div>

            <div className="animate-slideInRight">
              <GlowCard
                customSize
                glowColor="purple"
                className="group relative h-full w-full !gap-0 !p-6 sm:!p-8"
              >
                <h2 className="fc-title-accent relative z-10 mb-4 text-xl sm:mb-6 sm:text-2xl">
                  Our Network
                </h2>
                <p className="fc-body-lg relative z-10">
                  FinTech Calgary brings together a powerful network of fintech
                  innovators, enterprise buyers, and sector-specific associations
                  across payments, hospitality, and services. We create the
                  conditions for strategic partnerships and real-world
                  implementation by bridging the gap between solution providers
                  and the businesses that need them. Together, we&apos;re
                  accelerating the future of financial technology, one connection
                  at a time.
                </p>
              </GlowCard>
            </div>
          </div>
        </div>

        <div className="mb-16 animate-slideInUp px-6 text-center sm:mb-32 sm:px-8">
          <GlowCard
            customSize
            glowColor="purple"
            className="mx-auto max-w-4xl !gap-0 !p-8 sm:!p-12"
          >
            <div className="relative z-10 text-center">
              <h2 className="fc-title-accent mb-4 text-2xl sm:mb-6">
                Membership
              </h2>
              <p className="fc-lede mx-auto mb-6 max-w-2xl sm:mb-8">
                Want event invites, workshops, and partner opportunities? Sign up
                for membership.
              </p>
              <Link href="/join" className="fc-btn-primary group">
                Become a Member
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </GlowCard>
        </div>
      </div>
    </PublicPageShell>
  );
}
