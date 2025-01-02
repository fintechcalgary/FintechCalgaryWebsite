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

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#6d28d9",
      },
      opacity: {
        value: 0.5,
      },
      size: {
        value: 3,
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#6d28d9",
        opacity: 0.4,
        width: 1,
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
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab",
        },
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
    <div className="min-h-screen relative bg-background">
      <Particles
        className="absolute inset-0"
        init={particlesInit}
        options={particlesConfig}
      />

      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-8 max-w-7xl relative"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="relative overflow-hidden rounded-2xl mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500/30 to-primary/10 animate-gradient-x rounded-2xl" />
          <div className="relative bg-gray-900/60 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
              >
                Repository & Instructions
              </motion.div>
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  How to Access and Contribute
                </h1>
                <p className="text-gray-300 text-lg">
                  Follow the steps below to request access to the repository and
                  make changes for future development.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <div
              className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                            transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                            hover:border-white/20 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Repository Link
              </h2>
              <p className="text-gray-400 mb-4">
                Access the repository for this project at:
              </p>
              <a
                href="https://github.com/your-repo-link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                https://github.com/your-repo-link
              </a>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group"
          >
            <div
              className="relative h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
                            transition-all duration-300 hover:bg-gray-900/70 hover:shadow-xl hover:shadow-primary/10
                            hover:border-white/20 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Instructions
              </h2>
              <ol className="list-decimal list-inside text-gray-400 space-y-2">
                <li>Contact the project administrator to request access.</li>
                <li>
                  Clone the repository using:
                  <code className="bg-gray-800 text-white p-1 rounded">
                    git clone https://github.com/your-repo-link
                  </code>
                </li>
                <li>
                  Create a new branch for your changes:
                  <code className="bg-gray-800 text-white p-1 rounded">
                    git checkout -b your-branch-name
                  </code>
                </li>
                <li>
                  Make your changes and commit them using:
                  <code className="bg-gray-800 text-white p-1 rounded">
                    git commit -m "Your commit message"
                  </code>
                </li>
                <li>
                  Push your changes and create a pull request:
                  <code className="bg-gray-800 text-white p-1 rounded">
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
