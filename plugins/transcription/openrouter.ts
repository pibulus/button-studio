import {
  Language,
  TranscriptionConfig,
  TranscriptionPlugin,
} from "../../types/plugins.ts";
import {
  AudioBlob,
  ErrorCode,
  TranscriptionResult,
  VoiceButtonError,
} from "../../types/core.ts";

// ===================================================================
// OPENROUTER TRANSCRIPTION PLUGIN - Multimodal speech-to-text
// Uses any OpenRouter-compatible multimodal model for transcription
// ===================================================================
export class OpenRouterTranscriptionPlugin implements TranscriptionPlugin {
  readonly id = "openrouter";
  readonly name = "OpenRouter AI";
  readonly version = "1.0.0";
  readonly description =
    "Transcription via OpenRouter using multimodal models like Gemini, GPT-4o, or Claude";

  private apiKey?: string;
  private model = "google/gemini-2.5-flash";
  private customPrompt?: string;
  private appName?: string;
  private appUrl?: string;

  // deno-lint-ignore require-await
  async configure(config: OpenRouterConfig): Promise<void> {
    this.apiKey = config.apiKey;
    this.model = config.model || "google/gemini-2.5-flash";
    this.customPrompt = config.customPrompt;
    this.appName = config.appName || "ButtonSpa";
    this.appUrl = config.appUrl || "";

    if (!this.apiKey) {
      throw new Error(
        "OpenRouter API key not provided. Please enter your API key in the Magic panel.",
      );
    }

    console.log("✅ OpenRouter plugin configured (model:", this.model, ")");
  }

  validateConfig(config: unknown): config is OpenRouterConfig {
    return typeof config === "object" &&
      config !== null &&
      "apiKey" in config &&
      typeof (config as Record<string, unknown>).apiKey === "string";
  }

