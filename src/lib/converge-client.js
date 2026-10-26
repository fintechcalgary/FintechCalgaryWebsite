/**
 * Client-side helper for Elavon Converge's hosted payment Lightbox.
 * Loads PayWithConverge.js on demand and opens Elavon's payment modal.
 */

let scriptPromise = null;

function loadPayWithConverge(scriptUrl) {
  if (window.PayWithConverge) {
    return Promise.resolve(window.PayWithConverge);
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        if (window.PayWithConverge) {
          resolve(window.PayWithConverge);
        } else {
          scriptPromise = null;
          reject(new Error("Payment library failed to initialize"));
        }
      };
      script.onerror = () => {
        scriptPromise = null;
        script.remove();
        reject(new Error("Failed to load the payment library"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens the Converge Lightbox payment modal for a one-time session token.
 *
 * @param {Object} session - `{ token, scriptUrl }` from /api/converge/session-token
 * @returns {Promise<{status: "approved"|"declined"|"cancelled", response: Object|null}>}
 *          Rejects if the library fails to load or the Lightbox reports an error.
 */
export async function openConvergeLightbox({ token, scriptUrl }) {
  const PayWithConverge = await loadPayWithConverge(scriptUrl);

  return new Promise((resolve, reject) => {
    PayWithConverge.open(
      { ssl_txn_auth_token: token },
      {
        onError: (error) => {
          reject(
            new Error(
              typeof error === "string" && error
                ? error
                : "Payment could not be processed. Please try again.",
            ),
          );
        },
        onCancelled: () => resolve({ status: "cancelled", response: null }),
        onDeclined: (response) => resolve({ status: "declined", response }),
        onApproval: (response) => resolve({ status: "approved", response }),
      },
    );
  });
}
