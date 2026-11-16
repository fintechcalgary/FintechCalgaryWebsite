import { apiResponse, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import { MEMBERSHIP } from "@/lib/constants";

const RETURN_PATH = "/converge-test/return";

/**
 * Public origin of this request, so the Converge return URL matches the
 * host the shopper is actually on (including local dev and proxies).
 */
function requestOrigin(req) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = (forwardedHost || req.headers.get("host") || "")
    .split(",")[0]
    .trim();
  if (!host) {
    return req.nextUrl.origin;
  }

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const proto =
    (forwardedProto || "").split(",")[0].trim() ||
    req.nextUrl.protocol.replace(":", "") ||
    "https";

  return `${proto}://${host}`;
}

/**
 * Requests a one-time Converge session token for the premium membership fee.
 * The browser posts the token to Elavon's hosted payment page, so card data
 * never touches this server. Converge redirects back to RETURN_PATH.
 */
export const POST = withErrorHandler(async (req) => {
  const { firstName, lastName, email } = await req.json();

  const validationError = validators.validateRequiredAndEmail(
    { firstName, lastName, email },
    ["firstName", "lastName", "email"],
  );
  if (validationError) {
    return apiResponse.badRequest(validationError);
  }

  const baseUrl = process.env.CONVERGE_BASE_URL;
  const merchantId = process.env.CONVERGE_MERCHANT_ID;
  const userId = process.env.CONVERGE_USER_ID;
  const pin = process.env.CONVERGE_PIN;

  if (!baseUrl || !merchantId || !userId || !pin) {
    return apiResponse.error(
      "Payment processing is not configured. Missing Converge credentials.",
      500,
    );
  }

  const invoiceNumber = `FTC-${Date.now()}`;
  const convergeBase = baseUrl.replace(/\/+$/, "");
  const returnUrl = `${requestOrigin(req)}${RETURN_PATH}`;

  // Elavon rejects receipt and error URLs longer than 255 characters.
  if (returnUrl.length > 255) {
    return apiResponse.error(
      "Payment return URL is too long for Converge.",
      500,
    );
  }

  // Amount and transaction type are fixed server-side so the client
  // can never alter the price. Name/email only prefill the hosted form.
  // REDG skips Converge's receipt and sends the shopper back here.
  // Do not set ssl_result_format=ASCII; Converge ignores the receipt URL then.
  const params = new URLSearchParams({
    ssl_merchant_id: merchantId,
    ssl_user_id: userId,
    ssl_pin: pin,
    ssl_transaction_type: "ccsale",
    ssl_amount: MEMBERSHIP.PREMIUM_PRICE,
    ssl_invoice_number: invoiceNumber,
    ssl_first_name: firstName,
    ssl_last_name: lastName,
    ssl_email: email,
    ssl_receipt_link_method: "REDG",
    ssl_receipt_link_url: returnUrl,
    ssl_error_url: returnUrl,
  });

  const convergeResponse = await fetch(
    `${convergeBase}/hosted-payments/transaction_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    },
  );

  const responseText = (await convergeResponse.text()).trim();

  // A valid session token is a short single-line string; anything else
  // (an HTML error page, "Error: ..." text) means the request was rejected.
  const looksLikeToken =
    responseText.length > 0 &&
    responseText.length <= 100 &&
    !/[\s<>]/.test(responseText);

  if (!convergeResponse.ok || !looksLikeToken) {
    logger.log(
      new Error(
        `Converge session token request failed (HTTP ${convergeResponse.status})`,
      ),
      {
        type: "payment_error",
        endpoint: "/api/converge/session-token",
        convergeStatus: convergeResponse.status,
        convergeBody: responseText.slice(0, 500),
      },
    );
    return apiResponse.error(
      convergeResponse.status === 403
        ? "Payment session rejected by Converge (403). Verify this server's IP is whitelisted with Elavon."
        : `Unable to initialize the payment session${
            responseText ? `: ${responseText.slice(0, 200)}` : ""
          }`,
      502,
    );
  }

  return apiResponse.success({
    token: responseText,
    invoiceNumber,
    paymentPageUrl: `${convergeBase}/hosted-payments`,
  });
});