  /**
   * Transcribe audio using OpenRouter's multimodal models.
   * Supports both Gemini-style inline_data and OpenAI-style input_audio formats.
   */
  async transcribe(audio: AudioBlob): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      throw new VoiceButtonError(
        "OpenRouter API key not configured",
        ErrorCode.INVALID_CONFIG,
      );
    }

    try {
      console.log("🎤 Starting OpenRouter transcription via", this.model);

      const audioBase64 = await this.blobToBase64(audio.data);
      const mimeType = audio.data.type || "audio/webm";

      const promptText = this.customPrompt ||
        "Transcribe this audio file accurately and completely, removing any redundant 'ums,' 'likes, 'uhs', and similar filler words. Return only the cleaned-up transcription, with no additional text.";

      // Build message content based on model type
      const userContent = this.buildAudioMessage(
        promptText,
        audioBase64,
        mimeType,
      );

      const requestBody = {
        model: this.model,
        messages: [{
          role: "user",
          content: userContent,
        }],
        max_tokens: 2048,
      };

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": this.appUrl || "https://buttonspa.app",
            "X-Title": this.appName || "ButtonSpa",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ OpenRouter API error:", response.status, errorText);

        // Handle common OpenRouter errors
        if (response.status === 401 || response.status === 402) {
          throw new VoiceButtonError(
            "Invalid or exhausted OpenRouter API key. Check your credits at openrouter.ai/credits",
            ErrorCode.INVALID_CONFIG,
            { response: errorText },
          );
        }

        throw new VoiceButtonError(
          `OpenRouter API error: ${response.status} ${response.statusText}`,
          ErrorCode.TRANSCRIPTION_API_ERROR,
          { response: errorText },
        );
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new VoiceButtonError(
          "OpenRouter returned empty transcription",
          ErrorCode.TRANSCRIPTION_FAILED,
          { result },
        );
      }

      console.log("✅ OpenRouter transcription completed:", {
        length: text.length,
        preview: text.substring(0, 50) + "...",
      });

      return {
        text,
        confidence: 0.95,
        language: "en",
        metadata: {
          model: this.model,
          provider: "openrouter",
        },
      };
    } catch (error) {
      console.error("❌ OpenRouter transcription failed:", error);

      if (error instanceof VoiceButtonError) {
        throw error;
      }

      throw new VoiceButtonError(
        "OpenRouter transcription failed",
        ErrorCode.TRANSCRIPTION_API_ERROR,
        { originalError: error },
      );
    }
  }

  /**
   * Build the audio message content in the format the model expects.
   * Gemini/VertAI models on OpenRouter use the inline_data format.
   * GPT-4o/o1 use input_audio format.
   */
  private buildAudioMessage(
    promptText: string,
    audioBase64: string,
    mimeType: string,
  ): unknown[] {
    // For Gemini-family models on OpenRouter, use inline_data format
    if (this.model.includes("gemini") || this.model.includes("vertex")) {
      return [
        { type: "text", text: promptText },
        {
          type: "gemini_multimodal_url",
          gemini_multimodal_url: {
            mimeType: mimeType,
            encodedAudio: audioBase64,
            encodedImage: audioBase64,
          },
        },
      ];
    }

    // Default: OpenAI-compatible format with input_audio
    return [
      { type: "text", text: promptText },
      {
        type: "input_audio",
        input_audio: {
          data: audioBase64,
          format: mimeType.includes("wav") ? "wav" : "webm",
        },
      },
    ];
  }

  // deno-lint-ignore require-await
  async getLanguages(): Promise<Language[]> {
    return [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "fr", name: "French" },
      { code: "de", name: "German" },
      { code: "it", name: "Italian" },
      { code: "pt", name: "Portuguese" },
      { code: "ja", name: "Japanese" },
      { code: "ko", name: "Korean" },
      { code: "zh", name: "Chinese" },
      { code: "ar", name: "Arabic" },
      { code: "hi", name: "Hindi" },
    ];
  }

  // deno-lint-ignore require-await
  async estimateCost(audio: AudioBlob): Promise<number> {
    const durationMinutes = audio.duration / 60;
    return Math.max(0.01, durationMinutes * 0.075);
  }

  /**
   * Probe which models on OpenRouter can handle audio transcription.
   * Useful for building a model picker in the UI.
   */
  async probeModels(): Promise<OpenRouterModel[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data || [])
        .filter((m: { architecture?: { modality?: string } }) =>
          m.architecture?.modality?.includes("audio")
        )
        .map((
          m: {
            id: string;
            name: string;
            pricing?: { prompt: string; completion: string };
          },
        ) => ({
          id: m.id,
          name: m.name,
          pricing: m.pricing,
        }))
        .slice(0, 20);
    } catch {
      return [];
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          const base64data = result.split(",")[1];
          resolve(base64data);
        } catch (error) {
          reject(
            new VoiceButtonError(
              "Failed to convert audio to base64",
              ErrorCode.TRANSCRIPTION_FAILED,
              { originalError: error },
            ),
          );
        }
      };

      reader.onerror = () => {
        reject(
          new VoiceButtonError(
            "Failed to read audio file",
            ErrorCode.TRANSCRIPTION_FAILED,
          ),
        );
      };

      reader.readAsDataURL(blob);
    });
  }
}

// ===================================================================
// OPENROUTER MODEL LIST - Curated multimodal models for transcription
// ===================================================================
export const OPENROUTER_TRANSCRIPTION_MODELS: OpenRouterModel[] = [
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Fast, cheap)",
    pricing: { prompt: "0.0000003", completion: "0.0000015" },
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite (Cheapest)",
    pricing: { prompt: "0.0000001", completion: "0.0000004" },
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Highest quality)",
    pricing: { prompt: "0.00000125", completion: "0.000005" },
  },
  {
    id: "mistralai/voxtral-small-24b-2507",
    name: "Voxtral (Best transcription)",
    pricing: { prompt: "0.0000001", completion: "0.0000003" },
  },
];

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export interface OpenRouterConfig extends TranscriptionConfig {
  apiKey: string;
  model?: string;
  customPrompt?: string;
  appName?: string;
  appUrl?: string;
}
