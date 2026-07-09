import { Handlers } from "$fresh/server.ts";
import { isPremiumTokenValid } from "../../utils/payments/premiumStore.ts";

// ===================================================================
// RATE LIMITING - Simple in-memory store keyed by client IP
// Per-isolate only (each Deno Deploy instance has its own Map) — that's
// fine for abuse control. Premium entitlement (the money part) lives in
// Deno KV via premiumStore.ts, not here.
// ===================================================================
const FREE_DAILY_LIMIT = 20;
const PREMIUM_DAILY_LIMIT = 500;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitInfo(
  clientKey: string,
): { count: number; resetAt: number } {
  const now = Date.now();
  const entry = rateStore.get(clientKey);

  // Reset if it's a new day
  if (!entry || now > entry.resetAt) {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const resetAt = midnight.getTime();

    const fresh = { count: 0, resetAt };
    rateStore.set(clientKey, fresh);
    return fresh;
  }

  return entry;
}

function incrementRateLimit(clientKey: string): number {
  const info = getRateLimitInfo(clientKey);
  info.count++;
  return info.count;
}

// ===================================================================
// MODEL TIERS
// ===================================================================
const FREE_MODELS = [
  "google/gemini-2.5-flash-lite",
  "mistralai/voxtral-small-24b-2507",
];

const PREMIUM_MODELS = [
  "google/gemini-3.5-flash",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-3.1-pro-preview",
  "mistralai/voxtral-small-24b-2507",
];

const DEFAULT_FREE_MODEL = "google/gemini-2.5-flash-lite";
const DEFAULT_PREMIUM_MODEL = "google/gemini-3.5-flash";

const UPSTREAM_TIMEOUT_MS = 60_000;

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ===================================================================
// STRUCTURED OUTPUT PARSING
// Defensive-only: a model that ignores the JSON instruction (or the
// response_format hint) must never 500 the request — callers fall back
// to plain text instead. Handles a bare JSON array as well as a model
// that wraps it in an object (e.g. {"items": [...]} / {"sections": [...]})
// since json_object mode pushes some models toward an object root.
// ===================================================================
interface Section {
  heading: string;
  body: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.every((item) => typeof item === "string");
}

function isSectionArray(value: unknown): value is Section[] {
  return Array.isArray(value) &&
    value.every((item) =>
      item !== null &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).heading === "string" &&
      typeof (item as Record<string, unknown>).body === "string"
    );
}

function stripJsonFences(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced ? fenced[1] : raw).trim();
}

function parseStructured<T>(
  raw: string,
  isShape: (value: unknown) => value is T,
): T | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFences(raw));
  } catch {
    return null;
  }

  if (isShape(parsed)) return parsed;

  // Some models wrap the array in an object under json_object mode —
  // unwrap the first array-valued property and re-check the shape.
  if (parsed !== null && typeof parsed === "object") {
    for (const value of Object.values(parsed as Record<string, unknown>)) {
      if (isShape(value)) return value;
    }
  }

  return null;
}

