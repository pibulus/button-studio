import { signal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import VoiceButton from "../components/VoiceButton.tsx";
import MiniButtonPreview from "../components/MiniButtonPreview.tsx";
import AudioSettings from "../components/AudioSettings.tsx";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal.tsx";
import {
  ButtonCustomization,
  ButtonTheme,
  defaultCustomization,
} from "../types/customization.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { playSound } from "../utils/audio/soundMapping.ts";
import { BRAND_TAGLINE } from "../utils/brand.ts";

// Import panel components directly
import CollapsiblePanel from "../components/panels/CollapsiblePanel.tsx";
import DesignPanel from "../components/panels/DesignPanel.tsx";
import FeelPanel from "../components/panels/FeelPanel.tsx";
import MagicPanel from "../components/panels/MagicPanel.tsx";
import ShipPanel from "../components/panels/ShipPanel.tsx";
import ColorsPanel from "../components/panels/ColorsPanel.tsx";
import SizeShapePanel from "../components/panels/SizeShapePanel.tsx";
import ToastContainer, { toast } from "../components/Toast.tsx";

// Import footer modals
import { KofiButton, KofiModal } from "./KofiModal.tsx";
import { AboutLink, AboutModal } from "./AboutModal.tsx";

// ===================================================================
// DESIGN SUB-HEADER - shared label style for the merged Design panel's
// three sub-sections (Color / Size & Shape / Border) so they read as
// evenly-weighted parts of one panel rather than three bolted-together
// mini-panels.
// ===================================================================

function DesignSubHeader({ label }: { label: string }) {
  return (
    <div class="flex items-center gap-2 mb-3">
      <span
        class="inline-block w-[10px] h-[10px] rounded-full border-2 border-black/80"
        style={{ background: "#F4C0D5" }}
      />
      <h4 class="text-xs font-black uppercase tracking-wide text-black/70">
        {label}
      </h4>
      <span class="flex-1 border-t-2 border-black/10" />
    </div>
  );
}

// ===================================================================
// GLOBAL STATE - Main app state using Preact signals
// ===================================================================

const customization = signal<ButtonCustomization>(defaultCustomization);
const transcriptResult = signal<string>("");
const resultCopied = signal<boolean>(false);
const showKeyboardModal = signal<boolean>(false);
const customPrompt = signal<string>("");
const customFormat = signal<"text" | "list" | "sections">("text");
const hasPaid = signal<boolean>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("buttonspa-premium") === "true"
    : false,
);
const sessionId = typeof crypto !== "undefined"
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);
const voiceEnabled = signal<boolean>(true);

// Tracks whether the main "Your Button" stage is scrolled out of view on
// mobile, so the sticky mini-preview bar knows when to show itself.
const stageOutOfView = signal<boolean>(false);

// Default panel state for the 5-panel structure: Your Button, Action
// (magic), Design (merged Paint + Shape + Style), Motion (feel), Ship.
const defaultPanelState = {
  stageView: true, // Your Button - always open by default
  magic: true, // Action - the actual product, open by default
  design: true, // Design (merged Color + Size & Shape + Border) - open by default
  feel: false, // Motion - closed by default
  ship: false, // Ship - closed by default
};

// Load saved panel state from localStorage or use defaults. Returning users
// may have state saved under the OLD 7-panel ids (colors/sizeShape/design
// were separate panels, magic defaulted closed). We merge saved values over
// the new defaults so: unknown old keys (colors, sizeShape) are simply
// ignored, and any new key not present in old saved state (there are none
// here, but this keeps us safe for future panel additions) falls back to
// its default instead of leaving the accordion empty/broken.
const getSavedPanelState = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("buttonStudioPanels");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return { ...defaultPanelState, ...parsed };
        }
      } catch {
        // Fallback to defaults if parse fails
      }
    }
  }
  return { ...defaultPanelState };
};

// Accordion panel state - 5 panels total (2 left: stageView, magic; 3 right:
// design, feel, ship)
const expandedPanels = signal<Record<string, boolean>>(getSavedPanelState());

