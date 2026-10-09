"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";

export default function NotFound() {

  return (
    <PublicPageShell title="404 - Page Not Found | FinTech Calgary">

      <div className="relative flex-grow flex items-center justify-center">
        <div className="relative z-10 container mx-auto px-6 pt-36 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <PageTitle sizeClass="text-8xl mb-8">404</PageTitle>
            <h2 className="fc-title text-3xl mb-6">Page Not Found</h2>
            <p className="fc-lede mb-12">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <Link
              href="/"
              className="fc-btn-primary group !px-6 !py-3"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </PublicPageShell>
  );
}
