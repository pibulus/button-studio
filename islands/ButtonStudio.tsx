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
      {/* ===================================================================
          TRANSCRIPT MODAL - Shows transcription results
          =================================================================== */}
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

      {/* ===================================================================
          HEADER - Brutalist title with audio settings
          =================================================================== */}
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

      {/* ===================================================================
          MAIN LAYOUT - Two-column responsive design
          =================================================================== */}
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

                {/* 🎲 JUICY Dice Shuffle Button - MAXIMUM JUICE! */}
                <button
                  onClick={(e) => {
                    // Sound and haptic feedback first!
                    soundService.playDiceRoll();
                    hapticService.diceRoll();

                    // MAXIMUM JUICE CLICK ANIMATION
                    const btn = e.currentTarget;

                    // Stage 1: Deep squish (80ms)
                    btn.style.transform =
                      "scale(0.85) rotate(-5deg) translate(2px, 2px)";
                    btn.style.boxShadow = "1px 1px 0px #000000";
                    btn.style.backgroundColor = "#fbbf24"; // Yellow burst

                    // Stage 2: Bounce back bigger (120ms)
                    setTimeout(() => {
                      btn.style.transform =
                        "scale(1.15) rotate(5deg) translate(-1px, -1px)";
                      btn.style.boxShadow = "5px 5px 0px #000000";
                      btn.style.backgroundColor = "#f59e0b";
                    }, 80);

                    // Stage 3: Wiggle shake (200ms)
                    setTimeout(() => {
                      btn.style.transform =
                        "scale(1.05) rotate(-2deg) translate(1px, 0px)";
                      btn.style.boxShadow = "4px 4px 0px #000000";
                      btn.style.backgroundColor = "#fbbf24";
                    }, 200);

                    // Stage 4: Final settle (150ms)
                    setTimeout(() => {
                      btn.style.transform =
                        "scale(1) rotate(0deg) translate(0px, 0px)";
                      btn.style.boxShadow = "3px 3px 0px #000000";
                      btn.style.backgroundColor = "#fef3c7";
                    }, 350);

                    // Trigger the surprise function
                    const event = new CustomEvent("surpriseMe");
                    document.dispatchEvent(event);
                  }}
                  onMouseEnter={(e) => {
                    // Sound feedback on hover
                    soundService.playButtonHover();

                    // Enhanced hover with sparkle
                    e.currentTarget.style.transform =
                      "scale(1.05) rotate(2deg)";
                    e.currentTarget.style.boxShadow = "4px 4px 0px #000000";
                    e.currentTarget.style.backgroundColor = "#fef3c7";
                    e.currentTarget.style.filter = "brightness(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    // Smooth return to normal
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "3px 3px 0px #000000";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                  class="absolute top-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-white border-3 border-black rounded-xl flex items-center justify-center group transition-all duration-200 ease-out cursor-pointer touch-manipulation"
                  title="Surprise me! 🎲"
                  style={{
                    boxShadow: "3px 3px 0px #000000",
                    willChange:
                      "transform, box-shadow, background-color, filter",
                  }}
                >
                  {/* 🎲 Dice Icon with enhanced animations */}
                  <svg
                    class="w-6 h-6 sm:w-7 sm:h-7 text-amber-800 group-hover:text-amber-900 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7.5 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                  </svg>

                  {/* Enhanced sparkle effects */}
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300">
                  </div>
                  <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-pulse transition-opacity duration-500">
                  </div>

                  {/* Glow effect on hover */}
                  <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-200 to-orange-200 opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10">
                  </div>
                </button>

                {/* Add some CSS for the juice animations */}
                <style jsx>
                  {`
                  @keyframes dice-roll {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg) scale(1.1); }
                    50% { transform: rotate(10deg) scale(0.95); }
                    75% { transform: rotate(-5deg) scale(1.05); }
                    100% { transform: rotate(0deg) scale(1); }
                  }
                  
                  .dice-button:active {
                    animation: dice-roll 0.5s ease-out;
                  }
                  
                  @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(180deg); }
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
