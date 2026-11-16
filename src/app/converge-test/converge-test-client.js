"use client";
import { GLASS_CARD_CLASS } from "@/lib/uiTokens";

import { useState } from "react";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { API_ENDPOINTS, MEMBERSHIP } from "@/lib/constants";
import {
  isConvergePaymentPage,
  redirectToConvergeHostedPage,
} from "@/lib/converge-client";

export default function ConvergeTestClient() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.CONVERGE_SESSION_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Unable to start the payment. Please try again.",
        );
      }
      if (!data.token || !isConvergePaymentPage(data.paymentPageUrl)) {
        throw new Error("Payment session response was invalid.");
      }

      redirectToConvergeHostedPage({
        token: data.token,
        paymentPageUrl: data.paymentPageUrl,
      });
    } catch (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageShell title="Payment test | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto max-w-xl px-6 pb-24 pt-36 sm:px-8">
          <div className="mb-8 text-center">
            <PageTitle sizeClass="text-4xl md:text-5xl font-extrabold mb-4">
              Payment test
            </PageTitle>
            <p className="text-gray-300">
              {`Sends you to Elavon's hosted payment page for a $${MEMBERSHIP.PREMIUM_PRICE} charge. This does not create a membership.`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`${GLASS_CARD_CLASS} space-y-4 p-8`.trim()}>
            {[
              ["firstName", "First name", "text"],
              ["lastName", "Last name", "text"],
              ["email", "Email", "email"],
            ].map(([name, label, type]) => (
              <div key={name}>
                <label className="text-label">
                  {label} <span className="text-red-400">*</span>
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={(event) =>
                    setFormData({ ...formData, [name]: event.target.value })
                  }
                  required
                  autoComplete={name === "email" ? "email" : name}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2 text-white placeholder-gray-400 focus:border-primary/50 focus:outline-none"
                />
              </div>
            ))}

            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-2.5 font-medium text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Redirecting to payment..."
                : `Pay $${MEMBERSHIP.PREMIUM_PRICE}`}
            </button>
          </form>
        </div>
      </div>
    </PublicPageShell>
  );
}
