"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as THREE from "three";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function Login() {
  const { status } = useSession(); // Check session status
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    document.title = "Login | FinTech Calgary";
  }, []);

  // Redirect to /dashboard if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (!vantaEffect) {
      import("vanta/dist/vanta.fog.min")
        .then((FOG) => {
          setVantaEffect(
            FOG.default({
              el: vantaRef.current,
              THREE: THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: 1.0,
              scaleMobile: 1.0,
              highlightColor: 0xb88cff, // Light purple for highlights
              midtoneColor: 0x4a148c, // Dark purple midtones
              lowlightColor: 0x1a1a1a, // Black shadows
              baseColor: 0x120724, // Deep purple base color
              speed: 1.2, // Speed of the fog animation
            })
          );
        })
        .catch((error) => {
          console.error("Vanta.js Error:", error);
        });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={vantaRef}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-gray-700/50 shadow-xl">
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
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
          <p className="text-sm sm:text-base text-gray-400 text-center">
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
            className={`w-full bg-primary hover:bg-primary/80 text-white font-medium py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 flex items-center justify-center
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
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
