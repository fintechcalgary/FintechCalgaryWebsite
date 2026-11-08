import { linkAccent, linkUnderline } from "@/lib/uiClassNames";
import { BTN_MARKETING_SOFT_CLASS, ICON_GLYPH_CLASS } from "@/lib/uiTokens";
import Link from "next/link";
import { FiArrowRight, FiUsers, FiAward, FiTrendingUp } from "react-icons/fi";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/layout/LandingSection";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function ExecutiveApplications() {
  return (
    <LandingSection id="executive-applications">
      <LandingContainer>
        <LandingSectionHeader href="/executive-application">
          Executive Applications
        </LandingSectionHeader>

        <div className="mx-auto max-w-6xl">
          <GlowCard
            customSize
            glowColor="purple"
            className="group relative mb-12 w-full !gap-0 !p-8 lg:!p-10"
          >
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className={`${ICON_GLYPH_CLASS} mx-auto mb-6 transition-transform duration-300 hover:scale-110`.trim()}>
                  <FiAward className="h-10 w-10" />
                </div>
                <h3 className="mb-4 text-2xl sm:text-3xl"><span className="heading-accent inline">
                  Join Our Executive Team
                </span></h3>
                <p className="mx-auto mb-8 max-w-3xl sm:text-base sm:leading-[1.75]">
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
                    <div className={`${ICON_GLYPH_CLASS} mx-auto mb-4 transition-transform duration-300 group-hover/item:scale-110`.trim()}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h4 className="mb-2 text-xl">
                      {item.title}
                    </h4>
                    <p>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/executive-application" className={`${BTN_MARKETING_SOFT_CLASS} group`.trim()}>
                Apply Now
                <FiArrowRight className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </GlowCard>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                title: "What We're Looking For",
                description:
                  "Passionate individuals with experience in fintech, business development, or community leadership. We value creativity, strategic thinking, and a commitment to advancing financial technology in Calgary.",
                link: "/about",
                linkText: "Learn about our team",
                glowColor: "purple",
              },
              {
                title: "Benefits & Opportunities",
                description:
                  "Gain valuable leadership experience, expand your professional network, and contribute to the growth of Calgary's fintech ecosystem. Access exclusive events, mentorship opportunities, and industry connections.",
                link: "/partners",
                linkText: "View partners",
                glowColor: "pink",
              },
            ].map((card) => (
              <GlowCard
                key={card.title}
                customSize
                glowColor={card.glowColor}
                className="group relative flex w-full flex-col !gap-0 !p-6"
              >
                <div className="relative z-10 flex h-full flex-col">
                  <h3 className="mb-2 text-xl">
                    {card.title}
                  </h3>
                  <p className="mb-4 flex-1">
                    {card.description}
                  </p>
                  <Link
                    href={card.link}
                    className={`${linkAccent} group/link inline-flex items-center gap-2`.trim()}
                  >
                    <span>{card.linkText}</span>
                    <FiArrowRight className="transform transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
