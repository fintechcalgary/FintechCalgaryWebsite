"use client";
import Link from "next/link";

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Registration Successful!
        </h1>
        <p className="text-gray-400 mb-4">
          Thank you for registering. You will receive a confirmation email
          shortly.
        </p>
        <p className="text-gray-400 mb-8">
          If you don&apos;t see the email, please check your spam or junk
          folder.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary/80 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
