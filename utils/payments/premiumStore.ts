// ===================================================================
// PREMIUM STORE — Deno KV-backed checkout + entitlement persistence
// Mirrors TalkType's paymentStore.js — durable across deploys/cold-starts
// ===================================================================

const CHECKOUT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours to complete payment
const CHECKOUT_KV_EXPIRE_MS = 24 * 60 * 60 * 1000; // 24 hours KV retention
const PREMIUM_TOKEN_EXPIRE_MS = 365 * 24 * 60 * 60 * 1000; // $9/year

interface CheckoutRecord {
  id: string;
  status: "pending" | "paid" | "expired";
  providerOrderId: string;
  checkoutUrl: string;
  createdAt: string;
  paidAt?: string;
}

// Lazy singleton — Deno KV connection opened on first use
let kv: Deno.Kv | null = null;

async function getKv(): Promise<Deno.Kv> {
  if (!kv) {
    kv = await Deno.openKv();
  }
  return kv;
}

export async function saveCheckout(record: CheckoutRecord): Promise<void> {
  const db = await getKv();
  await db.set(["checkout", record.id], record, {
    expireIn: CHECKOUT_KV_EXPIRE_MS,
  });
}

export async function getCheckout(
  id: string,
): Promise<CheckoutRecord | undefined> {
  const db = await getKv();
  const entry = await db.get<CheckoutRecord>(["checkout", id]);
  const record = entry.value ?? undefined;

  if (
    record &&
    record.status === "pending" &&
    Date.now() - new Date(record.createdAt).getTime() > CHECKOUT_TTL_MS
  ) {
    record.status = "expired";
    await db.set(["checkout", id], record, {
      expireIn: CHECKOUT_KV_EXPIRE_MS,
    });
  }

  return record;
}

export async function markCheckoutPaid(
  providerOrderId: string,
): Promise<CheckoutRecord | undefined> {
  const db = await getKv();
  const entries = db.list<CheckoutRecord>({ prefix: ["checkout"] });

  for await (const entry of entries) {
    const record = entry.value;
    if (
      record.providerOrderId === providerOrderId &&
      record.status === "pending"
    ) {
      record.status = "paid";
      record.paidAt = new Date().toISOString();
      await db.set(entry.key, record, { expireIn: CHECKOUT_KV_EXPIRE_MS });
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

export async function issuePremiumToken(): Promise<string> {
  const db = await getKv();
  const token = generatePremiumToken();
  await db.set(["premium_token", token], true, {
    expireIn: PREMIUM_TOKEN_EXPIRE_MS,
  });
  return token;
}

export async function isPremiumTokenValid(token: string): Promise<boolean> {
  const db = await getKv();
  const entry = await db.get(["premium_token", token]);
  return entry.value === true;
}
