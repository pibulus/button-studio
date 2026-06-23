import { Handlers } from "$fresh/server.ts";
import {
  extractSquarePayment,
  isSquareWebhookConfigured,
  verifySquareWebhookSignature,
} from "../../../utils/payments/squareClient.ts";
import { markCheckoutPaid } from "../../../utils/payments/premiumStore.ts";

export const handler: Handlers = {
  async POST(req) {
    if (!isSquareWebhookConfigured()) {
      return new Response("Webhook not configured", { status: 503 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-square-hmacsha256-signature") || "";

    // Verify webhook authenticity
    const isValid = await verifySquareWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[Square Webhook] Invalid signature");
      return new Response("Invalid signature", { status: 401 });
    }

    try {
      const event = JSON.parse(rawBody);

      // Only process payment updates
      if (event?.type !== "payment.updated") {
        return new Response("OK", { status: 200 });
      }

      const payment = extractSquarePayment(event);
      if (!payment || payment.status !== "COMPLETED") {
        return new Response("OK", { status: 200 });
      }

      const checkout = markCheckoutPaid(payment.order_id);
      if (checkout) {
        console.log(`[Square Webhook] ✅ Payment confirmed: ${checkout.id}`);
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[Square Webhook] Error:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  },
};
