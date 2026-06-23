// ===================================================================
// PREMIUM STORE — Simple checkout persistence for ButtonSpa
// Mirrors TalkType's paymentStore.js — in-memory with Deno KV-ready interface
// ===================================================================

const CHECKOUT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours to complete payment

interface CheckoutRecord {
  id: string;
  status: "pending" | "paid" | "expired";
  providerOrderId: string;
  checkoutUrl: string;
  createdAt: string;
  paidAt?: string;
}

// In-memory store (replace with Deno KV for production)
const checkouts = new Map<string, CheckoutRecord>();

// Cleanup expired checkouts periodically
setInterval(() => {
  const now = Date.now();
  for (const [_id, record] of checkouts) {
    if (
      record.status === "pending" &&
      now - new Date(record.createdAt).getTime() > CHECKOUT_TTL_MS
    ) {
      record.status = "expired";
    }
  }
}, 60000);

export function saveCheckout(record: CheckoutRecord): void {
  checkouts.set(record.id, record);
}

export function getCheckout(id: string): CheckoutRecord | undefined {
  return checkouts.get(id);
}

export function markCheckoutPaid(
  providerOrderId: string,
): CheckoutRecord | undefined {
  for (const record of checkouts.values()) {
    if (
      record.providerOrderId === providerOrderId &&
      record.status === "pending"
    ) {
      record.status = "paid";
      record.paidAt = new Date().toISOString();
      return record;
    }
  }
  return undefined;
}

export function generatePremiumToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Premium tokens that have been issued (paid checkouts)
const premiumTokens = new Set<string>();

export function issuePremiumToken(): string {
  const token = generatePremiumToken();
  premiumTokens.add(token);
  return token;
}

export function isPremiumTokenValid(token: string): boolean {
  return premiumTokens.has(token);
}
