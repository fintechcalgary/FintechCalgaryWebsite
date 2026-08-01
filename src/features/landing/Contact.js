import {
  FiMail,
  FiMapPin,
  FiLinkedin,
  FiInstagram,
  FiGithub,
  FiArrowRight,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import SectionHeading from "@/components/ui/SectionHeading";

const SocialIcon = ({ href, icon: Icon, label }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-3 rounded-lg border border-gray-700/30 bg-gray-900/40 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:translate-x-1 hover:border-primary/50 hover:bg-gray-800/60"
    >
      <Icon className="h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-primary" />
      <span className="text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-white">
        {label}
      </span>
      <FiArrowRight className="h-4 w-4 -translate-x-1 text-transparent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100" />
    </a>
  );
};

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center md:mb-20">
          <SectionHeading href="/contact">Get In Touch</SectionHeading>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <div className="fc-card group relative overflow-hidden p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <FiMail className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Send us an email
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-gray-400">
                    Questions, partnerships, or just want to chat? We&apos;re
                    all ears.
                  </p>
                  <a
                    href="mailto:fintech.calgary@gmail.com"
                    className="fc-link group/link inline-flex items-center gap-2 font-medium"
                  >
                    <span className="text-base">fintech.calgary@gmail.com</span>
                    <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>

            <div className="fc-card group relative overflow-hidden p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 transition-colors duration-300 group-hover:bg-purple-500/20">
                  <FiMapPin className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Find us
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-gray-400">
                    Based at the University of Calgary. We work with partners
                    across Canada.
                  </p>
                  <p className="font-medium text-purple-400">
                    University of Calgary
                  </p>
                  <p className="text-sm text-gray-400">
                    2500 University Dr NW, Calgary, AB T2N 1N4
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="fc-card group relative overflow-hidden p-8">
            <div className="flex h-full flex-col">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/10 transition-colors duration-300 group-hover:bg-pink-500/20">
                  <FiGithub className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Connect with us
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    Event posts, club updates, and occasional fintech news.
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <SocialIcon
                  href="https://linkedin.com/company/fintechcalgary"
                  icon={FiLinkedin}
                  label="LinkedIn"
                />
                <SocialIcon
                  href="https://instagram.com/fintechcalgary"
                  icon={FiInstagram}
                  label="Instagram"
                />
                <SocialIcon
                  href="https://github.com/fintechcalgary"
                  icon={FiGithub}
                  label="GitHub"
                />
                <SocialIcon
                  href="https://tiktok.com/@fintechcalgary"
                  icon={FaTiktok}
                  label="TikTok"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
