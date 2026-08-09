import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "@/components/ui/SectionHeading";

const FeatureCard = ({ feature }) => {
  return (
    <div className="fc-card group relative p-8">
      <div className="flex h-full flex-col">
        <h3 className="mb-4 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-primary">
          {feature.title}
        </h3>
        <p className="flex-1 text-base leading-relaxed text-gray-400">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export default function MissionStatement() {
  const features = [
    {
      title: "To Educate",
      description:
        "Learn about the evolving world of Fintech and its transformative impact",
    },
    {
      title: "To Inspire",
      description: "Foster creativity and innovation in discovering new ideas",
    },
    {
      title: "To Shape",
      description: "Be part of shaping the future of financial technology",
    },
  ];

  return (
    <section id="join" className="relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/about">Mission Statement</SectionHeading>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3 lg:gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
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
