import { Handlers } from "$fresh/server.ts";
import {
  getCheckout,
  isPremiumTokenValid,
  issuePremiumToken,
} from "../../../utils/payments/premiumStore.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const checkoutId = url.searchParams.get("checkout_id");
    const token = url.searchParams.get("token");

    // Check by premium token (already claimed)
    if (token) {
      const valid = isPremiumTokenValid(token);
      return new Response(
        JSON.stringify({ hasPaid: valid, token: valid ? token : undefined }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Check by checkout ID (polling after payment)
    if (checkoutId) {
      const checkout = getCheckout(checkoutId);

      if (!checkout) {
        return new Response(
          JSON.stringify({ status: "not_found" }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      if (checkout.status === "paid") {
        const premiumToken = issuePremiumToken();
        return new Response(
          JSON.stringify({
            status: "paid",
            premiumToken,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ status: checkout.status }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Missing checkout_id or token" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  },
};