export default function ButtonStudio() {
  const stageRef = useRef<HTMLDivElement>(null);

  // Sticky mobile preview - watch the "Your Button" stage and flip
  // stageOutOfView on/off as it scrolls past the viewport. Only matters
  // below lg:, but the observer is cheap enough to just always run.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        stageOutOfView.value = !entry.isIntersecting;
      },
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Welcome sound - with audio context initialization
  useEffect(() => {
    // Initialize audio context on first user interaction for better browser support
    const initAudio = () => {
      playSound.primaryClick();
      document.removeEventListener("click", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };

    // Try to play welcome sound after delay, or wait for interaction
    const timer = setTimeout(() => {
      try {
        playSound.primaryClick();
      } catch {
        // Wait for user interaction if autoplay is blocked
        document.addEventListener("click", initAudio);
        document.addEventListener("touchstart", initAudio);
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };
  }, []);

  // Restore premium status from localStorage or server
  useEffect(() => {
    const token = typeof localStorage !== "undefined"
      ? localStorage.getItem("buttonspa-premium-token")
      : null;

    if (token) {
      fetch(`/api/premium/status?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.hasPaid) {
            hasPaid.value = true;
            localStorage.setItem("buttonspa-premium", "true");
          } else {
            // Token invalid — clear stale premium
            hasPaid.value = false;
            localStorage.removeItem("buttonspa-premium");
            localStorage.removeItem("buttonspa-premium-token");
          }
        })
        .catch(() => {/* offline — trust localStorage */});
    }
  }, []);

  // Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Cmd/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            // Trigger shuffle (surprise)
            document.dispatchEvent(new CustomEvent("surpriseMe"));
            break;
          case "d":
            e.preventDefault();
            // Toggle design panel
            togglePanel("design");
            break;
          case "f":
            e.preventDefault();
            // Toggle feel panel
            togglePanel("feel");
            break;
          case "e":
            e.preventDefault();
            // Toggle ship (export) panel
            togglePanel("ship");
            break;
          case "m":
            e.preventDefault();
            // Toggle magic panel
            togglePanel("magic");
            break;
        }
      }

      // Number keys for quick theme switching (1-9)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        const themeIndex = parseInt(e.key) - 1;
        const themes: ButtonTheme[] = [
          "minimal",
          "warm",
          "professional",
          "lush",
        ];
        if (themes[themeIndex]) {
          customization.value = {
            ...customization.value,
            appearance: {
              ...customization.value.appearance,
              theme: themes[themeIndex],
            },
          };
          playSound.selectionSelect();
        }
      }

      // Space bar to test button (when not in input)
      if (
        e.key === " " &&
        !(e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        const button = document.querySelector(
          ".voice-button-main",
        ) as HTMLElement;
        if (button) {
          button.click();
        }
      }

      // Show keyboard shortcuts help
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        showKeyboardModal.value = true;
        playSound.primaryClick();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
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
      const selectedEffects: Array<(typeof effectKeys)[number]> = [];

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

  const applyTheme = (_theme: ButtonTheme) => {
    void _theme;
  };

  const togglePanel = (panelId: string) => {
    const isExpanding = !expandedPanels.value[panelId];
    const newState = {
      ...expandedPanels.value,
      [panelId]: isExpanding,
    };
    expandedPanels.value = newState;

    // Save to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("buttonStudioPanels", JSON.stringify(newState));
    }

    // Use correct sound based on expand/collapse action
    if (isExpanding) {
      try {
        playSound.panelExpand?.();
      } catch { /* optional */ }
      playSound.primaryClick();
    } else {
      try {
        playSound.panelCollapse?.();
      } catch { /* optional */ }
      playSound.secondaryClick();
    }
    hapticService.buttonPress();
  };

  return (
    <div
      class={`min-h-screen bg-[#F7F0E2] flex flex-col ${
        stageOutOfView.value ? "pb-20 lg:pb-0" : ""
      }`}
    >
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardModal.value}
        onClose={() => showKeyboardModal.value = false}
      />

      {/* Footer Modals */}
      <KofiModal kofiUsername="pibulus" />
      <AboutModal />
      <ToastContainer />

      {/* Header - Enhanced with better presence */}
      <header class="max-w-[1280px] mx-auto w-full px-6 pt-12 pb-8 shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-4xl sm:text-6xl lg:text-8xl font-black tracking-normal leading-none"
              style={{
                fontWeight: 900,
                letterSpacing: "0",
                lineHeight: 0.9,
                WebkitFontSmoothing: "antialiased",
                textRendering: "optimizeLegibility",
                textShadow: "4px 4px 0px rgba(255,183,255,0.2)",
              }}
            >
              ButtonSpa<span
                class="text-3xl sm:text-4xl lg:text-6xl align-baseline"
                style={{ color: "#EA4C89" }}
              >
                .app
              </span>
            </h1>
            <p
              class="text-[19px] sm:text-[22px] font-bold max-w-[560px]"
              style={{
                marginTop: "18px",
                letterSpacing: "-0.01em",
                color: "rgba(0,0,0,0.82)",
                lineHeight: 1.25,
              }}
            >
              {BRAND_TAGLINE}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <AudioSettings />
          </div>
        </div>
      </header>

      {/* Main Layout - Hybrid design with Toybox left, accordions right */}
      <main
        id="main-content"
        class="max-w-[1280px] mx-auto w-full px-6 pt-6 pb-8 flex-1"
      >
        <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] gap-6 items-start">
          {/* LEFT: Stage + Action */}
          <div class="space-y-4" ref={stageRef}>
            {/* Stage View - CollapsiblePanel */}
            <CollapsiblePanel
              id="stageView"
              title="Your Button"
              color="pink"
              isExpanded={expandedPanels.value.stageView}
              onToggle={togglePanel}
              index={0}
              showToggle
              toggleValue={voiceEnabled.value}
              onToggleChange={(value) => {
                voiceEnabled.value = value;
                playSound.primaryClick();
              }}
              toggleLabel="Voice"
            >
              <div class="rounded-3xl border-[3px] border-black/80 p-8 bg-gradient-to-b from-white/60 to-white/20 min-h-[260px] flex items-center justify-center relative">
                <div style={{ width: "240px" }}>
                  <VoiceButton
                    customization={customization.value}
                    hasPaid={hasPaid.value}
                    sessionId={sessionId}
                    onCustomizationChange={handleCustomizationChange}
                    voiceEnabled={voiceEnabled.value}
                    customPrompt={customPrompt.value}
                    showWaveform={false}
                    onComplete={(result) => {
                      transcriptResult.value = result.text;
                      resultCopied.value = false;
                    }}
                  />
                </div>

                {/* Magic Shuffle Button */}
                <button
                  type="button"
                  aria-label="Randomize button design"
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
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #FFF3B8 0%, #FFD4A3 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)";
                  }}
                  class="absolute bottom-4 right-4 h-[56px] w-[56px] rounded-[20px] flex items-center justify-center text-[28px] font-black transition-all duration-200 active:scale-95"
                  style={{
                    border: "3px solid rgba(0,0,0,0.88)",
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)",
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
                  class="min-w-0 flex-1 rounded-full border-[3px] border-black/80 px-4 py-2 bg-white/80 font-bold text-center hover:bg-white/90 focus:bg-amber-50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  aria-label="Reset button label to default"
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
                  class="shrink-0 rounded-full border-[3px] border-black/80 px-4 py-2 bg-yellow-300 font-bold hover:bg-yellow-400 transition-colors"
                >
                  Reset
                </button>
              </div>

              {!transcriptResult.value && (
                <div class="mt-4 rounded-[22px] border-[3px] border-dashed border-black/25 bg-white/30 p-6 text-center">
                  <p class="text-sm font-bold text-black/40">
                    Your output lands here.
                  </p>
                </div>
              )}

              {transcriptResult.value && (
                <div class="mt-4 rounded-[22px] border-[3px] border-black/80 bg-white overflow-hidden">
                  <div class="flex items-center justify-between gap-3 px-4 py-3 bg-[#D8F0A6] border-b-[3px] border-black/20">
                    <div>
                      <h3 class="text-lg font-black text-black">Output</h3>
                    </div>
                    <span class="shrink-0 rounded-full border-2 border-black/70 bg-white px-3 py-1 text-xs font-black">
                      {resultCopied.value ? "Copied" : "Ready"}
                    </span>
                  </div>
                  <textarea
                    value={transcriptResult.value}
                    onInput={(e) => {
                      transcriptResult.value =
                        (e.target as HTMLTextAreaElement).value;
                      resultCopied.value = false;
                    }}
                    class="block w-full min-h-[180px] max-h-[360px] resize-y bg-[#FFFDF7] p-4 text-base leading-relaxed font-medium text-gray-900 focus:outline-none"
                    aria-label="Button output"
                  />
                  <div class="flex flex-col sm:flex-row gap-3 p-4 bg-[#FFF9F2] border-t-2 border-black/10">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            transcriptResult.value,
                          );
                          resultCopied.value = true;
                          playSound.success();
                          hapticService.copySuccess();
                          toast.success("Output copied");
                        } catch {
                          toast.error("Could not copy output");
                          playSound.error();
                        }
                      }}
                      class="flex-1 bg-black text-white px-4 py-3 rounded-xl font-black hover:bg-gray-800 transition-colors border-2 border-black"
                      style={{ boxShadow: "4px 4px 0px #000000" }}
                    >
                      Copy Output
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: "ButtonSpa output",
                              text: transcriptResult.value,
                            });
                            playSound.success();
                            hapticService.buttonSuccess();
                            return;
                          }

                          await navigator.clipboard.writeText(
                            transcriptResult.value,
                          );
                          resultCopied.value = true;
                          toast.success("Output copied");
                          playSound.success();
                          hapticService.copySuccess();
                        } catch (error) {
                          if ((error as Error).name !== "AbortError") {
                            toast.error("Could not share output");
                            playSound.error();
                          }
                        }
                      }}
                      class="flex-1 bg-[#BFE8FF] text-black px-4 py-3 rounded-xl font-black hover:bg-[#A9DDF9] transition-colors border-2 border-black"
                      style={{ boxShadow: "4px 4px 0px #000000" }}
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        transcriptResult.value = "";
                        resultCopied.value = false;
                        playSound.secondaryClick();
                      }}
                      class="flex-1 bg-white text-black px-4 py-3 rounded-xl font-black hover:bg-gray-100 transition-colors border-2 border-black"
                      style={{ boxShadow: "4px 4px 0px #000000" }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </CollapsiblePanel>

            {/* Action - CollapsiblePanel (promoted: this is the product) */}
            <CollapsiblePanel
              id="magic"
              title="Action"
              color="purple"
              isExpanded={expandedPanels.value.magic}
              onToggle={togglePanel}
              index={1}
            >
              <MagicPanel
                hasPaid={hasPaid.value}
                onUnlockPremium={async () => {
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                    });
                    if (res.ok) {
                      const { checkoutUrl } = await res.json();
                      globalThis.location.assign(checkoutUrl);
                      return;
                    }
                  } catch { /* fall through to dev mode */ }
                  // Dev mode: toggle premium directly
                  hasPaid.value = true;
                  if (typeof localStorage !== "undefined") {
                    localStorage.setItem("buttonspa-premium", "true");
                  }
                  toast.success(
                    "You're a supporter now — thanks! 🎸 (dev mode)",
                  );
                }}
                customPromptValue={customPrompt.value}
                onCustomPromptChange={(newPrompt, newFormat) => {
                  customPrompt.value = newPrompt;
                  if (newFormat) customFormat.value = newFormat;
                }}
              />
            </CollapsiblePanel>
          </div>

          {/* RIGHT: Design (merged Color + Size & Shape + Border), Motion, Ship */}
          <aside class="w-full space-y-4">
            {
              /* Design Accordion - merged Paint + Shape + Style into one
                balanced panel with three evenly-weighted sub-sections */
            }
            <CollapsiblePanel
              id="design"
              title="Design"
              color="red"
              isExpanded={expandedPanels.value.design}
              onToggle={togglePanel}
              index={0}
            >
              <div class="space-y-6">
                <section>
                  <DesignSubHeader label="Color" />
                  <ColorsPanel
                    customization={customization.value}
                    onChange={handleCustomizationChange}
                  />
                </section>

                <section>
                  <DesignSubHeader label="Size & Shape" />
                  <SizeShapePanel
                    customization={customization.value}
                    updateAppearance={updateAppearance}
                  />
                </section>

                <section>
                  <DesignSubHeader label="Border" />
                  <DesignPanel
                    customization={customization.value}
                    updateAppearance={updateAppearance}
                  />
                </section>
              </div>
            </CollapsiblePanel>

            {/* Feel Accordion */}
            <CollapsiblePanel
              id="feel"
              title="Motion"
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
                customPromptValue={customPrompt.value}
                customFormatValue={customFormat.value}
              />
            </CollapsiblePanel>
          </aside>
        </div>
      </main>

      {
        /* Sticky mobile mini-preview - keeps the "live preview" promise
          alive once the user scrolls past the main stage on small screens */
      }
      {stageOutOfView.value && (
        <div
          class="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-[#FFF9F2]/95 backdrop-blur border-t-[3px] border-black/80"
          style={{
            boxShadow: "0 -4px 0px rgba(0,0,0,0.15)",
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <MiniButtonPreview customization={customization.value} />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-black truncate">
              {customization.value.content.value || "Your Button"}
            </p>
            <p class="text-xs font-bold text-black/50">Live preview</p>
          </div>
          <button
            type="button"
            onClick={() => {
              stageRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              playSound.primaryClick();
            }}
            class="shrink-0 rounded-full border-2 border-black/80 bg-white px-3 py-1.5 text-xs font-black hover:bg-amber-50 active:scale-95 transition-all"
            style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.85)" }}
          >
            ↑ Jump up
          </button>
        </div>
      )}

      {/* Footer */}
      <footer class="mt-8 py-6 border-t-4 border-black/80 bg-[#FFE5B4]">
        <div class="max-w-[1280px] mx-auto px-6">
          <div class="flex items-center justify-center gap-4">
            <AboutLink label="Made by Pablo 🎸" />
            <KofiButton size="sm" label="☕ Support" />
          </div>
        </div>
      </footer>
    </div>
  );
}
