import { FiGithub, FiInstagram, FiLinkedin } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { SOCIAL_LINKS } from "@/lib/constants";

const ICONS = {
  LinkedIn: FiLinkedin,
  Instagram: FiInstagram,
  GitHub: FiGithub,
  TikTok: FaTiktok,
};

/**
 * Labeled social rows. Same destinations on the home contact block and contact page.
 */
export default function SocialLinks({ className = "" }) {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {SOCIAL_LINKS.map(({ label, href }) => {
        const Icon = ICONS[label];
        return (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-3 rounded-xl border border-white/5 bg-gray-900/40 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:translate-x-1 hover:border-primary/40 hover:bg-gray-800/60"
          >
            {Icon ? (
              <span className="fc-icon">
                <Icon className="h-5 w-5" />
              </span>
            ) : null}
            <span className="fc-muted text-sm font-medium tracking-wide transition-colors duration-300 group-hover:text-white">
              {label}
            </span>
            <FiArrowRight className="ml-auto h-4 w-4 -translate-x-1 text-transparent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
          </a>
        );
      })}
    </div>
  );
}
