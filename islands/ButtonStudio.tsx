import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import VoiceButton from "../components/VoiceButton.tsx";
import CustomizationPanel from "../components/CustomizationPanel.tsx";
import AudioSettings from "../components/AudioSettings.tsx";
import CollapsiblePanel from "../components/panels/CollapsiblePanel.tsx";
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
const apiKey = signal<string>("");
const customPrompt = signal<string>("");

// Color mode state
const colorMode = signal<"pastel" | "neon" | "classic" | "gradient">("pastel");

// Panel expansion state for left column
const expandedLeftPanels = signal<Record<string, boolean>>({
  colors: true,
  size: false,
});

// Color system
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
  // Welcome sound
  useEffect(() => {
    const timer = setTimeout(() => {
      soundService.playSuccess();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Shuffle handler
  useEffect(() => {
    const handleSurpriseMe = () => {
      const currentMode = colorModes[colorMode.value];
      const randomColorIndex = Math.floor(
        Math.random() * currentMode.colors.length,
      );
      const randomColor = currentMode.colors[randomColorIndex];

      const shapes = ["circle", "square"] as const;
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

      const effectKeys = [
        "breathing",
        "bounce",
        "glow",
        "shadow",
        "shine",
        "pulse",
      ] as const;
      const newEffects = { ...defaultCustomization.effects };

      effectKeys.forEach((key) => {
        newEffects[key as keyof typeof newEffects] = false;
      });

      const numEffects = Math.random() < 0.6 ? 1 : 2;
      for (let i = 0; i < numEffects; i++) {
        const randomEffect =
          effectKeys[Math.floor(Math.random() * effectKeys.length)];
        newEffects[randomEffect as keyof typeof newEffects] = true;
      }

      const newCustomization: ButtonCustomization = {
        ...customization.value,
        appearance: {
          ...customization.value.appearance,
          shape: randomShape,
          scale: Math.round((0.8 + Math.random() * 1.0) * 10) / 10,
          roundness: Math.floor(Math.random() * 40) + 5,
          borderWidth: Math.floor(Math.random() * 6) + 2,
          borderStyle: Math.random() > 0.5 ? "solid" : "dashed",
          fillType: currentMode.fillType,
          ...(currentMode.fillType === "solid"
            ? { solidColor: randomColor as string }
            : {
              gradient: {
                start: (randomColor as string[])[0],
                end: (randomColor as string[])[1],
                direction: Math.floor(Math.random() * 8) * 45,
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

      setTimeout(() => {
        soundService.playSuccess();
        hapticService.celebration();
      }, 300);
    };

    document.addEventListener("surpriseMe", handleSurpriseMe);
    return () => {
      document.removeEventListener("surpriseMe", handleSurpriseMe);
    };
  }, [colorMode.value]);

  const handleCustomizationChange = (newCustomization: ButtonCustomization) => {
    customization.value = newCustomization;
  };

  const handleVoiceToggle = (enabled: boolean) => {
    voiceEnabled.value = enabled;
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

  const toggleLeftPanel = (panelId: string) => {
    const isExpanding = !expandedLeftPanels.value[panelId];
    expandedLeftPanels.value = {
      ...expandedLeftPanels.value,
      [panelId]: isExpanding,
    };
    // Use correct sound based on expand/collapse action
    if (isExpanding) {
      playSound.panelsExpand?.() || playSound.primaryClick();
    } else {
      playSound.panelsCollapse?.() || playSound.secondaryClick();
    }
    hapticService.lightTap();
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

      {/* Header */}
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
          <div class="absolute top-0 right-0">
            <AudioSettings />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <section class="px-4 sm:px-6 pb-16">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Button Preview + Controls */}
            <div class="space-y-4 sm:space-y-6">
              {/* Button Preview Panel */}
              <div class="bg-white rounded-3xl shadow-lg border-4 border-black overflow-hidden">
                {/* Mode Toggle */}
                <div class="px-6 py-5 border-b-4 border-black bg-gradient-to-r from-purple-50 to-pink-50 flex justify-center">
                  <button
                    onClick={() => {
                      handleVoiceToggle(!voiceEnabled.value);
                      playSound.primaryClick();
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
                    <span class="text-xs opacity-60">ON</span>
                  </button>
                </div>

                {/* Preview Stage */}
                <div class="p-6 bg-gradient-to-br from-amber-50/30 to-pink-50/30">
                  <div
                    class="rounded-3xl border-4 border-black bg-gradient-to-br from-amber-50/50 to-pink-50/50 p-10 flex items-center justify-center min-h-[280px] relative"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fbbf24" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                    }}
                  >
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

                    {/* Shuffle Button */}
                    <button
                      onClick={(e) => {
                        soundService.playDiceRoll();
                        hapticService.diceRoll();

                        const btn = e.currentTarget;
                        btn.style.transform = "scale(0.9)";
                        setTimeout(() => {
                          btn.style.transform = "scale(1.1)";
                        }, 80);
                        setTimeout(() => {
                          btn.style.transform = "scale(1)";
                        }, 200);

                        const event = new CustomEvent("surpriseMe");
                        document.dispatchEvent(event);
                      }}
                      onMouseEnter={(e) => {
                        soundService.playButtonHover();
                        e.currentTarget.style.transform =
                          "scale(1.08) rotate(3deg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1) rotate(0deg)";
                      }}
                      class="absolute top-4 right-4 w-12 h-12 bg-white/90 hover:bg-amber-100 border-3 border-black rounded-xl flex items-center justify-center group transition-all duration-200 ease-out cursor-pointer"
                      title="Shuffle design 🎲"
                      style={{ boxShadow: "2px 2px 0px #000000" }}
                    >
                      <svg
                        class="w-6 h-6 text-black"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7.5 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Text Input Area */}
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
                          playSound.primaryClick();
                          hapticService.buttonPress();
                        }}
                        onMouseEnter={() => soundService.playButtonHover()}
                        placeholder="Type your button text..."
                        maxLength={25}
                        class="w-full px-5 py-4 text-xl font-black bg-white border-4 border-black rounded-2xl focus:bg-orange-50 focus:shadow-lg hover:bg-pink-50 hover:shadow-md hover:-translate-y-0.5 focus:outline-none transition-all duration-300 text-center"
                        style={{ boxShadow: "3px 3px 0px #000000" }}
                      />
                      {customization.value.content.value.length > 18 && (
                        <div class="absolute -bottom-6 right-2 text-xs font-bold text-gray-500">
                          {customization.value.content.value.length}/25
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        handleVoiceToggle(!voiceEnabled.value);
                        if (!voiceEnabled.value) {
                          soundService.playSuccess();
                          hapticService.toggleOn();
                        } else {
                          playSound.primaryClick();
                          hapticService.toggleOff();
                        }
                      }}
                      onMouseEnter={() => soundService.playButtonHover()}
                      class={`px-8 py-4 rounded-2xl border-4 border-black transition-all duration-300 font-black text-xl hover:scale-105 active:scale-95 ${
                        voiceEnabled.value
                          ? "bg-green-300 hover:bg-green-400 text-black"
                          : "bg-amber-200 hover:bg-amber-300 text-black"
                      }`}
                      style={{ boxShadow: "3px 3px 0px #000000" }}
                    >
                      {voiceEnabled.value ? "Live" : "Test"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Mode Selector */}
              <CollapsiblePanel
                id="colors"
                title="Colors"
                color="cyan"
                isExpanded={expandedLeftPanels.value.colors}
                onToggle={toggleLeftPanel}
              >
                <div class="grid grid-cols-2 gap-3 mb-6">
                  {(["pastel", "neon", "classic", "gradient"] as const).map((
                    mode,
                  ) => (
                    <button
                      key={mode}
                      onClick={() => {
                        colorMode.value = mode;
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
                    />
                  ))}
                </div>
              </CollapsiblePanel>

              {/* Size Controls */}
              <CollapsiblePanel
                id="size"
                title="Size & Shape"
                color="green"
                isExpanded={expandedLeftPanels.value.size}
                onToggle={toggleLeftPanel}
              >
                <div class="space-y-8">
                  {sliderConfig
                    .filter((slider) => {
                      if (slider.id === "roundness") {
                        return customization.value.appearance.shape ===
                          "square";
                      }
                      return true;
                    })
                    .map((slider) => {
                      const rawValue =
                        customization.value.appearance[slider.id];
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
                          <div class="flex items-center justify-between">
                            <h3 class="text-xl font-black text-gray-900">
                              {slider.label}
                            </h3>
                            <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-black px-3 py-1 rounded-lg shadow-sm">
                              <span class="text-sm font-bold text-gray-800 font-mono">
                                {cleanValue}
                              </span>
                            </div>
                          </div>
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
                                playSound.sliderStep();
                                hapticService.sliderStep();
                              }}
                              onMouseUp={() => {
                                playSound.sliderRelease();
                                hapticService.sliderRelease();
                              }}
                              class="w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                              style={{
                                background:
                                  `linear-gradient(to right, #ff9eb5 0%, #ff9eb5 ${percentage}%, #f0f0f0 ${percentage}%, #f0f0f0 100%)`,
                                border: "3px solid #000000",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CollapsiblePanel>
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
