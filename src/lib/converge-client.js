/**
 * Client-side helper for Elavon Converge's hosted payment page.
 * Posts a one-time session token to Elavon so card data never touches this site.
 */

const ALLOWED_HOSTS = new Set([
  "api.convergepay.com",
  "api.demo.convergepay.com",
]);

/**
 * True when `url` is Elavon's hosted payment page on a known Converge host.
 */
export function isConvergePaymentPage(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    return (
      parsed.protocol === "https:" &&
      ALLOWED_HOSTS.has(parsed.hostname) &&
      path === "/hosted-payments" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.search &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

/**
 * Sends the browser to Converge's hosted payment page.
 * A form POST URL-encodes the token; a raw "+" or "&" in the token returns 401.
 *
 * @param {Object} session - `{ token, paymentPageUrl }` from /api/converge/session-token
 */
export function redirectToConvergeHostedPage({ token, paymentPageUrl }) {
  if (!token || !isConvergePaymentPage(paymentPageUrl)) {
    throw new Error("Payment session response was invalid.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentPageUrl;
  form.enctype = "application/x-www-form-urlencoded";
  form.acceptCharset = "UTF-8";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "ssl_txn_auth_token";
  input.value = token;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
}
