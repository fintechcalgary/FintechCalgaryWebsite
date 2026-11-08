"use client";

import { motion } from "framer-motion";
import BackLink from "@/components/ui/BackLink";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";

export default function NotFound() {

  return (
    <PublicPageShell title="404 - Page Not Found | FinTech Calgary">

      <div className="relative flex-grow flex items-center justify-center">
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <PageTitle sizeClass="text-8xl mb-8">404</PageTitle>
            <h2 className="mb-6 text-3xl">Page Not Found</h2>
            <p className="text-lede mb-12">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <BackLink
              href="/"
              label="Back to Home"
              spacing="none"
              align="center"
            />
          </motion.div>
        </div>
      </div>
    </PublicPageShell>
  );
}
