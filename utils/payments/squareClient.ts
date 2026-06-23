// ===================================================================
// SQUARE PAYMENT CLIENT — ButtonSpa Premium ($9/year)
// Mirrors TalkType's squareProvider.js — TypeScript + Deno edition
// ===================================================================

const DEFAULT_SQUARE_VERSION = "2026-01-22";

export interface SquareConfig {
  provider: string;
  accessToken: string;
  locationId: string;
  apiVersion: string;
  webhookSignatureKey: string;
  environment: "sandbox" | "production";
}

export interface SquareCheckoutResult {
  provider: string;
  paymentLinkId: string;
  providerOrderId: string;
  checkoutUrl: string;
  shortUrl: string;
  amount: number;
  currency: string;
}

export interface SquarePayment {
  id: string;
  order_id: string;
  status: string;
}

function getSquareBaseUrl(): string {
  return Deno.env.get("SQUARE_ENVIRONMENT") === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

export function getSquareConfig(): SquareConfig {
  return {
    provider: "square",
    accessToken: Deno.env.get("SQUARE_ACCESS_TOKEN")?.trim() || "",
    locationId: Deno.env.get("SQUARE_LOCATION_ID")?.trim() || "",
    apiVersion: Deno.env.get("SQUARE_API_VERSION")?.trim() ||
      DEFAULT_SQUARE_VERSION,
    webhookSignatureKey: Deno.env.get("SQUARE_WEBHOOK_SIGNATURE_KEY")?.trim() ||
      "",
    environment: Deno.env.get("SQUARE_ENVIRONMENT") === "sandbox"
      ? "sandbox"
      : "production",
  };
}

export function isSquareCheckoutConfigured(): boolean {
  const config = getSquareConfig();
  return Boolean(config.accessToken && config.locationId);
}

export function isSquareWebhookConfigured(): boolean {
  return Boolean(getSquareConfig().webhookSignatureKey);
}

export interface CreateCheckoutParams {
  checkoutId: string;
  redirectUrl: string;
}

export async function createSquareCheckout(
  { checkoutId, redirectUrl }: CreateCheckoutParams,
): Promise<SquareCheckoutResult> {
  const config = getSquareConfig();
  if (!isSquareCheckoutConfigured()) {
    throw new Error("Square checkout is not configured");
  }

  const response = await fetch(
    `${getSquareBaseUrl()}/v2/online-checkout/payment-links`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Square-Version": config.apiVersion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: checkoutId,
        description: `ButtonSpa Premium ${checkoutId}`,
        quick_pay: {
          name: "ButtonSpa Premium",
          price_money: {
            amount: 900, // $9.00
            currency: "AUD",
          },
          location_id: config.locationId,
        },
        checkout_options: {
          redirect_url: redirectUrl,
        },
        payment_note: `ButtonSpa premium checkout ${checkoutId}`,
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.payment_link?.url) {
    console.error("[Square] Failed to create checkout:", payload);
    throw new Error("Could not start Square checkout");
  }

  return {
    provider: "square",
    paymentLinkId: payload.payment_link.id,
    providerOrderId: payload.payment_link.order_id,
    checkoutUrl: payload.payment_link.long_url || payload.payment_link.url,
    shortUrl: payload.payment_link.url,
    amount: 900,
    currency: "AUD",
  };
}

export async function verifySquareWebhookSignature(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const config = getSquareConfig();
  const notificationUrl = Deno.env.get("SQUARE_WEBHOOK_NOTIFICATION_URL") || "";
  const signatureKey = config.webhookSignatureKey;

  if (!signatureKey || !signature || !notificationUrl) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signatureKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const data = new TextEncoder().encode(
    `${notificationUrl}${rawBody}`,
  );
  const expectedBuf = await crypto.subtle.sign("HMAC", key, data);
  const expected = btoa(String.fromCharCode(...new Uint8Array(expectedBuf)));

  const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
  const expBytes = Uint8Array.from(atob(expected), (c) => c.charCodeAt(0));

  if (sigBytes.length !== expBytes.length) return false;

  let result = 0;
  for (let i = 0; i < sigBytes.length; i++) {
    result |= sigBytes[i] ^ expBytes[i];
  }
  return result === 0;
}

export function extractSquarePayment(
  event: Record<string, unknown>,
): SquarePayment | null {
  const obj = (event as Record<string, unknown>)?.data as
    | Record<string, unknown>
    | undefined;
  const payment = obj?.object as Record<string, unknown> | undefined;
  const pay = payment?.payment as Record<string, string> | undefined;
  if (!pay?.id || !pay?.order_id) {
    return null;
  }
  return {
    id: pay.id,
    order_id: pay.order_id,
    status: pay.status || "UNKNOWN",
  };
}
