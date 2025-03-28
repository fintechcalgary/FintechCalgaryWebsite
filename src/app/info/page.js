"use client";

import { useCallback } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export default function InfoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    document.title = "Info | FinTech Calgary";
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 10, density: { enable: true, value_area: 800 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.5 },
      size: { value: 3 },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    retina_detect: true,
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Particles
        className="absolute inset-0 -z-10"
        init={particlesInit}
        options={particlesConfig}
      />

      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-12 max-w-6xl relative"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="relative overflow-hidden rounded-2xl mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-primary/5 animate-gradient-x rounded-2xl" />
          <div className="relative bg-gray-900/70 backdrop-blur-xl p-10 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
              >
                Repository & Instructions
              </motion.div>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  How to Access and Contribute
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Follow the steps below to request access to the repository and
                  make changes for future development.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group space-y-8"
          >
            <div
              className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                          transition-all duration-300 hover:bg-gray-900/80 hover:shadow-2xl hover:shadow-primary/20
                          hover:border-primary/30 hover:-translate-y-1 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Repository Link
              </h2>
              <p className="text-gray-300 mb-4">
                Access the official repository for the FinTech Calgary website
                project:
              </p>
              <a
                href="https://github.com/fintechcalgary/website"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
              >
                <span>https://github.com/fintechcalgary/website</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div
              className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                          transition-all duration-300 hover:bg-gray-900/80 hover:shadow-2xl hover:shadow-primary/20
                          hover:border-primary/30 hover:-translate-y-1 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Getting Started
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>Before contributing to the project, ensure you have:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Node.js (v18 or higher) installed</li>
                  <li>Git installed on your machine</li>
                  <li>A GitHub account</li>
                  <li>Your SSH keys configured</li>
                </ul>
                <p className="text-sm text-gray-400 mt-4">
                  For detailed setup instructions, please contact the team lead.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group h-full"
          >
            <div
              className="relative h-full bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                          transition-all duration-300 hover:bg-gray-900/80 hover:shadow-2xl hover:shadow-primary/20
                          hover:border-primary/30 hover:-translate-y-1 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                Instructions
              </h2>
              <ol className="list-decimal list-inside text-gray-300 space-y-4">
                <li>Contact the project administrator to request access.</li>
                <li>
                  Clone the repository using:
                  <code className="block mt-2 bg-gray-800/80 text-white p-3 rounded-lg font-mono text-sm">
                    git clone https://github.com/fintechcalgary/website
                  </code>
                </li>
                <li>
                  Create a new branch for your changes:
                  <code className="block mt-2 bg-gray-800/80 text-white p-3 rounded-lg font-mono text-sm">
                    git checkout -b your-branch-name
                  </code>
                </li>
                <li>
                  Make your changes and commit them using:
                  <code className="block mt-2 bg-gray-800/80 text-white p-3 rounded-lg font-mono text-sm">
                    git commit -m &quot;Your commit message&quot;
                  </code>
                </li>
                <li>
                  Push your changes and create a pull request:
                  <code className="block mt-2 bg-gray-800/80 text-white p-3 rounded-lg font-mono text-sm">
                    git push origin your-branch-name
                  </code>
                </li>
                <li>
                  Ensure your code is reviewed and approved before merging.
                </li>
              </ol>
            </div>
          </motion.section>
        </div>
      </motion.main>
    </div>
  );
}
