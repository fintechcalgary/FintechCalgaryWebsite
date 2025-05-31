"use client";

import { useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About | FinTech Calgary";
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="text-center mb-16 relative animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6 relative z-10">
              About Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto relative z-10 mb-10">
              Welcome to FinTech Calgary!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500 animate-slideInLeft">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="text-3xl font-bold text-primary mb-6 relative">
                Who We Are
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg relative">
                FinTech Calgary is a digital marketing platform clientele built
                for B2B engagement. We specialize in connecting payment
                processing companies with business decision makers who are ready
                to evaluate and adopt innovative financial technologies. Our
                platform goes beyond visibility, we enable meaningful market
                access and direct connections that drive real business outcomes.
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

            <div className="md:col-span-2 group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500 animate-slideInUp">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="text-3xl font-bold text-primary mb-6 relative">
                Our Services
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg relative">
                We provide payment processing companies with a dedicated
                platform to market their solutions to a curated audience of
                businesses across key industries. Through targeted digital
                marketing campaigns, showcase opportunities, and partner
                features, we help our clients position their technologies in
                front of the right stakeholders, accelerating interest,
                adoption, and growth.
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

            <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500 animate-slideInRight">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="text-3xl font-bold text-primary mb-6 relative">
                Our Network
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg relative">
                FinTech Calgary brings together a powerful network of fintech
                innovators, enterprise buyers, and sector-specific associations
                across payments, hospitality, and services. We create the
                conditions for strategic partnerships and real-world
                implementation by bridging the gap between solution providers
                and the businesses that need them. Together, we’re accelerating
                the future of financial technology, one connection at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mb-32 text-center animate-slideInUp">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl p-12 rounded-3xl border border-gray-700/50 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Join Our Community
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Ready to be part of the future of finance and technology? Join
              FinTech Calgary today and connect with like-minded innovators.
            </p>
            <Link
              href="/join"
              className="inline-flex items-center px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-primary/30"
            >
              Become a Member
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
