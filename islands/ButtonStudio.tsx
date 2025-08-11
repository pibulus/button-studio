import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import VoiceButton from "../components/VoiceButton.tsx";
import CustomizationPanel from "../components/CustomizationPanel.tsx";
import AudioSettings from "../components/AudioSettings.tsx";
import {
  ButtonCustomization,
  defaultCustomization,
} from "../types/customization.ts";
import { soundService } from "../utils/audio/soundService.ts";
import { hapticService } from "../utils/audio/hapticService.ts";

// ===================================================================
// GLOBAL STATE - Main app state using Preact signals
// ===================================================================

const customization = signal<ButtonCustomization>(defaultCustomization);
const voiceEnabled = signal<boolean>(false);
const transcriptResult = signal<string>("");
const showTranscriptModal = signal<boolean>(false);

export default function ButtonStudio() {
  // ===================================================================
  // INITIALIZATION - Welcome sound and setup
  // ===================================================================

  // Welcome sound effect on first load
  useEffect(() => {
    // Small delay to let the page settle, then play welcome sound
    const timer = setTimeout(() => {
      soundService.playSuccess();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // ===================================================================
  // EVENT HANDLERS - State update functions
  // ===================================================================

  const handleCustomizationChange = (newCustomization: ButtonCustomization) => {
    customization.value = newCustomization;
  };

  const handleVoiceToggle = (enabled: boolean) => {
    voiceEnabled.value = enabled;
  };

  return (
    <div
      class="min-h-screen"
      style={{
        background: "radial-gradient(circle at top right, #fefbf3, #faf6ed)",
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f5ead6" fill-opacity="0.3"%3E%3Ccircle cx="7" cy="7" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      {
        /* ===================================================================
          TRANSCRIPT MODAL - Shows transcription results
          =================================================================== */
      }
      {showTranscriptModal.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto border-4 border-black">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-black text-black">
                  ✨ Voice Magic Result
                </h2>
                <button
                  onClick={() => showTranscriptModal.value = false}
                  class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div class="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                <p class="text-gray-900 text-lg leading-relaxed font-medium">
                  {transcriptResult.value || "No transcript available"}
                </p>
              </div>

              <div class="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcriptResult.value);
                  }}
                  class="flex-1 bg-orange-400 text-black px-4 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors border-2 border-black"
                  style={{ boxShadow: "4px 4px 0px #000000" }}
                >
                  📋 Copy Magic
                </button>
                <button
                  onClick={() => showTranscriptModal.value = false}
                  class="flex-1 bg-gray-200 text-black px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors border-2 border-black"
                  style={{ boxShadow: "4px 4px 0px #000000" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {
        /* ===================================================================
          HEADER - Brutalist title with audio settings
          =================================================================== */
      }
      <header class="pt-20 pb-12 px-6">
        <div class="max-w-5xl mx-auto text-center relative">
          <h1 class="text-7xl md:text-8xl font-black text-black tracking-tight leading-none mb-4">
            ButtonStudio
            <span
              class="text-transparent bg-clip-text"
              style={{
                background: "linear-gradient(135deg, #ff6b9d 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              .app
            </span>
          </h1>
          <p class="text-xl text-black font-bold">
            Beautiful, customizable button generator.
          </p>

          {/* Audio settings in top right */}
          <div class="absolute top-0 right-0">
            <AudioSettings />
          </div>
        </div>
      </header>

      {
        /* ===================================================================
          MAIN LAYOUT - Two-column responsive design
          =================================================================== */
      }
      <section class="px-4 sm:px-6 pb-16">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Button + Master Controls */}
            <div class="space-y-4 sm:space-y-6">
              {/* Button Preview Panel */}
              <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-black relative">
                {/* Voice mode indicator */}
                <div class="absolute top-4 left-4 flex items-center gap-2">
                  <div
                    class={`w-2 h-2 rounded-full ${
                      voiceEnabled.value ? "bg-green-400" : "bg-gray-300"
                    }`}
                  >
                  </div>
                  <span class="text-xs font-bold text-gray-600">
                    {voiceEnabled.value ? "Live" : "Test"}
                  </span>
                </div>

                <div class="flex justify-center items-center h-[180px]">
                  <VoiceButton
                    customization={customization.value}
                    onCustomizationChange={handleCustomizationChange}
                    voiceEnabled={voiceEnabled.value}
                    showWaveform={false}
                    onComplete={(result) => {
                      transcriptResult.value = result.text;
                      showTranscriptModal.value = true;
                    }}
                  />
                </div>

                {/* 🎲 MAGICAL Dice Shuffle Button - ULTIMATE SPARKLE EDITION! */}
                <button
                  onClick={(e) => {
                    // Epic sound and haptic feedback first!
                    soundService.playDiceRoll();
                    hapticService.diceRoll();

                    const btn = e.currentTarget;
                    const sparkleContainer = btn.querySelector(
                      ".sparkle-container",
                    );

                    // Create subtle sparkle effect - elegant & refined
                    for (let i = 0; i < 6; i++) {
                      const sparkle = document.createElement("div");
                      sparkle.className =
                        "absolute w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping pointer-events-none";
                      sparkle.style.left = Math.random() * 100 + "%";
                      sparkle.style.top = Math.random() * 100 + "%";
                      sparkle.style.animationDelay = Math.random() * 200 + "ms";
                      sparkle.style.animationDuration = "600ms";
                      sparkleContainer.appendChild(sparkle);

                      // Clean up sparkle after animation
                      setTimeout(() => sparkle.remove(), 800);
                    }

                    // Elegant shuffle animation - Simple and satisfying
                    // Stage 1: Gentle press down (80ms)
                    btn.style.transform = "scale(0.9)";
                    btn.style.boxShadow = "2px 2px 0px #000000";
                    btn.style.backgroundColor = "#fed7aa"; // amber-200

                    // Stage 2: Satisfying bounce up with glow (120ms)
                    setTimeout(() => {
                      btn.style.transform = "scale(1.1)";
                      btn.style.boxShadow = "4px 4px 0px #000000, 0 0 12px rgba(251, 191, 36, 0.4)";
                      btn.style.backgroundColor = "#fbbf24"; // amber-400
                      btn.style.filter = "brightness(1.2)";
                    }, 80);

                    // Stage 3: Gentle settle (150ms)
                    setTimeout(() => {
                      btn.style.transform = "scale(1)";
                      btn.style.boxShadow = "3px 3px 0px #000000";
                      btn.style.backgroundColor = "#fef7ed"; // amber-50
                      btn.style.filter = "brightness(1)";
                    }, 200);

                    // Trigger the surprise function
                    const event = new CustomEvent("surpriseMe");
                    document.dispatchEvent(event);
                  }}
                  onMouseEnter={(e) => {
                    // Enhanced sound feedback on hover
                    soundService.playButtonHover();

                    // Magical hover animation with gentle sparkle
                    e.currentTarget.style.transform =
                      "scale(1.08) rotate(3deg)";
                    e.currentTarget.style.boxShadow =
                      "4px 4px 0px #000000, 0 0 12px rgba(217, 119, 6, 0.4)";
                    e.currentTarget.style.backgroundColor = "#fed7aa"; // amber-200
                    e.currentTarget.style.filter =
                      "brightness(1.15) saturate(1.1) drop-shadow(0 0 6px #d97706)";

                    // Add a gentle sparkle on hover
                    const sparkleContainer = e.currentTarget.querySelector(
                      ".sparkle-container",
                    );
                    const hoverSparkle = document.createElement("div");
                    hoverSparkle.className =
                      "absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse pointer-events-none hover-sparkle";
                    hoverSparkle.style.left = "70%";
                    hoverSparkle.style.top = "25%";
                    sparkleContainer.appendChild(hoverSparkle);
                  }}
                  onMouseLeave={(e) => {
                    // Smooth return to normal with cleanup
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "3px 3px 0px #000000";
                    e.currentTarget.style.backgroundColor = "#fef7ed"; // amber-50
                    e.currentTarget.style.filter = "brightness(1) saturate(1)";

                    // Clean up hover sparkles
                    const hoverSparkles = e.currentTarget.querySelectorAll(
                      ".hover-sparkle",
                    );
                    hoverSparkles.forEach((s) => s.remove());
                  }}
                  class="absolute top-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-amber-50 border-3 border-black rounded-xl flex items-center justify-center group transition-all duration-200 ease-out cursor-pointer touch-manipulation"
                  title="Surprise me! 🎲"
                  style={{
                    boxShadow: "3px 3px 0px #000000",
                    willChange:
                      "transform, box-shadow, background-color, filter",
                  }}
                >
                  {/* Sparkle container for dynamic sparkles */}
                  <div class="sparkle-container absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                  </div>

                  {/* 🎲 Enhanced Dice Icon with magical animations */}
                  <svg
                    class="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-amber-800 group-hover:text-amber-900 transition-all duration-300 group-hover:rotate-[15deg] group-hover:scale-110 drop-shadow-sm"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7.5 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                  </svg>

                  {/* ULTIMATE SPARKLE SYSTEM - Static sparkles that animate on hover */}
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300 shadow-lg">
                  </div>
                  <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-0 group-hover:opacity-90 group-hover:animate-pulse transition-all duration-500 shadow-md">
                  </div>
                  <div class="absolute top-1 left-1 w-1.5 h-1.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-bounce transition-all duration-700 delay-100">
                  </div>
                  <div class="absolute bottom-2 right-2 w-1 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-70 group-hover:animate-ping transition-all duration-400 delay-200">
                  </div>

                  {/* Enhanced magical glow effect */}
                  <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-200/20 via-amber-200/20 to-orange-200/20 opacity-0 group-hover:opacity-50 transition-opacity duration-400 -z-10 blur-sm">
                  </div>

                  {/* Subtle inner glow */}
                  <div class="absolute inset-1 rounded-lg bg-gradient-to-r from-yellow-100/30 to-amber-100/30 opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10">
                  </div>
                </button>

                {/* ✨ ULTIMATE MAGICAL ANIMATION SYSTEM */}
                <style jsx>
                  {`
                  @keyframes dice-roll-ultimate {
                    0% { 
                      transform: rotate(0deg) scale(1); 
                      filter: brightness(1);
                    }
                    15% { 
                      transform: rotate(-15deg) scale(1.1); 
                      filter: brightness(1.2) saturate(1.3);
                    }
                    30% { 
                      transform: rotate(12deg) scale(0.9); 
                      filter: brightness(1.4) saturate(1.5) hue-rotate(20deg);
                    }
                    50% { 
                      transform: rotate(-8deg) scale(1.15); 
                      filter: brightness(1.3) saturate(1.6) hue-rotate(-10deg);
                    }
                    70% { 
                      transform: rotate(5deg) scale(1.05); 
                      filter: brightness(1.1) saturate(1.2);
                    }
                    100% { 
                      transform: rotate(0deg) scale(1); 
                      filter: brightness(1) saturate(1);
                    }
                  }
                  
                  @keyframes magical-sparkle {
                    0%, 100% { 
                      opacity: 0; 
                      transform: scale(0) rotate(0deg); 
                      filter: blur(2px);
                    }
                    50% { 
                      opacity: 1; 
                      transform: scale(1.2) rotate(180deg); 
                      filter: blur(0px) brightness(1.5);
                    }
                  }
                  
                  @keyframes rainbow-pulse {
                    0% { filter: hue-rotate(0deg) brightness(1); }
                    25% { filter: hue-rotate(90deg) brightness(1.1); }
                    50% { filter: hue-rotate(180deg) brightness(1.2); }
                    75% { filter: hue-rotate(270deg) brightness(1.1); }
                    100% { filter: hue-rotate(360deg) brightness(1); }
                  }
                  
                  /* Dynamic sparkle burst animation */
                  @keyframes sparkle-burst {
                    0% {
                      opacity: 0;
                      transform: scale(0) translate(0, 0);
                    }
                    20% {
                      opacity: 1;
                      transform: scale(1.5) translate(var(--x, 0), var(--y, 0));
                    }
                    100% {
                      opacity: 0;
                      transform: scale(0.5) translate(calc(var(--x, 0) * 2), calc(var(--y, 0) * 2));
                    }
                  }
                  
                  /* Enhanced hover glow */
                  .dice-button:hover {
                    animation: rainbow-pulse 2s ease-in-out infinite;
                  }
                `}
                </style>
              </div>

              {/* Master Controls */}
              <CustomizationPanel
                customization={customization.value}
                onChange={handleCustomizationChange}
                voiceEnabled={voiceEnabled.value}
                onVoiceToggle={handleVoiceToggle}
                mode="master"
              />
            </div>

            {/* Right Column - Advanced Controls */}
            <div>
              <CustomizationPanel
                customization={customization.value}
                onChange={handleCustomizationChange}
                voiceEnabled={voiceEnabled.value}
                onVoiceToggle={handleVoiceToggle}
                mode="advanced"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
