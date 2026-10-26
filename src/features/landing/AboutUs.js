import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";

const ServiceCard = ({ title, description, glowColor = "purple" }) => {
  return (
    <GlowCard
      customSize
      glowColor={glowColor}
      className="group relative flex min-h-0 flex-1 !gap-0 !p-6"
    >
      <div className="relative z-10 flex h-full flex-col justify-center">
        <h3 className="fc-title mb-2 text-xl transition-transform duration-300 group-hover:-translate-y-0.5">
          {title}
        </h3>
        <p className="fc-body mb-4">
          {description}
        </p>
        <Link
          href="/about"
          className="fc-link group/link mt-auto inline-flex items-center gap-2 text-sm"
        >
          <span className="transition-transform duration-300 group-hover/link:translate-x-1">
            Learn more
          </span>
          <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </GlowCard>
  );
};

export default function AboutUs() {
  return (
    <section id="about" className="relative overflow-x-clip py-24">
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

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
          <GlowCard
            customSize
            glowColor="purple"
            className="group relative flex min-h-[32rem] flex-col !gap-0 !p-7 sm:min-h-[34rem] lg:min-h-[36rem] lg:!p-8"
          >
            <div className="relative z-10 shrink-0">
              <h3 className="fc-title mb-3 text-2xl">Our Mission</h3>
              <p className="fc-body mb-4 sm:text-base sm:leading-[1.75]">
                FinTech Calgary is a student association at the University of
                Calgary. We introduce fintech companies to business buyers, run
                industry events, and give students project work with partners —
                not just speaker panels. The goal is straightforward: market
                access for companies, and useful experience for students.
              </p>
              <Link
                href="/about"
                className="fc-link group/link inline-flex items-center gap-2 text-sm"
              >
                <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                  Learn more
                </span>
                <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative z-10 mx-auto mt-6 flex w-full max-w-[20rem] flex-1 items-center justify-center overflow-hidden sm:max-w-[24rem] lg:max-w-[28rem]">
              <DotLottieReact
                src="/lottie/crypto.lottie"
                autoplay
                loop
                className="mx-auto h-full max-h-80 w-full object-contain sm:max-h-96 lg:max-h-[26rem]"
                renderer="svg"
              />
            </div>
          </GlowCard>

          <div className="flex min-h-[32rem] flex-col gap-6 sm:min-h-[34rem] lg:min-h-[36rem]">
            <ServiceCard
              title="Our Services"
              description="We help tech companies reach businesses that might buy from them — through partner features, digital marketing, and event demos aimed at decision-makers."
              glowColor="pink"
            />
            <ServiceCard
              title="Our Network"
              description="We work with companies and associations in payments, hospitality, and services so vendors and buyers can meet without relying only on cold outreach."
              glowColor="purple"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
