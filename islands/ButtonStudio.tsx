import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import VoiceButton from "../components/VoiceButton.tsx";
import AudioSettings from "../components/AudioSettings.tsx";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal.tsx";
import {
  ButtonCustomization,
  ButtonTheme,
  defaultCustomization,
} from "../types/customization.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { playSound } from "../utils/audio/soundMapping.ts";

// Import panel components directly
import CollapsiblePanel from "../components/panels/CollapsiblePanel.tsx";
import DesignPanel from "../components/panels/DesignPanel.tsx";
import FeelPanel from "../components/panels/FeelPanel.tsx";
import MagicPanel from "../components/panels/MagicPanel.tsx";
import ShipPanel from "../components/panels/ShipPanel.tsx";
import ColorsPanel from "../components/panels/ColorsPanel.tsx";
import SizeShapePanel from "../components/panels/SizeShapePanel.tsx";

// ===================================================================
// GLOBAL STATE - Main app state using Preact signals
// ===================================================================

const customization = signal<ButtonCustomization>(defaultCustomization);
const transcriptResult = signal<string>("");
const showTranscriptModal = signal<boolean>(false);
const showKeyboardModal = signal<boolean>(false);
const apiKey = signal<string>("");
const customPrompt = signal<string>("");

// Load saved panel state from localStorage or use defaults
const getSavedPanelState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('buttonStudioPanels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to defaults if parse fails
      }
    }
  }
  return {
    design: true,  // Start with design open
    feel: false,
    ship: false,
    magic: false,
  };
};

// Accordion panel state - only 4 panels on the right now
const expandedPanels = signal<Record<string, boolean>>(getSavedPanelState());

