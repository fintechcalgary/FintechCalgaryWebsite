"use client";

import PublicPageShell from "@/components/layout/PublicPageShell";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { PageTitle } from "@/components/ui/SectionHeading";

export default function AboutPage() {
  return (
    <PublicPageShell title="About | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12">
          <div className="relative mb-16 animate-fadeIn text-center">
            <PageTitle
              sizeClass="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6"
              className="relative z-10"
            >
              About Us
            </PageTitle>
            <p className="relative z-10 mx-auto mb-6 max-w-3xl text-lg text-gray-300 sm:mb-10 sm:text-xl">
              Welcome to FinTech Calgary!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 max-w-6xl mx-auto">
            <div className="fc-card group relative animate-slideInLeft p-6 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 relative">
                Who We Are
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed relative">
                FinTech Calgary is a fintech association dedicated to bridging
                the gap between fintech companies and key business decision
                makers. Through hands-on projects, industry events, and
                collaborative initiatives, we create meaningful B2B engagement
                opportunities for both students and industry partners. Our
                association goes beyond visibility, we provide practical market
                access, informed student-driven insights, and direct connections
                that support real business outcomes.
              </p>
            </div>

            <div className="flex items-center justify-center animate-slideInRight">
              <div className="w-full">
                <DotLottieReact
                  src="/lottie/blockchain4.lottie"
                  autoplay
                  loop
                  className="w-full h-full object-contain"
                  renderer="svg"
                />
              </div>
            </div>

            <div className="fc-card group relative animate-slideInUp p-6 md:col-span-2 sm:p-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-400/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <h2 className="relative mb-4 text-2xl font-bold text-primary sm:mb-6 sm:text-3xl">
                Our Services
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed relative">
                We provide tech companies with a platform to showcase their
                solutions to targeted businesses. Through digital marketing and
                partner features, we connect innovative technologies with
                decision-makers to drive adoption and growth.
              </p>
            </div>

            <div className="flex items-center justify-center animate-slideInLeft">
              <div className="w-full">
                <DotLottieReact
                  src="/lottie/blockchain1.lottie"
                  autoplay
                  loop
                  className="w-full h-full object-contain"
                  renderer="svg"
                />
              </div>
            </div>

            <div className="fc-card group relative animate-slideInRight p-6 sm:p-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-400/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <h2 className="relative mb-4 text-2xl font-bold text-primary sm:mb-6 sm:text-3xl">
                Our Network
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed relative">
                FinTech Calgary brings together a powerful network of fintech
                innovators, enterprise buyers, and sector-specific associations
                across payments, hospitality, and services. We create the
                conditions for strategic partnerships and real-world
                implementation by bridging the gap between solution providers
                and the businesses that need them. Together, we&apos;re
                accelerating the future of financial technology, one connection
                at a time.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16 animate-slideInUp px-6 text-center sm:mb-32 sm:px-8">
          <div className="fc-card mx-auto max-w-4xl p-8 sm:p-12">
            <h2 className="mb-4 bg-gradient-to-r from-primary to-purple-400/75 bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl">
              Membership
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-300 sm:mb-8 sm:text-xl">
              Want event invites, workshops, and partner opportunities? Sign up
              for membership.
            </p>
            <Link href="/join" className="fc-btn-primary group">
              Become a Member
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
