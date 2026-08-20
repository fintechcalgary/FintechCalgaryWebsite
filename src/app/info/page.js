"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiCheckCircle,
  FiGithub,
  FiTerminal,
} from "react-icons/fi";
import Navbar from "@/components/layout/AdminNavbar";
import { LoadingState } from "@/components/ui/Spinner";
import { GlowCard } from "@/components/ui/spotlight-card";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const REPO_URL = "https://github.com/fintechcalgary/website";

const prerequisites = [
  "Node.js (v18 or higher) installed",
  "Git installed on your machine",
  "A GitHub account",
  "Your .env file configured",
];

const instructions = [
  {
    text: "Contact the project administrator to request access.",
  },
  {
    text: "Clone the repository using:",
    code: "git clone https://github.com/fintechcalgary/website",
  },
  {
    text: "Create a new branch for your changes:",
    code: "git checkout -b your-branch-name",
  },
  {
    text: "Make your changes and commit them using:",
    code: 'git commit -m "Your commit message"',
  },
  {
    text: "Push your changes and create a pull request:",
    code: "git push origin your-branch-name",
  },
  {
    text: "Ensure your code is reviewed and approved before merging.",
  },
];

function CodeBlock({ children }) {
  return (
    <code className="mt-3 block overflow-x-auto rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-violet-100/90 shadow-inner shadow-black/20">
      {children}
    </code>
  );
}

export default function InfoPage() {
  const { status } = useSession();
  const router = useRouter();

  useDocumentTitle("Info | FinTech Calgary");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingState fullScreen />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 animate-pulse rounded-full bg-violet-500/5 blur-2xl"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl animate-fadeIn px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1 sm:space-y-2">
            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Info
            </h1>
            <p className="text-sm text-gray-400 sm:text-base md:text-lg">
              Repository access and contribution guide
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2.5 text-sm text-white transition-all duration-300 hover:bg-gray-700/50 sm:w-auto"
          >
            <FiArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        <div className="relative mb-8 animate-fadeIn sm:mb-10">
          <GlowCard
            customSize
            glowColor="purple"
            className="w-full !gap-0 !p-6 sm:!p-8"
          >
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <FiBookOpen className="h-4 w-4" />
                Repository &amp; Instructions
              </div>
              <div className="space-y-2">
                <h2 className="fc-title text-3xl tracking-tight sm:text-4xl md:text-5xl">
                  How to Access and{" "}
                  <span className="bg-gradient-to-r from-primary to-violet-400/75 bg-clip-text text-transparent">
                    Contribute
                  </span>
                </h2>
                <p className="fc-lede max-w-3xl">
                  Follow the steps below to request access to the repository and
                  make changes for future development.
                </p>
              </div>
            </div>
          </GlowCard>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <section className="space-y-6 sm:space-y-8">
            <GlowCard
              customSize
              glowColor="purple"
              className="w-full !gap-0 !p-6 sm:!p-8"
            >
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/30">
                    <FiGithub className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="fc-title-accent text-xl sm:text-2xl">
                    Repository Link
                  </h2>
                </div>
                <p className="fc-body mb-5">
                  Access the official repository for the FinTech Calgary website
                  project:
                </p>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex max-w-full items-center gap-2 rounded-xl border border-primary/35 bg-gradient-to-r from-primary/15 to-purple-500/15 px-4 py-3 text-sm font-medium text-primary backdrop-blur-md transition-all duration-300 hover:border-primary/55 hover:from-primary/25 hover:to-purple-500/25 hover:shadow-lg hover:shadow-primary/15"
                >
                  <span className="truncate">{REPO_URL}</span>
                  <FiArrowUpRight className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </GlowCard>

            <GlowCard
              customSize
              glowColor="purple"
              className="w-full !gap-0 !p-6 sm:!p-8"
            >
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/20 to-violet-500/30">
                    <FiCheckCircle className="h-5 w-5 text-violet-300" />
                  </div>
                  <h2 className="fc-title-accent text-xl sm:text-2xl">
                    Getting Started
                  </h2>
                </div>
                <p className="fc-body-lg mb-4">
                  Before contributing to the project, ensure you have:
                </p>
                <ul className="space-y-3">
                  {prerequisites.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary shadow-sm shadow-primary/40" />
                      <span className="fc-body">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="fc-muted mt-5 border-t border-white/10 pt-4">
                  For detailed setup instructions, please contact the team lead.
                </p>
              </div>
            </GlowCard>
          </section>

          <section>
            <GlowCard
              customSize
              glowColor="purple"
              className="h-full w-full !gap-0 !p-6 sm:!p-8"
            >
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/30">
                    <FiTerminal className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="fc-title-accent text-xl sm:text-2xl">
                    Instructions
                  </h2>
                </div>
                <ol className="space-y-5">
                  {instructions.map((step, index) => (
                    <li key={step.text} className="flex gap-3 sm:gap-4">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="fc-body-lg">{step.text}</p>
                        {step.code ? <CodeBlock>{step.code}</CodeBlock> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </GlowCard>
          </section>
        </div>
      </main>
    </div>
  );
}