export default function ButtonStudio() {
  // Welcome sound - with audio context initialization
  useEffect(() => {
    // Initialize audio context on first user interaction for better browser support
    const initAudio = () => {
      playSound.primaryClick();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    // Try to play welcome sound after delay, or wait for interaction
    const timer = setTimeout(() => {
      try {
        playSound.primaryClick();
      } catch {
        // Wait for user interaction if autoplay is blocked
        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            // Trigger shuffle (surprise)
            document.dispatchEvent(new CustomEvent("surpriseMe"));
            break;
          case 'd':
            e.preventDefault();
            // Toggle design panel
            togglePanel('design');
            break;
          case 'f':
            e.preventDefault();
            // Toggle feel panel
            togglePanel('feel');
            break;
          case 'e':
            e.preventDefault();
            // Toggle ship (export) panel
            togglePanel('ship');
            break;
          case 'm':
            e.preventDefault();
            // Toggle magic panel
            togglePanel('magic');
            break;
        }
      }

      // Number keys for quick theme switching (1-9)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        const themeIndex = parseInt(e.key) - 1;
        const themes = ["soft", "flamingo", "voice", "amber", "ocean", "forest", "sunset", "midnight", "cosmic"];
        if (themes[themeIndex]) {
          customization.value = {
            ...customization.value,
            appearance: {
              ...customization.value.appearance,
              theme: themes[themeIndex] as any,
            },
          };
          playSound.selectionSelect();
        }
      }

      // Space bar to test button (when not in input)
      if (e.key === ' ' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        const button = document.querySelector('.voice-button-main') as HTMLElement;
        if (button) {
          button.click();
        }
      }

      // Show keyboard shortcuts help
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        showKeyboardModal.value = true;
        playSound.primaryClick();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Shuffle handler - FULL RANDOMIZATION MAGIC! 🎲
  useEffect(() => {
    const handleSurprise = () => {
      // ===================================================================
      // COLOR PALETTES - Curated beautiful combinations
      // ===================================================================
      const solidColors = [
        "#FFE5B4",
        "#FFB4E5",
        "#B4E5FF",
        "#E5FFB4", // Soft pastels
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A", // Vibrant
        "#DDA0DD",
        "#98D8C8",
        "#F7DC6F",
        "#85C1E2", // Dreamy
        "#FFC0CB",
        "#FFD700",
        "#98FB98",
        "#87CEEB", // Classic
        "#FF1493",
        "#00CED1",
        "#FF4500",
        "#32CD32", // Neon
        "#E91E63",
        "#9C27B0",
        "#673AB7",
        "#3F51B5", // Material
      ];

      const gradientPairs = [
        ["#FF6B6B", "#FF8E53"], // Sunset
        ["#667EEA", "#764BA2"], // Purple Dream
        ["#F093FB", "#F5576C"], // Pink Passion
        ["#4FACFE", "#00F2FE"], // Ocean Blue
        ["#43E97B", "#38F9D7"], // Mint Fresh
        ["#FA709A", "#FEE140"], // Summer
        ["#30CFD0", "#330867"], // Deep Sea
        ["#A8EDEA", "#FED6E3"], // Cotton Candy
        ["#FFF3B8", "#FFD4A3"], // Warm Butter
        ["#FF9A9E", "#FECFEF"], // Rose
        ["#C471F5", "#FA71CD"], // Unicorn
        ["#48C6EF", "#6F86D6"], // Sky
      ];

      // Random fill type
      const fillType = Math.random() > 0.5 ? "solid" : "gradient";

      // Get random color(s)
      let colorConfig = {};
      if (fillType === "solid") {
        const randomColor =
          solidColors[Math.floor(Math.random() * solidColors.length)];
        colorConfig = {
          fillType: "solid",
          solidColor: randomColor,
        };
      } else {
        const randomGradient =
          gradientPairs[Math.floor(Math.random() * gradientPairs.length)];
        colorConfig = {
          fillType: "gradient",
          gradient: {
            start: randomGradient[0],
            end: randomGradient[1],
            direction: Math.floor(Math.random() * 8) * 45, // 0, 45, 90, 135, 180, 225, 270, 315
          },
        };
      }

      // Random shape
      const shapes = ["circle", "square"] as const;
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

      // Random scale (0.8 to 1.5)
      const randomScale = Math.round((0.8 + Math.random() * 0.7) * 10) / 10;

      // Random roundness (5 to 45px)
      const randomRoundness = Math.floor(Math.random() * 40) + 5;

      // Random border width (2 to 8px)
      const randomBorderWidth = Math.floor(Math.random() * 6) + 2;

      // Random border style
      const borderStyles = ["solid", "dashed", "dotted", "double"] as const;
      const randomBorderStyle =
        borderStyles[Math.floor(Math.random() * borderStyles.length)];

      // Random shadow type
      const randomShadowType = Math.random() > 0.5 ? "brutalist" : "diffused";

      // ===================================================================
      // EFFECTS - Pick 1-2 random effects
      // ===================================================================
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
      const selectedEffects = [];

      for (let i = 0; i < numEffects; i++) {
        let randomEffect;
        do {
          randomEffect =
            effectKeys[Math.floor(Math.random() * effectKeys.length)];
        } while (
          selectedEffects.includes(randomEffect) ||
          (selectedEffects.includes("breathing") &&
            randomEffect === "bounce") ||
          (selectedEffects.includes("bounce") && randomEffect === "breathing")
        );

        selectedEffects.push(randomEffect);
        newEffects[randomEffect as keyof typeof newEffects] = true;
      }

      // Random hover effect
      const hoverEffects = ["squish", "grow", "bright", "tilt"] as const;
      const randomHoverEffect =
        hoverEffects[Math.floor(Math.random() * hoverEffects.length)];

      // Random themes still
      const themes = ["minimal", "warm", "professional", "lush"] as const;
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      // Random color intensity
      const randomIntensity = Math.random() > 0.5 ? "pastel" : "neon";

      // ===================================================================
      // JUICE CONTROLS - Random interaction feel
      // ===================================================================
      const randomSquishPower = Math.floor(Math.random() * 15) + 5; // 5-20
      const randomBounceFactor = Math.floor(Math.random() * 10) + 5; // 5-15
      const randomHoverLift = Math.floor(Math.random() * 8) + 2; // 2-10
      const randomAnimationSpeed =
        Math.round((0.5 + Math.random() * 1.5) * 10) / 10; // 0.5-2.0
      const easingStyles = ["bouncy", "smooth", "snappy"] as const;
      const randomEasing =
        easingStyles[Math.floor(Math.random() * easingStyles.length)];

      // Create new randomized customization
      const newCustomization: ButtonCustomization = {
        ...customization.value,
        appearance: {
          ...customization.value.appearance,
          theme: randomTheme,
          colorIntensity: randomIntensity as "pastel" | "neon",
          shape: randomShape,
          scale: randomScale,
          roundness: randomRoundness,
          borderWidth: randomBorderWidth,
          borderStyle: randomBorderStyle,
          shadowType: randomShadowType as "brutalist" | "diffused",
          textColor: "auto", // Keep smart contrast
          ...colorConfig,
        },
        effects: newEffects,
        interactions: {
          ...customization.value.interactions,
          hoverEffect: randomHoverEffect,
          squishPower: randomSquishPower,
          bounceFactor: randomBounceFactor,
          hoverLift: randomHoverLift,
          animationSpeed: randomAnimationSpeed,
          easingStyle: randomEasing,
        },
        // Keep the content unchanged - don't mess with what user typed
      };

      // ===================================================================
      // SMOOTH BUTTON TRANSFORMATION
      // ===================================================================

      // Get the button element for animation
      const button = document.querySelector(
        ".voice-button-main",
      ) as HTMLElement;
      if (button) {
        // Add CSS animation if not already present
        if (!document.querySelector("#morph-styles")) {
          const style = document.createElement("style");
          style.id = "morph-styles";
          style.textContent = `
            @keyframes button-morph {
              0% {
                transform: scale(1) rotate(0deg);
              }
              15% {
                transform: scale(0.88) rotate(-2deg);
              }
              30% {
                transform: scale(0.82) rotate(-3deg);
              }
              45% {
                transform: scale(1.15) rotate(4deg);
              }
              60% {
                transform: scale(0.96) rotate(-1.5deg);
              }
              75% {
                transform: scale(1.06) rotate(1deg);
              }
              90% {
                transform: scale(0.99) rotate(-0.5deg);
              }
              100% {
                transform: scale(1) rotate(0deg);
              }
            }
            
            .morphing-button {
              animation: button-morph 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
          `;
          document.head.appendChild(style);
        }

        // Animate the button with morphing
        button.classList.add("morphing-button");

        // Remove animation class after it completes
        setTimeout(() => {
          button.classList.remove("morphing-button");
        }, 800);
      }

      // Apply the new customization
      customization.value = newCustomization;
    };

    document.addEventListener("surpriseMe", handleSurprise);
    return () => document.removeEventListener("surpriseMe", handleSurprise);
  }, []);

  // ===================================================================
  // EVENT HANDLERS
  // ===================================================================

  const handleCustomizationChange = (newCustomization: ButtonCustomization) => {
    customization.value = newCustomization;
  };

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

  const updateEffect = (
    key: keyof ButtonCustomization["effects"],
    value: boolean,
  ) => {
    const newEffects = { ...customization.value.effects };

    if (value && (key === "breathing" || key === "bounce")) {
      // Movement effects - turn off the other when enabling one
      newEffects.breathing = key === "breathing";
      newEffects.bounce = key === "bounce";
    } else if (key === "breathing" || key === "bounce") {
      // Turning off a movement effect
      newEffects[key] = false;
    } else {
      // Visual effects can be toggled independently
      newEffects[key] = value;
    }

    customization.value = {
      ...customization.value,
      effects: newEffects,
    };
  };

  const applyTheme = (theme: ButtonTheme) => {
    customization.value = {
      ...customization.value,
      appearance: {
        ...customization.value.appearance,
        ...theme.appearance,
      },
      interactions: {
        ...customization.value.interactions,
        ...theme.interactions,
      },
      effects: {
        ...customization.value.effects,
        ...theme.effects,
      },
    };
  };

  const togglePanel = (panelId: string) => {
    const isExpanding = !expandedPanels.value[panelId];
    const newState = {
      ...expandedPanels.value,
      [panelId]: isExpanding,
    };
    expandedPanels.value = newState;

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('buttonStudioPanels', JSON.stringify(newState));
    }

    // Use correct sound based on expand/collapse action
    if (isExpanding) {
      playSound.panelsExpand?.() || playSound.primaryClick();
    } else {
      playSound.panelsCollapse?.() || playSound.secondaryClick();
    }
    hapticService.lightTap();
  };

  return (
    <div class="min-h-screen bg-[#F7F0E2] flex flex-col">
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardModal.value}
        onClose={() => showKeyboardModal.value = false}
      />

      {/* Transcript Modal */}
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

      {/* Header - Enhanced with better presence */}
      <header class="max-w-[1280px] mx-auto w-full px-6 pt-12 pb-8 shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-8xl font-black tracking-tighter leading-none"
              style={{
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
                WebkitFontSmoothing: "antialiased",
                textRendering: "optimizeLegibility",
                textShadow: "4px 4px 0px rgba(255,183,255,0.2)",
              }}
            >
              ButtonStudio<span
                class="text-6xl text-fuchsia-500"
                style={{
                  background:
                    "linear-gradient(135deg, #FF00FF 0%, #FF69B4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.1))",
                }}
              >
                .app
              </span>
            </h1>
            <p
              class="text-[18px] italic font-medium"
              style={{
                marginTop: "16px",
                letterSpacing: "0.02em",
                color: "rgba(0,0,0,0.7)",
                textShadow: "0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              Voice buttons that actually work
            </p>
          </div>
          <div class="flex items-center gap-2">
            <AudioSettings />
          </div>
        </div>
      </header>

      {/* Main Layout - Hybrid design with Toybox left, accordions right */}
      <main class="max-w-[1280px] mx-auto w-full px-6 pt-6 pb-8 flex-1">
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] gap-6 items-start">
          {/* LEFT: Stage + Toybox (always open) */}
          <div class="space-y-6">
            {/* Stage View - CHONKY CARD */}
            <div
              class="rounded-3xl border-[4px] border-black/80 shadow-[0_6px_0_#00000066] bg-[rgba(255,255,255,0.85)]"
            >
              <div class="px-4 py-3 rounded-t-3xl bg-gradient-to-r from-white/60 to-white/20 border-b-[3px] border-black/80">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold tracking-wide">Stage View</span>
                </div>
              </div>
              <div class="p-4">
                <div class="rounded-3xl border-[3px] border-black/80 p-8 bg-gradient-to-b from-white/60 to-white/20 min-h-[260px] flex items-center justify-center relative">
                  <div style={{ width: "240px" }}>
                    <VoiceButton
                      customization={customization.value}
                      onCustomizationChange={handleCustomizationChange}
                      voiceEnabled={!!apiKey.value}
                      apiKey={apiKey.value}
                      customPrompt={customPrompt.value}
                      showWaveform={false}
                      onComplete={(result) => {
                        transcriptResult.value = result.text;
                        showTranscriptModal.value = true;
                      }}
                    />
                  </div>

                  {/* Magic Shuffle Button */}
                  <button
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      btn.style.transform = "scale(0.9)";
                      setTimeout(() => {
                        btn.style.transform = "scale(1.1)";
                      }, 100);
                      setTimeout(() => {
                        btn.style.transform = "scale(1)";
                      }, 200);

                      const squishAudio = new Audio("/sounds/grab-pop.mp3");
                      squishAudio.volume = 0.4;
                      squishAudio.play().catch(() => {});
                      hapticService.buttonPress();

                      const event = new CustomEvent("surpriseMe");
                      document.dispatchEvent(event);
                    }}
                    onMouseEnter={(e) => {
                      playSound.hover();
                      e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #FFF3B8 0%, #FFD4A3 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)";
                    }}
                    class="absolute bottom-4 right-4 h-[56px] w-[56px] rounded-[20px] flex items-center justify-center text-[28px] font-black transition-all duration-200 active:scale-95"
                    style={{
                      border: "3px solid rgba(0,0,0,0.88)",
                      background: "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)",
                      filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.35))",
                    }}
                    title="Surprise Me!"
                  >
                    🎲
                  </button>
                </div>
                
                {/* Label Input */}
                <div class="mt-4 flex gap-3">
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
                      playSound.primaryClick();
                      hapticService.buttonPress();
                    }}
                    onMouseEnter={() => playSound.hover()}
                    placeholder="Boop me!"
                    maxLength={25}
                    class="flex-1 rounded-full border-[3px] border-black/80 px-4 py-2 bg-white/80 font-bold text-center hover:bg-white/90 focus:bg-amber-50 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => {
                      handleCustomizationChange({
                        ...customization.value,
                        content: {
                          ...customization.value.content,
                          value: "Boop me!",
                        },
                      });
                      playSound.primaryClick();
                    }}
                    class="rounded-full border-[3px] border-black/80 px-4 py-2 bg-yellow-300 font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Colors (ALWAYS OPEN) */}
            <div class="rounded-3xl border-[4px] border-black/80 shadow-[0_6px_0_#00000066] bg-[rgba(255,255,255,0.85)]">
              <div class="px-4 py-3 rounded-t-3xl bg-gradient-to-r from-white/60 to-white/20 border-b-[3px] border-black/80">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold tracking-wide">Colors</span>
                </div>
              </div>
              <div class="p-4">
                <ColorsPanel
                  customization={customization.value}
                  onChange={handleCustomizationChange}
                />
              </div>
            </div>

            {/* Size & Shape (ALWAYS OPEN) */}
            <div class="rounded-3xl border-[4px] border-black/80 shadow-[0_6px_0_#00000066] bg-[rgba(255,255,255,0.85)]">
              <div class="px-4 py-3 rounded-t-3xl bg-gradient-to-r from-white/60 to-white/20 border-b-[3px] border-black/80">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold tracking-wide">Size & Shape</span>
                </div>
              </div>
              <div class="p-4">
                <SizeShapePanel
                  customization={customization.value}
                  updateAppearance={updateAppearance}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Accordions (multi-open) */}
          <aside class="w-full space-y-4">
            {/* Design Accordion */}
            <CollapsiblePanel
              id="design"
              title="Design"
              color="red"
              isExpanded={expandedPanels.value.design}
              onToggle={togglePanel}
              index={0}
            >
              <DesignPanel
                customization={customization.value}
                updateAppearance={updateAppearance}
              />
            </CollapsiblePanel>

            {/* Feel Accordion */}
            <CollapsiblePanel
              id="feel"
              title="Feel"
              color="orange"
              isExpanded={expandedPanels.value.feel}
              onToggle={togglePanel}
              index={1}
            >
              <FeelPanel
                customization={customization.value}
                updateEffect={updateEffect}
                applyTheme={applyTheme}
              />
            </CollapsiblePanel>

            {/* Ship Accordion */}
            <CollapsiblePanel
              id="ship"
              title="Ship"
              color="yellow"
              isExpanded={expandedPanels.value.ship}
              onToggle={togglePanel}
              index={2}
            >
              <ShipPanel
                customization={customization.value}
                apiKeyValue={apiKey.value}
              />
            </CollapsiblePanel>

            {/* Magic Accordion */}
            <CollapsiblePanel
              id="magic"
              title="Magic"
              color="purple"
              isExpanded={expandedPanels.value.magic}
              onToggle={togglePanel}
              index={3}
            >
              <MagicPanel
                customization={customization.value}
                onChange={handleCustomizationChange}
                apiKeyValue={apiKey.value}
                onApiKeyChange={(newApiKey) => {
                  apiKey.value = newApiKey;
                }}
                customPromptValue={customPrompt.value}
                onCustomPromptChange={(newPrompt) => {
                  customPrompt.value = newPrompt;
                }}
              />
            </CollapsiblePanel>
          </aside>
        </div>
      </main>

      {/* Footer - Better balanced height */}
      <footer
        class="bg-white h-14 shrink-0"
        style={{
          borderTop: "2px solid rgba(0,0,0,0.08)",
          background: "linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)",
        }}
      >
        <div class="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between text-sm text-neutral-600">
          <span class="font-medium">Made with 🔥 by Pablo • v1.0.0</span>
          <nav class="space-x-6">
            <a
              href="https://github.com/pablojosalvarado"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-neutral-900 transition-colors font-medium"
            >
              GitHub
            </a>
            <a
              href="mailto:pablo@buttonstudio.app"
              class="hover:text-neutral-900 transition-colors font-medium"
            >
              Feedback
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
