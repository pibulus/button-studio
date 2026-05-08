// ===================================================================
// PWA SHARE MODAL - One-click sharing with QR and instructions
// ===================================================================

import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { ButtonCustomization } from "../types/customization.ts";
import { playSound } from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { toast } from "./Toast.tsx";
import { encryptWithPIN, isValidPIN } from "../utils/simpleEncrypt.ts";

interface PWAShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: ButtonCustomization;
  apiKey?: string;
}

// State for the generated PWA URL
const pwaUrl = signal<string>("");
const isGenerating = signal<boolean>(false);
const qrCodeUrl = signal<string>("");
const includeApiKey = signal<boolean>(false);
const pin = signal<string>("");

export default function PWAShareModal({
  isOpen,
  onClose,
  customization,
  apiKey = "",
}: PWAShareModalProps) {
  const customizationKey = JSON.stringify(customization);

  const generatePWA = (options: { quiet?: boolean } = {}) => {
    isGenerating.value = true;

    if (!options.quiet) {
      playSound.primaryClick();
    }

    try {
      // Encode the button configuration as URL-safe base64 with UTF-8 support
      const configJson = JSON.stringify(customization);
      // Convert to UTF-8 bytes first to handle emojis and special characters
      const encoder = new TextEncoder();
      const data = encoder.encode(configJson);
      const base64 = btoa(String.fromCharCode(...data));
      // Make it URL-safe by replacing characters
      const urlSafeId = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(
        /=/g,
        "",
      );

      // Create the real URL that will serve the PWA
      const baseUrl = globalThis.location.origin;
      let url = `${baseUrl}/b/${urlSafeId}`;

      // Add encrypted API key if requested
      if (includeApiKey.value && apiKey && pin.value && isValidPIN(pin.value)) {
        const encryptedKey = encryptWithPIN(apiKey, pin.value);
        url += `?k=${encryptedKey}`;
      }

      pwaUrl.value = url;

      // Generate QR code using free API
      qrCodeUrl.value =
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${
          encodeURIComponent(url)
        }`;

      if (!options.quiet) {
        playSound.success();
        hapticService.buttonSuccess();
        toast("Tiny app link ready! 🎉", "success");
      }
    } catch (error) {
      console.error("PWA generation error:", error);
      toast("Failed to generate PWA", "error");
      playSound.error();
    } finally {
      isGenerating.value = false;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    pwaUrl.value = "";
    qrCodeUrl.value = "";
    isGenerating.value = false;
    includeApiKey.value = false;
    pin.value = "";

    if (!apiKey) {
      generatePWA({ quiet: true });
    }
  }, [isOpen, customizationKey, apiKey]);

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(pwaUrl.value);
    playSound.success();
    hapticService.success();
    toast("Link copied! 📋", "success");
  };

  const openOnPhone = () => {
    globalThis.open(pwaUrl.value, "_blank");
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-4 border-black overflow-hidden">
        {/* Header */}
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-black">Save as Tiny App</h2>
              <p class="text-sm opacity-90 mt-1">
                Give this button its own home screen icon.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              class="text-white text-2xl hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div class="p-6">
          {isGenerating.value
            ? (
              <div class="text-center py-12">
                <div class="text-4xl animate-spin mb-4">⚡</div>
                <p class="text-gray-600 font-bold">Creating your app...</p>
              </div>
            )
            : !pwaUrl.value && apiKey
            ? (
              // PIN Setup UI (only show if API key exists)
              <div class="space-y-4">
                <div class="text-center">
                  <h3 class="text-xl font-bold mb-2">
                    🔐 Keep voice transcription with it?
                  </h3>
                  <p class="text-sm text-gray-600">
                    Protect the Gemini key with a PIN before sharing.
                  </p>
                </div>

                <div class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeApiKey.value}
                      onChange={(e) =>
                        includeApiKey.value =
                          (e.target as HTMLInputElement).checked}
                      class="w-5 h-5 rounded"
                    />
                    <span class="font-medium">Include API key with PIN</span>
                  </label>

                  {includeApiKey.value && (
                    <div class="mt-3">
                      <label class="block text-sm font-medium mb-1">
                        Set PIN (4-6 digits)
                      </label>
                      <input
                        type="number"
                        value={pin.value}
                        onInput={(e) =>
                          pin.value = (e.target as HTMLInputElement).value}
                        placeholder="1234"
                        maxLength={6}
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-center text-lg"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        Share this PIN separately with friends
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => generatePWA()}
                  disabled={includeApiKey.value && !isValidPIN(pin.value)}
                  class="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                >
                  Create Install Link
                </button>
              </div>
            )
            : pwaUrl.value
            ? (
              <div class="space-y-6">
                {/* QR Code */}
                <div class="text-center">
                  <div class="bg-gray-50 rounded-2xl p-6 inline-block">
                    <img
                      src={qrCodeUrl.value}
                      alt="QR Code"
                      class="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p class="mt-3 text-sm text-gray-600">
                    📱 Scan to open this button.
                  </p>
                </div>

                {/* URL Display */}
                <div class="bg-gray-100 rounded-xl p-3 font-mono text-sm break-all">
                  {pwaUrl.value}
                </div>

                {/* PIN Display if used */}
                {includeApiKey.value && pin.value && (
                  <div class="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                    <p class="font-bold text-green-800 mb-1">
                      🔐 PIN Protected
                    </p>
                    <p class="text-2xl font-mono font-black text-center">
                      {pin.value}
                    </p>
                    <p class="text-xs text-gray-600 mt-2">
                      Share this PIN with your friends separately
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div class="space-y-3">
                  <button
                    type="button"
                    onClick={copyLink}
                    class="w-full py-4 bg-black text-white rounded-2xl font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📋</span> Copy Install Link
                  </button>

                  <button
                    type="button"
                    onClick={openOnPhone}
                    class="w-full py-4 bg-purple-500 text-white rounded-2xl font-black hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📲</span> Open Button
                  </button>
                </div>

                {/* What Happens Next */}
                <div class="border-t pt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <h3 class="font-bold mb-3 text-purple-800">
                    ✨ What happens next
                  </h3>
                  <div class="space-y-2 text-sm text-gray-700">
                    <div class="flex gap-2">
                      <span>📱</span>
                      <span>
                        Home screen icon generated from this button
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <span>🔘</span>
                      <span>
                        Opens straight to the action, without the studio
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <span>📋</span>
                      <span>
                        Voice buttons record, transcribe, and copy text
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <span>🔗</span>
                      <span>
                        Share the link to send the same tiny app
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simple Install Steps */}
                <div class="mt-4 p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <p class="text-sm font-bold text-yellow-800 mb-2">
                    📲 Install steps
                  </p>
                  <div class="text-sm space-y-1">
                    <div>
                      <span class="font-bold">iPhone:</span>{" "}
                      Open in Safari → Tap Share → Add to Home Screen
                    </div>
                    <div>
                      <span class="font-bold">Android:</span>{" "}
                      Open in Chrome → Tap Menu (⋮) → Install app
                    </div>
                  </div>
                </div>
              </div>
            )
            : (
              <div class="text-center py-12">
                <p class="text-gray-600">Failed to generate PWA</p>
                <button
                  type="button"
                  onClick={() => generatePWA()}
                  class="mt-4 px-6 py-2 bg-black text-white rounded-xl font-bold"
                >
                  Try Again
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
