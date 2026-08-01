import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SectionHeading from "@/components/ui/SectionHeading";

const ServiceCard = ({ title, description }) => {
  return (
    <div className="fc-card group relative flex-1 overflow-hidden p-6">
      <div className="relative z-10 flex h-full flex-col">
        <h3 className="mb-3 text-2xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-0.5">
          {title}
        </h3>
        <p className="mb-4 flex-grow leading-relaxed text-gray-300">
          {description}
        </p>
        <Link
          href="/about"
          className="fc-link group/link mt-auto inline-flex items-center gap-2"
        >
          <span className="font-semibold transition-transform duration-300 group-hover/link:translate-x-1">
            Learn more
          </span>
          <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default function AboutUs() {
  return (
    <section id="about" className="relative overflow-hidden py-24">
      <div
        className="absolute right-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-primary/10 blur-2xl"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 h-24 w-24 animate-pulse rounded-full bg-purple-500/10 blur-xl"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="container relative mx-auto px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/about">About Us</SectionHeading>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="fc-card group relative flex flex-col justify-between overflow-hidden p-8 lg:col-span-2 lg:p-10">
            <div className="relative z-10">
              <h3 className="mb-4 text-3xl font-bold text-white">Our Mission</h3>
              <p className="mb-4 leading-relaxed text-gray-300">
                FinTech Calgary is a student association at the University of
                Calgary. We introduce fintech companies to business buyers, run
                industry events, and give students project work with partners —
                not just speaker panels. The goal is straightforward: market
                access for companies, and useful experience for students.
              </p>
              <Link
                href="/about"
                className="fc-link group/link inline-flex items-center gap-2"
              >
                <span className="font-semibold transition-transform duration-300 group-hover/link:translate-x-1">
                  Learn more
                </span>
                <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative z-10 mt-6 block h-full items-center justify-center overflow-hidden">
              <DotLottieReact
                src="/lottie/crypto.lottie"
                autoplay
                loop
                className="h-full w-full"
                renderer="svg"
              />
            </div>
          </div>

          <div className="flex h-full flex-col gap-6">
            <ServiceCard
              title="Our Services"
              description="We help tech companies reach businesses that might buy from them — through partner features, digital marketing, and event demos aimed at decision-makers."
            />
            <ServiceCard
              title="Our Network"
              description="We work with companies and associations in payments, hospitality, and services so vendors and buyers can meet without relying only on cold outreach."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
