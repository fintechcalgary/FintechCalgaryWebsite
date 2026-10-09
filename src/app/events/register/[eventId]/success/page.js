"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiCheck, FiArrowLeft } from "react-icons/fi";
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
            <Link
              href="/"
              className="fc-link mb-8 inline-flex items-center transition-transform duration-200 hover:translate-x-[-4px] group"
            >
              <FiArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
              Back to Home
            </Link>

            <div className="fc-card p-8 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiCheck className="w-8 h-8 text-primary" />
                </div>
              </div>

              <PageTitle sizeClass="text-3xl mb-4" className="text-center">
                Registration Successful!
              </PageTitle>

              <p className="fc-body text-center">
                Thank you for registering.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicPageShell>
  );
}
