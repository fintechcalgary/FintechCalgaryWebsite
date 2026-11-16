import Link from "next/link";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Payment result",
  robots: { index: false, follow: false },
};

const RESULT_FIELDS = [
  ["ssl_result_message", "Result"],
  ["ssl_txn_id", "Transaction ID"],
  ["ssl_approval_code", "Approval code"],
  ["ssl_amount", "Amount"],
  ["ssl_card_number", "Card"],
  ["ssl_invoice_number", "Invoice"],
];

const ERROR_FIELDS = [
  ["errorName", "Error"],
  ["errorMessage", "Message"],
  ["errorCode", "Code"],
];

function paramValue(params, key) {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] || "";
  return typeof value === "string" ? value : "";
}

function ResultRows({ fields, get }) {
  const rows = fields
    .map(([key, label]) => [key, label, get(key)])
    .filter(([, , value]) => value);

  if (rows.length === 0) return null;

  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([key, label, value]) => (
        <div key={key} className="flex justify-between gap-4">
          <dt className="text-gray-400">{label}</dt>
          <dd className="text-right text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ConvergeReturnPage({ searchParams }) {
  const params = await searchParams;
  const get = (key) => paramValue(params, key);

  const sslResult = get("ssl_result");
  const hasResult = sslResult !== "";
  const approved = sslResult === "0";
  const hasError =
    !hasResult &&
    Boolean(get("errorCode") || get("errorName") || get("errorMessage"));

  let heading = "No payment result";
  let cardClass = "border-gray-600 bg-gray-900/60";
  if (approved) {
    heading = "Payment approved";
    cardClass = "border-emerald-500/40 bg-emerald-500/10";
  } else if (hasResult) {
    heading = "Payment was not approved";
    cardClass = "border-amber-500/40 bg-amber-500/10";
  } else if (hasError) {
    heading = "Payment could not be completed";
    cardClass = "border-amber-500/40 bg-amber-500/10";
  }

  return (
    <PublicPageShell title="Payment result | FinTech Calgary">
      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto max-w-xl px-6 pb-24 pt-36 sm:px-8">
          <div className="mb-8 text-center">
            <PageTitle sizeClass="text-4xl md:text-5xl font-extrabold mb-4">
              Payment result
            </PageTitle>
            <p className="text-gray-300">
              This test charge does not create a membership.
            </p>
          </div>

          <div className={`mb-6 rounded-xl border p-5 ${cardClass}`}>
            <h2 className="mb-3 text-lg font-semibold text-white">{heading}</h2>
            {hasResult ? (
              <ResultRows fields={RESULT_FIELDS} get={get} />
            ) : hasError ? (
              <ResultRows fields={ERROR_FIELDS} get={get} />
            ) : (
              <p className="text-sm text-gray-300">
                Converge did not send a transaction result. You can start the
                payment again.
              </p>
            )}
          </div>

          <Link
            href="/converge-test"
            className="inline-flex text-sm font-medium text-primary hover:text-primary/80"
          >
            Back to payment test
          </Link>
        </div>
      </div>
    </PublicPageShell>
  );
}
