import { Handlers } from "$fresh/server.ts";
import {
  createSquareCheckout,
  isSquareCheckoutConfigured,
} from "../../utils/payments/squareClient.ts";
import { saveCheckout } from "../../utils/payments/premiumStore.ts";

// Exact-match allowlist — prevents the Origin header from being used to
// redirect post-payment traffic to an attacker-controlled destination
const ALLOWED_REDIRECT_ORIGINS = [
  "https://buttonspa.app",
  "https://www.buttonspa.app",
  "http://localhost:8000",
];

export const handler: Handlers = {
  async POST(req) {
    if (!isSquareCheckoutConfigured()) {
      return new Response(
        JSON.stringify({
          error: "Payments coming soon — Square setup in progress.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const checkoutId = crypto.randomUUID();
      const requestOrigin = req.headers.get("origin") || "";
      const origin = ALLOWED_REDIRECT_ORIGINS.includes(requestOrigin)
        ? requestOrigin
        : "https://buttonspa.app";
      const redirectUrl = `${origin}/premium/success?checkout_id=${
        encodeURIComponent(checkoutId)
      }`;

      const squareCheckout = await createSquareCheckout({
        checkoutId,
        redirectUrl,
      });

      await saveCheckout({
        id: checkoutId,
        status: "pending",
        providerOrderId: squareCheckout.providerOrderId,
        checkoutUrl: squareCheckout.checkoutUrl,
        createdAt: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          checkoutId,
          checkoutUrl: squareCheckout.checkoutUrl,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("[Checkout] Failed:", error);
      return new Response(
        JSON.stringify({ error: "Checkout needs one more try." }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }
  },
};
