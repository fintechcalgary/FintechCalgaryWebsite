import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/spotlight-card";

const FeatureCard = ({ feature, glowColor }) => {
  return (
    <GlowCard
      customSize
      glowColor={glowColor}
      className="group relative flex h-full min-h-0 w-full flex-col !gap-0 !p-6"
    >
      <h3 className="fc-title mb-2 text-xl transition-transform duration-300 group-hover:-translate-y-0.5">
        {feature.title}
      </h3>
      <p className="fc-body mb-4 flex-1">
        {feature.description}
      </p>
    </GlowCard>
  );
};

export default function MissionStatement() {
  const features = [
    {
      title: "To Educate",
      description:
        "Learn about the evolving world of Fintech and its transformative impact",
      glowColor: "purple",
    },
    {
      title: "To Inspire",
      description: "Foster creativity and innovation in discovering new ideas",
      glowColor: "pink",
    },
    {
      title: "To Shape",
      description: "Be part of shaping the future of financial technology",
      glowColor: "purple",
    },
  ];

  return (
    <section id="join" className="relative overflow-x-clip py-24">
      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/about">Mission Statement</SectionHeading>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3 lg:gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              glowColor={feature.glowColor}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/join" className="fc-btn-primary group">
            Join Now
            <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
