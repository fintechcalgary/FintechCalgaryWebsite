import { apiResponse, validators, withErrorHandler } from "@/lib/api-helpers";
import logger from "@/lib/logger";
import { MEMBERSHIP } from "@/lib/constants";

/**
 * Requests a one-time Converge hosted-payments session token for the
 * premium membership fee. The token is opened client-side with the
 * PayWithConverge Lightbox modal, so card data never touches this server.
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

  // Amount and transaction type are fixed server-side so the client
  // can never alter the price. Name/email only prefill the hosted form.
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
  });

  const convergeResponse = await fetch(
    `${baseUrl}/hosted-payments/transaction_token`,
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
        ? "Payment session rejected by Converge (403). Verify this server's IP and the site referrer are whitelisted with Elavon."
        : `Unable to initialize the payment session${
            responseText ? `: ${responseText.slice(0, 200)}` : ""
          }`,
      502,
    );
  }

  return apiResponse.success({
    token: responseText,
    invoiceNumber,
    scriptUrl: `${baseUrl}/hosted-payments/PayWithConverge.js`,
  });
});
