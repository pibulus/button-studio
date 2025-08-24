// ===================================================================
// PWA SHARE MODAL - One-click sharing with QR and instructions
// ===================================================================

import { signal } from "@preact/signals";
import { ButtonCustomization } from "../types/customization.ts";
import { ButtonExporter } from "../utils/export/ButtonExporter.ts";
import { playSound } from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { toast } from "./Toast.tsx";

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

export default function PWAShareModal({
  isOpen,
  onClose,
  customization,
  apiKey = "",
}: PWAShareModalProps) {
  if (!isOpen) return null;

  const generatePWA = async () => {
    isGenerating.value = true;
    playSound.primaryClick();
    
    try {
      const exporter = new ButtonExporter();
      const result = await exporter.generatePWA(customization, {
        includeAI: !!apiKey,
        apiKey: apiKey,
      });
      
      // In real implementation, this would upload to server
      // For now, we'll create a demo URL
      const uniqueId = Math.random().toString(36).substr(2, 9);
      const url = `https://buttonstudio.app/b/${uniqueId}`;
      pwaUrl.value = url;
      
      // Generate QR code using free API
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      
      playSound.success();
      hapticService.success();
      toast("PWA ready to share! 🎉", "success");
    } catch (error) {
      toast("Failed to generate PWA", "error");
      playSound.error();
    } finally {
      isGenerating.value = false;
    }
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(pwaUrl.value);
    playSound.success();
    hapticService.success();
    toast("Link copied! 📋", "success");
  };
  
  const openOnPhone = () => {
    window.open(pwaUrl.value, "_blank");
  };
  
  // Auto-generate on open
  if (isOpen && !pwaUrl.value && !isGenerating.value) {
    generatePWA();
  }
  
  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-4 border-black overflow-hidden">
        {/* Header */}
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-black">Save Button as App</h2>
              <p class="text-sm opacity-90 mt-1">Install on your phone's home screen</p>
            </div>
            <button
              onClick={onClose}
              class="text-white text-2xl hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div class="p-6">
          {isGenerating.value ? (
            <div class="text-center py-12">
              <div class="text-4xl animate-spin mb-4">⚡</div>
              <p class="text-gray-600 font-bold">Creating your app...</p>
            </div>
          ) : pwaUrl.value ? (
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
                  📱 Scan with your phone's camera
                </p>
              </div>
              
              {/* URL Display */}
              <div class="bg-gray-100 rounded-xl p-3 font-mono text-sm break-all">
                {pwaUrl.value}
              </div>
              
              {/* Action Buttons */}
              <div class="space-y-3">
                <button
                  onClick={copyLink}
                  class="w-full py-4 bg-black text-white rounded-2xl font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>📋</span> Copy Link
                </button>
                
                <button
                  onClick={openOnPhone}
                  class="w-full py-4 bg-purple-500 text-white rounded-2xl font-black hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>📲</span> Open on This Device
                </button>
              </div>
              
              {/* What Happens Next */}
              <div class="border-t pt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <h3 class="font-bold mb-3 text-purple-800">✨ What You Get:</h3>
                <div class="space-y-2 text-sm text-gray-700">
                  <div class="flex gap-2">
                    <span>📱</span>
                    <span>Your button becomes an app icon on your home screen</span>
                  </div>
                  <div class="flex gap-2">
                    <span>🎤</span>
                    <span>Tap the icon → Opens just your button (no ButtonStudio)</span>
                  </div>
                  <div class="flex gap-2">
                    <span>📋</span>
                    <span>Record → Get transcription → Auto-copies to clipboard</span>
                  </div>
                  <div class="flex gap-2">
                    <span>🔗</span>
                    <span>Share this link with friends → They get the same button!</span>
                  </div>
                </div>
              </div>
              
              {/* Simple Install Steps */}
              <div class="mt-4 p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p class="text-xs font-bold text-yellow-800 mb-2">📲 How to Install:</p>
                <div class="text-xs space-y-1">
                  <div><span class="font-bold">iPhone:</span> Open in Safari → Tap Share → Add to Home Screen</div>
                  <div><span class="font-bold">Android:</span> Open in Chrome → Tap Menu (⋮) → Install app</div>
                </div>
              </div>
            </div>
          ) : (
            <div class="text-center py-12">
              <p class="text-gray-600">Failed to generate PWA</p>
              <button
                onClick={generatePWA}
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