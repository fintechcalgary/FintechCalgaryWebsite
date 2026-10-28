import { FiArrowRight, FiGithub, FiMail, FiMapPin } from "react-icons/fi";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/layout/LandingSection";
import { GlowCard } from "@/components/ui/spotlight-card";
import SocialLinks from "@/components/ui/SocialLinks";
import { SITE_CONTACT } from "@/lib/constants";

export default function Contact() {
  return (
    <LandingSection id="contact">
      <LandingContainer>
        <LandingSectionHeader href="/contact">Get In Touch</LandingSectionHeader>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <GlowCard
              customSize
              glowColor="purple"
              className="group relative w-full !gap-0 !p-6"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="fc-icon-tile">
                  <FiMail className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="fc-title mb-2 text-xl">
                    Send us an email
                  </h3>
                  <p className="fc-body mb-4">
                    Questions, partnerships, or just want to chat? We&apos;re
                    all ears.
                  </p>
                  <a
                    href={SITE_CONTACT.mailto}
                    className="fc-link-underline group/link inline-flex items-center gap-2"
                  >
                    <span className="text-base">{SITE_CONTACT.email}</span>
                    <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </a>
                </div>
              </div>
            </GlowCard>

            <GlowCard
              customSize
              glowColor="purple"
              className="group relative w-full !gap-0 !p-6"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="fc-icon-tile">
                  <FiMapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="fc-title mb-2 text-xl">
                    Find us
                  </h3>
                  <p className="fc-body mb-3">
                    Based at the University of Calgary. We work with partners
                    across Canada.
                  </p>
                  <p className="font-medium tracking-wide text-primary">
                    {SITE_CONTACT.addressName}
                  </p>
                  <p className="fc-muted">{SITE_CONTACT.addressLine}</p>
                </div>
              </div>
            </GlowCard>
          </div>

          <GlowCard
            customSize
            glowColor="pink"
            className="group relative w-full !gap-0 !p-6"
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex items-start gap-4">
                <div className="fc-icon-tile">
                  <FiGithub className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="fc-title mb-2 text-xl">
                    Connect with us
                  </h3>
                  <p className="fc-body">
                    Event posts, club updates, and occasional fintech news.
                  </p>
                </div>
              </div>

              <SocialLinks className="flex-1" />
            </div>
          </GlowCard>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
