"use client";
import { GLASS_CARD_CLASS, ICON_GLYPH_CLASS } from "@/lib/uiTokens";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import BackLink from "@/components/ui/BackLink";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";

export default function RegistrationSuccess() {

  return (
    <PublicPageShell title="Registration Successful | FinTech Calgary">

      <div className="relative flex-grow flex items-center justify-center">
        <div className="relative z-10 w-full max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <BackLink href="/" label="Back to Home" />

            <div className={`${GLASS_CARD_CLASS} p-8 shadow-2xl animate-fade-in`.trim()}>
              <div className="flex items-center justify-center mb-6">
                <span className={ICON_GLYPH_CLASS}>
                  <FiCheck className="h-8 w-8" />
                </span>
              </div>

              <PageTitle sizeClass="text-3xl mb-4" className="text-center">
                Registration Successful!
              </PageTitle>

              <p className="text-center">
                Thank you for registering.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicPageShell>
  );
}
