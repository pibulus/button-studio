import { Handlers } from "$fresh/server.ts";

// ===================================================================
// RATE LIMITING - Simple in-memory store per session
// ===================================================================
const FREE_DAILY_LIMIT = 20;
const PREMIUM_DAILY_LIMIT = 500;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitInfo(
  sessionId: string,
): { count: number; resetAt: number } {
  const now = Date.now();
  const entry = rateStore.get(sessionId);

  // Reset if it's a new day
  if (!entry || now > entry.resetAt) {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const resetAt = midnight.getTime();

    const fresh = { count: 0, resetAt };
    rateStore.set(sessionId, fresh);
    return fresh;
  }

  return entry;
}

function incrementRateLimit(sessionId: string): number {
  const info = getRateLimitInfo(sessionId);
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

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ===================================================================
// TRANSCRIBE ENDPOINT
// ===================================================================
export const handler: Handlers = {
  OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders() });
  },
  async POST(req) {
    try {
      const body = await req.json();
      const {
        audioBase64,
        mimeType = "audio/webm",
        model,
        prompt,
        sessionId = "anonymous",
        hasPaid = false,
      } = body;

      if (!audioBase64) {
        return new Response(
          JSON.stringify({ error: "No audio data provided" }),
          { status: 400, headers: corsHeaders() },
        );
      }

      // Rate limiting
      const limit = hasPaid ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
      const usage = getRateLimitInfo(sessionId);
      const count = incrementRateLimit(sessionId);

      if (count > limit) {
        return new Response(
          JSON.stringify({
            error: "Daily limit reached",
            limit,
            count,
            upgrade: !hasPaid,
            resetAt: usage.resetAt,
          }),
          { status: 429, headers: corsHeaders() },
        );
      }

      // Select model
      const allowedModels = hasPaid ? PREMIUM_MODELS : FREE_MODELS;
      const selectedModel = model && allowedModels.includes(model)
        ? model
        : hasPaid
        ? DEFAULT_PREMIUM_MODEL
        : DEFAULT_FREE_MODEL;

      // Build transcription prompt
      const promptText = prompt ||
        "Transcribe this audio file accurately and completely, removing any redundant filler words. Return only the cleaned-up transcription.";

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
      };

      const response = await fetch(
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
        },
      );

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
      const text = result.choices?.[0]?.message?.content?.trim();

      if (!text) {
        return new Response(
          JSON.stringify({ error: "Empty transcription result" }),
          { status: 422, headers: corsHeaders() },
        );
      }

      return new Response(
        JSON.stringify({
          text,
          model: selectedModel,
          usage: {
            count,
            limit,
            remaining: Math.max(0, limit - count),
            hasPaid,
          },
        }),
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
