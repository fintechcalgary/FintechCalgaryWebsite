import Link from "next/link";
import { FiArrowRight, FiUsers, FiAward, FiTrendingUp } from "react-icons/fi";
import SectionHeading from "@/components/ui/SectionHeading";

export default function ExecutiveApplications() {
  return (
    <section
      id="executive-applications"
      className="relative overflow-hidden py-24"
    >
      <div className="container relative mx-auto px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/executive-application">
            Executive Applications
          </SectionHeading>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="fc-card group relative mb-12 overflow-hidden p-12 lg:p-16">
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-purple-600/20 shadow-lg transition-all duration-300 hover:scale-110 hover:border-primary/50">
                  <FiAward className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
                  Join Our Executive Team
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
                  Take on a leadership role in shaping the future of fintech in
                  Calgary. We&apos;re looking for passionate individuals to join
                  our executive team and help drive innovation in the financial
                  technology sector.
                </p>
              </div>

              <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    icon: FiUsers,
                    title: "Leadership",
                    description:
                      "Lead initiatives and shape the direction of our organization",
                  },
                  {
                    icon: FiAward,
                    title: "Growth",
                    description:
                      "Develop your skills and expand your professional network",
                  },
                  {
                    icon: FiTrendingUp,
                    title: "Impact",
                    description:
                      "Make a real difference in the fintech community",
                  },
                ].map((item) => (
                  <div key={item.title} className="group/item text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-gray-800/50 bg-gray-800/30 transition-all duration-300 group-hover/item:scale-110 group-hover/item:border-primary/30 group-hover/item:shadow-lg group-hover/item:shadow-primary/10">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="mb-2 text-xl font-semibold text-white">
                      {item.title}
                    </h4>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>

              <Link href="/executive-application" className="fc-btn-soft group">
                Apply Now
                <FiArrowRight className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                title: "What We're Looking For",
                description:
                  "Passionate individuals with experience in fintech, business development, or community leadership. We value creativity, strategic thinking, and a commitment to advancing financial technology in Calgary.",
                link: "/about",
                linkText: "Learn about our team",
              },
              {
                title: "Benefits & Opportunities",
                description:
                  "Gain valuable leadership experience, expand your professional network, and contribute to the growth of Calgary's fintech ecosystem. Access exclusive events, mentorship opportunities, and industry connections.",
                link: "/partners",
                linkText: "View partners",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="fc-card group relative flex flex-col overflow-hidden p-8"
              >
                <div className="relative z-10 flex h-full flex-col">
                  <h3 className="mb-4 text-2xl font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mb-6 flex-grow leading-relaxed text-gray-300">
                    {card.description}
                  </p>
                  <Link
                    href={card.link}
                    className="fc-link group/link inline-flex items-center gap-2"
                  >
                    <span className="font-semibold">{card.linkText}</span>
                    <FiArrowRight className="transform transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
