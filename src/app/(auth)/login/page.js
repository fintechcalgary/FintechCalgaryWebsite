"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { STAFF_ROLES } from "@/lib/permissions";

function destinationForRole(role) {
  if (role === "associate") return "/partner-dashboard";
  if (STAFF_ROLES.includes(role)) return "/dashboard";
  return null;
}

export default function Login() {
  const { data: session, status } = useSession();
  const redirectedRef = useRef(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("error")
      ? "Invalid username or password"
      : "";
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Login | FinTech Calgary";
  }, []);

  // Already signed in — one replace to the right dashboard (no client polling).
  useEffect(() => {
    if (status !== "authenticated" || redirectedRef.current) return;
    const destination = destinationForRole(session?.user?.role);
    if (!destination) return;
    redirectedRef.current = true;
    window.location.replace(destination);
  }, [status, session?.user?.role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Default redirect: true — NextAuth sets the cookie and navigates in one
      // response, which avoids the Safari soft-nav / getSession race.
      await signIn("credentials", {
        username,
        password,
        callbackUrl: "/auth/continue",
      });
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-gray-700/50 shadow-xl">
        <div className="flex justify-start">
          <Link
            href="/"
            className="fc-muted text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="flex justify-center items-center">
          <Image
            alt="FinTech Calgary Logo"
            src="/logo.svg"
            width={80}
            height={80}
            className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px]"
            priority
          />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
            Welcome Back
          </h2>
          <p className="fc-body text-center">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="text-sm sm:text-base">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="input-group">
            <label className="text-sm sm:text-base">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`fc-btn-gradient-primary w-full !px-4 !py-2.5 text-sm sm:!py-3 sm:text-base disabled:cursor-not-allowed disabled:hover:translate-y-0
              ${isLoading ? "opacity-70" : ""}`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