// ===================================================================
// TRANSCRIBE ENDPOINT
// ===================================================================
export const handler: Handlers = {
  OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders() });
  },
  async POST(req, ctx) {
    try {
      const body = await req.json();
      const {
        audioBase64,
        mimeType = "audio/webm",
        model,
        prompt,
        format = "text",
        sessionId = "anonymous",
        premiumToken,
        // hasPaid accepted for backward compat but ignored — tier is now
        // derived server-side from premiumToken (see isPremium below).
        hasPaid: _hasPaid,
      } = body;

      // Unknown formats fall back to plain text — never 400 on a typo'd
      // format from an older/newer client.
      const outputFormat: "text" | "list" | "sections" =
        format === "list" || format === "sections" ? format : "text";

      if (!audioBase64) {
        return new Response(
          JSON.stringify({ error: "No audio data provided" }),
          { status: 400, headers: corsHeaders() },
        );
      }

      // Trust nothing but a validated premium token for tier selection
      const isPremium = premiumToken
        ? await isPremiumTokenValid(premiumToken)
        : false;

      // Rate limiting — keyed on client IP, not a client-chosen sessionId
      const clientKey = ctx.remoteAddr?.hostname || sessionId;
      const limit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
      const usage = getRateLimitInfo(clientKey);
      const count = incrementRateLimit(clientKey);

      if (count > limit) {
        return new Response(
          JSON.stringify({
            error: "Daily limit reached",
            limit,
            count,
            upgrade: !isPremium,
            resetAt: usage.resetAt,
          }),
          { status: 429, headers: corsHeaders() },
        );
      }

      // Select model
      const allowedModels = isPremium ? PREMIUM_MODELS : FREE_MODELS;
      const selectedModel = model && allowedModels.includes(model)
        ? model
        : isPremium
        ? DEFAULT_PREMIUM_MODEL
        : DEFAULT_FREE_MODEL;

      // Build transcription prompt
      const basePromptText = prompt ||
        "Transcribe this audio file accurately and completely, removing any redundant filler words. Return only the cleaned-up transcription.";

      // Structured formats get a strict JSON instruction appended so the
      // model's own persona/prompt still drives content, but the response
      // shape is enforced. Defensive JSON.parse below means a model that
      // ignores this still degrades gracefully to plain text.
      const STRUCTURED_INSTRUCTIONS: Record<"list" | "sections", string> = {
        list:
          '\n\nRespond ONLY with valid JSON: a JSON array of short strings, one per item (no markdown fences, no prose, no extra commentary). Example: ["First item", "Second item"]',
        sections:
          '\n\nRespond ONLY with valid JSON: an array of objects shaped like {"heading": string, "body": string} (no markdown fences, no prose, no extra commentary). Example: [{"heading":"Ingredients","body":"..."},{"heading":"Steps","body":"..."}]',
      };

      const promptText = outputFormat === "text"
        ? basePromptText
        : basePromptText + STRUCTURED_INSTRUCTIONS[outputFormat];

      // Call OpenRouter
      const apiKey = Deno.env.get("OPENROUTER_API_KEY");
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Server configuration error" }),
          { status: 500, headers: corsHeaders() },
        );
      }

      const openRouterBody = {
        model: selectedModel,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "input_audio",
              input_audio: {
                data: audioBase64,
                format: mimeType.includes("wav") ? "wav" : "webm",
              },
            },
          ],
        }],
        max_tokens: 2048,
        // Nudge structured formats toward valid JSON. Not every model in
        // FREE_MODELS/PREMIUM_MODELS honors this, so parsing below stays
        // defensive regardless — this is a reliability boost, not a guarantee.
        ...(outputFormat !== "text"
          ? { response_format: { type: "json_object" as const } }
          : {}),
      };

      const timeoutController = new AbortController();
      const timeoutId = setTimeout(
        () => timeoutController.abort(),
        UPSTREAM_TIMEOUT_MS,
      );

      let response: Response;
      try {
        response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
              "HTTP-Referer": "https://buttonspa.app",
              "X-Title": "ButtonSpa",
            },
            body: JSON.stringify(openRouterBody),
            signal: timeoutController.signal,
          },
        );
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException && fetchError.name === "AbortError"
        ) {
          return new Response(
            JSON.stringify({
              error: "Transcription took too long — please try again.",
            }),
            { status: 504, headers: corsHeaders() },
          );
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter proxy error:", response.status, errorText);

        if (response.status === 402) {
          return new Response(
            JSON.stringify({
              error: "Service temporarily unavailable. Please try again later.",
            }),
            { status: 503, headers: corsHeaders() },
          );
        }

        return new Response(
          JSON.stringify({
            error: `Transcription failed: ${response.status}`,
          }),
          { status: 502, headers: corsHeaders() },
        );
      }

      const result = await response.json();
      const rawContent = result.choices?.[0]?.message?.content?.trim() || "";

      const usagePayload = {
        model: selectedModel,
        usage: {
          count,
          limit,
          remaining: Math.max(0, limit - count),
          hasPaid: isPremium,
        },
      };

      // No speech detected isn't a failure — let clients show a friendly
      // "no speech detected" message instead of a generic error state.
      // Empty content short-circuits before any JSON parsing, for every
      // format — an empty transcript is never a parse failure.
      if (!rawContent) {
        return new Response(
          JSON.stringify({ text: "", ...usagePayload }),
          { headers: corsHeaders() },
        );
      }

      if (outputFormat === "list") {
        const items = parseStructured(rawContent, isStringArray);
        if (items) {
          return new Response(
            JSON.stringify({
              text: items.join("\n"),
              items,
              ...usagePayload,
            }),
            { headers: corsHeaders() },
          );
        }
        // Model didn't honor the JSON instruction — degrade to plain text
        // rather than fail the request.
        return new Response(
          JSON.stringify({ text: rawContent, ...usagePayload }),
          { headers: corsHeaders() },
        );
      }

      if (outputFormat === "sections") {
        const sections = parseStructured(rawContent, isSectionArray);
        if (sections) {
          const flattened = sections
            .map((s) => `${s.heading}\n${s.body}`)
            .join("\n\n");
          return new Response(
            JSON.stringify({
              text: flattened,
              sections,
              ...usagePayload,
            }),
            { headers: corsHeaders() },
          );
        }
        return new Response(
          JSON.stringify({ text: rawContent, ...usagePayload }),
          { headers: corsHeaders() },
        );
      }

      // outputFormat === "text" — today's behavior, untouched.
      return new Response(
        JSON.stringify({ text: rawContent, ...usagePayload }),
        { headers: corsHeaders() },
      );
    } catch (error) {
      console.error("Transcribe proxy error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: corsHeaders() },
      );
    }
  },
};
