import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import VoiceButton from "../components/VoiceButton.tsx";
import CustomizationPanel from "../components/CustomizationPanel.tsx";
import AudioSettings from "../components/AudioSettings.tsx";
import SoundPicker from "../components/SoundPicker.tsx";
import {
  ButtonCustomization,
  defaultCustomization,
  sliderConfig,
} from "../types/customization.ts";
import { soundService } from "../utils/audio/soundService.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { playSound } from "../utils/audio/soundMapping.ts";

// ===================================================================
// GLOBAL STATE - Main app state using Preact signals
// ===================================================================

const customization = signal<ButtonCustomization>(defaultCustomization);
const voiceEnabled = signal<boolean>(false);
const transcriptResult = signal<string>("");
const showTranscriptModal = signal<boolean>(false);
const apiKey = signal<string>(""); // Track API key from Magic panel
const customPrompt = signal<string>(""); // Track custom prompt from Magic panel

// Color mode state - Smart unified color system
const colorMode = signal<"pastel" | "neon" | "classic" | "gradient">("pastel");

// Smart unified color system - each mode has its own color palette and style
const colorModes = {
  pastel: {
    name: "Pastel",
    fillType: "solid" as const,
    colors: [
      "#ff9eb5",
      "#ffb08a",
      "#ffd4a3",
      "#fff3b8",
      "#c8e6c9",
      "#a8d8d1",
      "#b8d8e0",
      "#d1c4e0",
      "#e6a8d6",
      "#ffb3d1",
      "#ffc4e1",
      "#ff9a8b",
    ],
  },
  neon: {
    name: "Neon",
    fillType: "solid" as const,
    colors: [
      "#ff1493",
      "#ff4500",
      "#ffff00",
      "#7fff00",
      "#00ff7f",
      "#00ffff",
      "#1e90ff",
      "#ff00ff",
      "#ff6347",
      "#ffd700",
      "#00fa9a",
      "#ff69b4",
    ],
  },
  classic: {
    name: "Classic",
    fillType: "solid" as const,
    colors: [
      "#f87171",
      "#fb923c",
      "#fbbf24",
      "#a3e635",
      "#4ade80",
      "#22d3ee",
      "#60a5fa",
      "#818cf8",
      "#a78bfa",
      "#e879f9",
      "#f472b6",
      "#facc15",
    ],
  },
  gradient: {
    name: "Gradient",
    fillType: "gradient" as const,
    colors: [
      ["#ff9a9e", "#fecfef"],
      ["#ffecd2", "#fcb69f"],
      ["#a8edea", "#fed6e3"],
      ["#8fd3f4", "#84fab0"],
      ["#a1c4fd", "#c2e9fb"],
      ["#4facfe", "#00f2fe"],
      ["#fbc2eb", "#a6c1ee"],
      ["#667eea", "#764ba2"],
      ["#f093fb", "#f5576c"],
      ["#ff8a80", "#ff80ab"],
      ["#fdcbf1", "#e6dee9"],
      ["#cbb4d4", "#ddd6fe"],
    ],
  },
};

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
  // SHUFFLE BUTTON MAGIC - Randomize all the things!
  // ===================================================================

  useEffect(() => {
    const handleSurpriseMe = () => {
      // Generate random appearance values
      const currentMode = colorModes[colorMode.value];
      const randomColorIndex = Math.floor(
        Math.random() * currentMode.colors.length,
      );
      const randomColor = currentMode.colors[randomColorIndex];

      // Random shape
      const shapes = ["circle", "square"] as const;
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

      // Random effects (pick 1-2 effects randomly)
      const effectKeys = [
        "breathing",
        "bounce",
        "glow",
        "shadow",
        "shine",
        "pulse",
      ] as const;
      const newEffects = { ...defaultCustomization.effects };

      // Reset all effects first
      effectKeys.forEach((key) => {
        newEffects[key as keyof typeof newEffects] = false;
      });

      // Pick 1-2 random effects
      const numEffects = Math.random() < 0.6 ? 1 : 2;
      for (let i = 0; i < numEffects; i++) {
        const randomEffect =
          effectKeys[Math.floor(Math.random() * effectKeys.length)];
        newEffects[randomEffect as keyof typeof newEffects] = true;
      }

      // Create new randomized customization
      const newCustomization: ButtonCustomization = {
        ...customization.value,
        appearance: {
          ...customization.value.appearance,
          shape: randomShape,
          scale: Math.round((0.8 + Math.random() * 1.0) * 10) / 10, // 0.8-1.8
          roundness: Math.floor(Math.random() * 40) + 5, // 5-45px
          borderWidth: Math.floor(Math.random() * 6) + 2, // 2-8px
          borderStyle: Math.random() > 0.5 ? "solid" : "dashed",
          fillType: currentMode.fillType,
          ...(currentMode.fillType === "solid"
            ? { solidColor: randomColor as string }
            : {
              gradient: {
                start: (randomColor as string[])[0],
                end: (randomColor as string[])[1],
                direction: Math.floor(Math.random() * 8) * 45, // 0, 45, 90, 135, etc.
              },
            }),
        },
        effects: newEffects,
        interactions: {
          ...customization.value.interactions,
          hoverEffect: [
            "squish",
            "grow",
            "bright",
            "tilt",
          ][Math.floor(Math.random() * 4)] as any,
        },
      };

      customization.value = newCustomization;

      // Play celebration sound
      setTimeout(() => {
        soundService.playSuccess();
        hapticService.celebration();
      }, 300);
    };

    // Listen for the shuffle event
    document.addEventListener("surpriseMe", handleSurpriseMe);

    // Cleanup
    return () => {
      document.removeEventListener("surpriseMe", handleSurpriseMe);
    };
  }, [colorMode.value]); // Re-register when color mode changes

  // ===================================================================
  // EVENT HANDLERS - State update functions
  // ===================================================================

  const handleCustomizationChange = (newCustomization: ButtonCustomization) => {
    customization.value = newCustomization;
  };

  const handleVoiceToggle = (enabled: boolean) => {
    voiceEnabled.value = enabled;
  };

  // Update functions for customization
  const updateAppearance = (
    key: keyof ButtonCustomization["appearance"],
    value: number | string,
  ) => {
    customization.value = {
      ...customization.value,
      appearance: {
        ...customization.value.appearance,
        [key]: value,
      },
    };
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
              {/* Button Preview Panel - Enhanced with stronger focal point */}
              <div class="bg-white rounded-3xl shadow-lg border-4 border-black overflow-hidden">
                {/* Mode Indicator - Stronger toggle identity */}
                <div class="px-6 py-5 border-b-4 border-black bg-gradient-to-r from-purple-50 to-pink-50 flex justify-center">
                  <button
                    onClick={() => {
                      handleVoiceToggle(!voiceEnabled.value);
                      soundService.playUI();
                      hapticService.buttonPress();
                    }}
                    onMouseEnter={() => soundService.playButtonHover()}
                    class={`px-6 py-3 rounded-full border-3 border-black font-black text-base transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${
                      voiceEnabled.value
                        ? "bg-green-300 hover:bg-green-400 shadow-lg"
                        : "bg-amber-200 hover:bg-amber-300"
                    }`}
                    style={{ boxShadow: "3px 3px 0px #000000" }}
                  >
                    <div
                      class={`w-3 h-3 rounded-full ${
                        voiceEnabled.value
                          ? "bg-green-600 animate-pulse"
                          : "bg-amber-600"
                      }`}
                    >
                    </div>
                    <span>
                      {voiceEnabled.value ? "Recording Mode" : "Preview Mode"}
                    </span>
                    <span class="text-xs opacity-60">
                      {voiceEnabled.value ? "ON" : "ON"}
                    </span>
                  </button>
                </div>

                {/* Preview Stage - Enhanced with rounded container and more space */}
                <div class="p-6 bg-gradient-to-br from-amber-50/30 to-pink-50/30">
                  <div
                    class="rounded-3xl border-4 border-black bg-gradient-to-br from-amber-50/50 to-pink-50/50 p-10 flex items-center justify-center min-h-[280px] relative"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fbbf24" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Main Preview Button - Now the focal point */}
                    <div class="transform scale-110">
                      <VoiceButton
                        customization={customization.value}
                        onCustomizationChange={handleCustomizationChange}
                        voiceEnabled={voiceEnabled.value}
                        apiKey={apiKey.value}
                        customPrompt={customPrompt.value}
                        showWaveform={false}
                        onComplete={(result) => {
                          transcriptResult.value = result.text;
                          showTranscriptModal.value = true;
                        }}
                      />
                    </div>

                    {/* 🎲 Dice Shuffle Button - Corner positioned */}
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
                          sparkle.style.animationDelay = Math.random() * 200 +
                            "ms";
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
                          btn.style.boxShadow =
                            "4px 4px 0px #000000, 0 0 12px rgba(251, 191, 36, 0.4)";
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
                        e.currentTarget.style.transform =
                          "scale(1) rotate(0deg)";
                        e.currentTarget.style.boxShadow = "3px 3px 0px #000000";
                        e.currentTarget.style.backgroundColor = "#fef7ed"; // amber-50
                        e.currentTarget.style.filter =
                          "brightness(1) saturate(1)";

                        // Clean up hover sparkles
                        const hoverSparkles = e.currentTarget.querySelectorAll(
                          ".hover-sparkle",
                        );
                        hoverSparkles.forEach((s) => s.remove());
                      }}
                      class="absolute top-4 right-4 w-12 h-12 bg-white/90 hover:bg-amber-100 border-3 border-black rounded-xl flex items-center justify-center group transition-all duration-200 ease-out cursor-pointer touch-manipulation hover:scale-110"
                      title="Shuffle design 🎲"
                      style={{
                        boxShadow: "2px 2px 0px #000000",
                      }}
                    >
                      {/* Sparkle container for dynamic sparkles */}
                      <div class="sparkle-container absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                      </div>

                      {/* 🎲 Dice Icon */}
                      <svg
                        class="relative z-10 w-6 h-6 text-black group-hover:text-amber-900 transition-all duration-300 group-hover:rotate-[15deg] drop-shadow-sm"
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
                </div>

                {/* Control Area - Full width with better proportions */}
                <div class="px-4 py-5 border-t-4 border-black bg-gradient-to-r from-blue-50 to-purple-50">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 relative">
                      <input
                        type="text"
                        value={customization.value.content.value}
                        onInput={(e) => {
                          const newValue = (e.target as HTMLInputElement).value;
                          handleCustomizationChange({
                            ...customization.value,
                            content: {
                              ...customization.value.content,
                              value: newValue,
                            },
                          });
                        }}
                        onFocus={() => {
                          soundService.playUI();
                          hapticService.buttonPress();
                        }}
                        onMouseEnter={() => soundService.playButtonHover()}
                        placeholder="Type your button text..."
                        maxLength={25}
                        class="w-full px-5 py-4 text-xl font-black bg-white border-4 border-black rounded-2xl focus:bg-orange-50 focus:shadow-lg hover:bg-pink-50 hover:shadow-md hover:-translate-y-0.5 focus:outline-none transition-all duration-300 text-center"
                        style={{ boxShadow: "3px 3px 0px #000000" }}
                      />
                      {/* Character counter */}
                      {customization.value.content.value.length > 18 && (
                        <div class="absolute -bottom-6 right-2 text-xs font-bold text-gray-500">
                          {customization.value.content.value.length}/25
                        </div>
                      )}
                    </div>

                    {/* Test Button - Chunky and matching */}
                    <button
                      onClick={() => {
                        handleVoiceToggle(!voiceEnabled.value);
                        // Sound and haptic feedback
                        if (!voiceEnabled.value) {
                          soundService.playSuccess();
                          hapticService.toggleOn();
                        } else {
                          soundService.playUI();
                          hapticService.toggleOff();
                        }
                      }}
                      onMouseEnter={() => soundService.playButtonHover()}
                      class={`px-8 py-4 rounded-2xl border-4 border-black transition-all duration-300 font-black text-xl hover:scale-105 active:scale-95 ${
                        voiceEnabled.value
                          ? "bg-green-300 hover:bg-green-400 text-black"
                          : "bg-amber-200 hover:bg-amber-300 text-black"
                      }`}
                      style={{
                        boxShadow: "3px 3px 0px #000000",
                      }}
                    >
                      {voiceEnabled.value ? "Live" : "Test"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Mode Selector */}
              <div class="bg-white rounded-3xl p-6 shadow-lg border-4 border-black">
                <h3 class="text-xl font-black text-gray-900 mb-4">Colors</h3>

                {/* Color Mode Buttons */}
                <div class="grid grid-cols-2 gap-3 mb-6">
                  {(["pastel", "neon", "classic", "gradient"] as const).map((
                    mode,
                  ) => (
                    <button
                      key={mode}
                      onClick={() => {
                        colorMode.value = mode;
                        // Update customization to match the selected mode
                        const modeConfig = colorModes[mode];
                        customization.value = {
                          ...customization.value,
                          appearance: {
                            ...customization.value.appearance,
                            fillType: modeConfig.fillType,
                          },
                        };
                        playSound.selectionSelect();
                        hapticService.buttonPress();
                      }}
                      onMouseEnter={() => playSound.hover()}
                      class={`px-6 py-3 rounded-2xl border-3 border-black font-black transition-all capitalize shadow-sm hover:shadow-md active:scale-95 ${
                        colorMode.value === mode
                          ? "bg-purple-200 hover:bg-purple-300 text-black shadow-md scale-105"
                          : "bg-white hover:bg-purple-50 text-black"
                      }`}
                      style={{
                        boxShadow: colorMode.value === mode
                          ? "3px 3px 0px #000000"
                          : "2px 2px 0px #000000",
                      }}
                    >
                      {colorModes[mode].name}
                    </button>
                  ))}
                </div>

                {/* Color Swatches - 6x2 grid */}
                <div class="grid grid-cols-6 gap-3">
                  {colorModes[colorMode.value].colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const currentMode = colorModes[colorMode.value];
                        if (currentMode.fillType === "solid") {
                          customization.value = {
                            ...customization.value,
                            appearance: {
                              ...customization.value.appearance,
                              fillType: "solid",
                              solidColor: color as string,
                            },
                          };
                        } else {
                          // For gradient mode, color is [start, end] array
                          const gradientColors = color as string[];
                          customization.value = {
                            ...customization.value,
                            appearance: {
                              ...customization.value.appearance,
                              fillType: "gradient",
                              gradient: {
                                ...customization.value.appearance.gradient,
                                start: gradientColors[0],
                                end: gradientColors[1],
                              },
                            },
                          };
                        }
                        playSound.colorSelect();
                        hapticService.buttonPress();
                      }}
                      onMouseEnter={() => playSound.hover()}
                      class="h-12 w-full rounded-xl border-3 border-black hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                      style={{
                        background:
                          colorModes[colorMode.value].fillType === "solid"
                            ? color as string
                            : `linear-gradient(135deg, ${
                              (color as string[])[0]
                            }, ${(color as string[])[1]})`,
                        boxShadow: "2px 2px 0px #000000",
                      }}
                      title={colorModes[colorMode.value].fillType === "solid"
                        ? color as string
                        : `${(color as string[])[0]} → ${
                          (color as string[])[1]
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Main Sliders */}
              <div class="bg-white rounded-3xl p-6 shadow-lg border-4 border-black">
                <div class="space-y-8">
                  {sliderConfig
                    .filter((slider) => {
                      // Only show Roundness slider when shape is "square"
                      if (slider.id === "roundness") {
                        return customization.value.appearance.shape ===
                          "square";
                      }
                      return true;
                    })
                    .map((slider) => {
                      const rawValue =
                        customization.value.appearance[slider.id];

                      // Clean value formatting
                      const formatValue = (val: number, unit: string) => {
                        if (unit === "x") {
                          return `${Math.round(val * 10) / 10}${unit}`;
                        }
                        return `${Math.round(val)}${unit}`;
                      };

                      const cleanValue = formatValue(rawValue, slider.unit);
                      const percentage =
                        ((rawValue - slider.min) / (slider.max - slider.min)) *
                        100;

                      return (
                        <div key={slider.id} class="space-y-3">
                          {/* Header with icon and label */}
                          <div class="flex items-center justify-between">
                            <h3 class="text-xl font-black text-gray-900">
                              {slider.label}
                            </h3>

                            {/* Compact Value Display */}
                            <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-black px-3 py-1 rounded-lg shadow-sm">
                              <span class="text-sm font-bold text-gray-800 font-mono">
                                {cleanValue}
                              </span>
                            </div>
                          </div>

                          {/* Slider */}
                          <div class="relative">
                            <input
                              type="range"
                              min={slider.min}
                              max={slider.max}
                              step={slider.step || 1}
                              value={rawValue}
                              onInput={(e) => {
                                updateAppearance(
                                  slider.id,
                                  parseFloat(
                                    (e.target as HTMLInputElement).value,
                                  ),
                                );
                                // Subtle sound feedback for slider movement
                                playSound.sliderStep();
                                hapticService.sliderStep();
                              }}
                              onMouseUp={() => {
                                // Sound when releasing slider
                                playSound.sliderRelease();
                                hapticService.sliderRelease();
                              }}
                              title={`${slider.label}: ${cleanValue}`}
                              class="w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                              style={{
                                background:
                                  `linear-gradient(to right, #ff9eb5 0%, #ff9eb5 ${percentage}%, #f0f0f0 ${percentage}%, #f0f0f0 100%)`,
                                border: "3px solid #000000",
                              }}
                            />
                            <style jsx>
                              {`
                            input[type="range"]::-webkit-slider-thumb {
                              appearance: none;
                              height: 32px;
                              width: 32px;
                              border-radius: 16px;
                              background: linear-gradient(135deg, #ff9eb5 0%, #ff6b9d 100%);
                              border: 3px solid #000000;
                              cursor: grab;
                              box-shadow: 0 4px 12px rgba(255, 158, 181, 0.4), 0 2px 4px rgba(0, 0, 0, 0.15);
                              transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                            }
                            input[type="range"]::-webkit-slider-thumb:hover {
                              transform: scale(1.15) translateY(-1px);
                              cursor: grabbing;
                              box-shadow: 0 8px 25px rgba(255, 158, 181, 0.8), 0 4px 12px rgba(0, 0, 0, 0.3);
                              background: linear-gradient(135deg, #ff6b9d 0%, #ff3d71 100%);
                            }
                            input[type="range"]::-webkit-slider-thumb:active {
                              transform: scale(1.05) translateY(0px);
                              box-shadow: 0 3px 10px rgba(255, 158, 181, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3);
                            }
                            /* Firefox styles */
                            input[type="range"]::-moz-range-thumb {
                              appearance: none;
                              height: 32px;
                              width: 32px;
                              border-radius: 16px;
                              background: linear-gradient(135deg, #ff9eb5 0%, #ff6b9d 100%);
                              border: 3px solid #000000;
                              cursor: grab;
                              box-shadow: 0 4px 12px rgba(255, 158, 181, 0.4), 0 2px 4px rgba(0, 0, 0, 0.15);
                              transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                            }
                            input[type="range"]::-moz-range-thumb:hover {
                              transform: scale(1.15) translateY(-1px);
                              cursor: grabbing;
                            }
                            input[type="range"]::-moz-range-thumb:active {
                              transform: scale(1.05) translateY(0px);
                              box-shadow: 0 3px 10px rgba(255, 158, 181, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3);
                            }
                            `}
                            </style>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Sound Picker */}
              <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-black">
                <SoundPicker
                  customization={customization.value}
                  onChange={handleCustomizationChange}
                />
              </div>
            </div>

            {/* Right Column - Customization Panels */}
            <div class="space-y-4 sm:space-y-6">
              <CustomizationPanel
                customization={customization.value}
                onChange={handleCustomizationChange}
                voiceEnabled={voiceEnabled.value}
                onVoiceToggle={handleVoiceToggle}
                apiKeyValue={apiKey.value}
                onApiKeyChange={(newApiKey) => {
                  apiKey.value = newApiKey;
                }}
                customPromptValue={customPrompt.value}
                onCustomPromptChange={(newPrompt) => {
                  customPrompt.value = newPrompt;
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
