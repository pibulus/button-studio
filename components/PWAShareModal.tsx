// ===================================================================
// PWA SHARE MODAL - One-click sharing with QR and instructions
// ===================================================================

import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { ButtonCustomization } from "../types/customization.ts";
import { playSound } from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { toast } from "./Toast.tsx";
import { encodeHostedButtonConfig } from "../utils/export/hostedConfigCodec.ts";

interface PWAShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: ButtonCustomization;
}

// State for the generated PWA URL
const pwaUrl = signal<string>("");
const isGenerating = signal<boolean>(false);
const qrCodeUrl = signal<string>("");

export default function PWAShareModal({
  isOpen,
  onClose,
  customization,
}: PWAShareModalProps) {
  const customizationKey = JSON.stringify(customization);

  const generatePWA = (options: { quiet?: boolean } = {}) => {
    isGenerating.value = true;

    if (!options.quiet) {
      playSound.primaryClick();
    }

    try {
      // Encode the button configuration as URL-safe base64 with UTF-8 support
      const urlSafeId = encodeHostedButtonConfig(customization);

      // Create the real URL that will serve the PWA
      const baseUrl = globalThis.location.origin;
      const url = `${baseUrl}/b/${urlSafeId}`;

      pwaUrl.value = url;

      // Generate QR code using free API
      qrCodeUrl.value =
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${
          encodeURIComponent(url)
        }`;

      if (!options.quiet) {
        playSound.success();
        hapticService.buttonSuccess();
        toast.success("Tiny app link ready");
      }
    } catch (error) {
      console.error("PWA generation error:", error);
      toast.error("Failed to generate PWA");
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

    generatePWA({ quiet: true });
  }, [isOpen, customizationKey]);

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(pwaUrl.value);
    playSound.success();
    hapticService.buttonSuccess();
    toast.success("Link copied");
  };

  const openOnPhone = () => {
    globalThis.open(pwaUrl.value, "_blank");
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border-4 border-black">
        {/* Header */}
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white rounded-t-3xl">
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
                    Scan to open on your phone.
                  </p>
                </div>

                {/* URL Display */}
                <div class="bg-gray-100 rounded-xl p-3 font-mono text-sm break-all">
                  {pwaUrl.value}
                </div>

                {/* Action Buttons */}
                <div class="space-y-3">
                  <button
                    type="button"
                    onClick={copyLink}
                    class="w-full py-4 bg-black text-white rounded-2xl font-black hover:bg-gray-800 transition-colors"
                  >
                    Copy link
                  </button>

                  <button
                    type="button"
                    onClick={openOnPhone}
                    class="w-full py-4 bg-purple-500 text-white rounded-2xl font-black hover:bg-purple-600 transition-colors"
                  >
                    Open button
                  </button>
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
