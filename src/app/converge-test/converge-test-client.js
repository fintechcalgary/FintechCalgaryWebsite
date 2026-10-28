"use client";

import { useState } from "react";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { API_ENDPOINTS, MEMBERSHIP } from "@/lib/constants";
import { openConvergeLightbox } from "@/lib/converge-client";

const RESULT_FIELDS = [
  ["ssl_result_message", "Result"],
  ["ssl_txn_id", "Transaction ID"],
  ["ssl_approval_code", "Approval code"],
  ["ssl_amount", "Amount"],
  ["ssl_card_number", "Card"],
];

function isConvergeScript(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "api.convergepay.com" ||
        parsed.hostname === "api.demo.convergepay.com") &&
      parsed.pathname === "/hosted-payments/PayWithConverge.js"
    );
  } catch {
    return false;
  }
}

export default function ConvergeTestClient() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [outcome, setOutcome] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setOutcome(null);

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
      if (!isConvergeScript(data.scriptUrl) || !data.token) {
        throw new Error("Payment session response was invalid.");
      }

      const payment = await openConvergeLightbox(data);

      if (payment.status === "cancelled") {
        setOutcome({ status: "cancelled" });
        return;
      }

      setOutcome({
        status: payment.status,
        invoiceNumber: data.invoiceNumber || null,
        response: payment.response || {},
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approved = outcome?.status === "approved";

  return (
    <PublicPageShell title="Payment test | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto max-w-xl px-6 pb-24 pt-36 sm:px-8">
          <div className="mb-8 text-center">
            <PageTitle sizeClass="text-4xl md:text-5xl font-extrabold mb-4">
              Payment test
            </PageTitle>
            <p className="text-gray-300">
              {`Opens Converge's payment modal for a $${MEMBERSHIP.PREMIUM_PRICE} charge. This does not create a membership.`}
            </p>
          </div>

          {outcome?.status === "cancelled" && (
            <p className="mb-6 rounded-xl border border-gray-600 bg-gray-900/60 p-5 text-sm text-gray-300">
              Payment cancelled. You can try again.
            </p>
          )}

          {outcome && outcome.status !== "cancelled" && (
            <div
              className={`mb-6 rounded-xl border p-5 ${
                approved
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              }`}
            >
              <h2 className="mb-3 text-lg font-semibold text-white">
                {approved ? "Payment approved" : "Payment was not approved"}
              </h2>
              <dl className="space-y-2 text-sm">
                {outcome.invoiceNumber && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-400">Invoice</dt>
                    <dd className="text-right text-white">
                      {outcome.invoiceNumber}
                    </dd>
                  </div>
                )}
                {RESULT_FIELDS.map(([key, label]) => {
                  const value = outcome.response?.[key];
                  if (!value) return null;
                  return (
                    <div key={key} className="flex justify-between gap-4">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="text-right text-white">{value}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          <form onSubmit={handleSubmit} className="fc-card space-y-4 p-8">
            {[
              ["firstName", "First name", "text"],
              ["lastName", "Last name", "text"],
              ["email", "Email", "email"],
            ].map(([name, label, type]) => (
              <div key={name}>
                <label className="mb-1 block text-sm font-medium text-gray-300">
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
                ? "Opening payment..."
                : `Pay $${MEMBERSHIP.PREMIUM_PRICE}`}
            </button>
          </form>
        </div>
      </div>
    </PublicPageShell>
  );
}
