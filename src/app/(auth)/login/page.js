"use client";
import { ALERT_ERROR_CLASS, BTN_GRADIENT_PRIMARY_CLASS, GLASS_CARD_CLASS } from "@/lib/uiTokens";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import BackLink from "@/components/ui/BackLink";
import { InlineSpinner } from "@/components/ui/Spinner";
import { PageTitle } from "@/components/ui/SectionHeading";
import { getPostLoginDestination } from "@/lib/permissions";

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
    const destination = getPostLoginDestination(session?.user?.role);
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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <div className={`${GLASS_CARD_CLASS} w-full max-w-md space-y-6 p-6 shadow-xl sm:space-y-8 sm:p-8`.trim()}>
        <div className="flex justify-start">
          <BackLink href="/" label="Back to Home" spacing="tight" />
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
          <PageTitle sizeClass="mb-2 text-center text-2xl sm:text-3xl">
            Welcome Back
          </PageTitle>
          <p className="text-center">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          {error && (
            <div className={ALERT_ERROR_CLASS}>{error}</div>
          )}

          <div className="input-group">
            <label htmlFor="username" className="text-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="text-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${BTN_GRADIENT_PRIMARY_CLASS} w-full !px-4 !py-2.5 text-sm sm:!py-3 sm:text-base disabled:cursor-not-allowed disabled:hover:translate-y-0 ${isLoading ? "opacity-70" : ""}`.trim()}
          >
            {isLoading ? (
              <>
                <InlineSpinner className="-ml-1 mr-3 text-white" />
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
