import {
  ButtonCustomization,
  ButtonTheme,
  buttonThemes,
  sliderConfig,
} from "../types/customization.ts";
import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { hapticService } from "../utils/audio/hapticService.ts";
import { SOUND_PRESETS, synthEngine } from "../utils/audio/synthEngine.ts";
import { playSound } from "../utils/audio/soundMapping.ts";
import SoundPicker from "./SoundPicker.tsx";
import { ButtonExporter } from "../utils/export/ButtonExporter.ts";
import { toast } from "./Toast.tsx";

interface CustomizationPanelProps {
  customization: ButtonCustomization;
  onChange: (customization: ButtonCustomization) => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;
}

// Collapsible panel state - Updated for 4 consolidated panels
const expandedPanels = signal<Record<string, boolean>>({
  design: true,
  feel: false,
  magic: false,
  ship: false,
});

export default function CustomizationPanel(
  { customization, onChange, voiceEnabled = false, onVoiceToggle }:
    CustomizationPanelProps,
) {
  // ===================================================================
  // STATE UPDATE HANDLERS - Clean, typed state management
  // ===================================================================

  const updateAppearance = (
    key: keyof ButtonCustomization["appearance"],
    value: number | string,
  ) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        [key]: value,
      },
    });
  };

  const updateInteraction = (
    key: keyof ButtonCustomization["interactions"],
    value: string | number,
  ) => {
    onChange({
      ...customization,
      interactions: {
        ...customization.interactions,
        [key]: value,
      },
    });
  };

  // Smart effect toggling - handles conflicts between similar effects
  const updateEffect = (
    key: keyof ButtonCustomization["effects"],
    value: boolean,
  ) => {
    let newEffects = { ...customization.effects };

    if (
      value && (key === "breathing" || key === "bounce" || key === "wiggle")
    ) {
      // Movement effects - turn off the others when enabling one
      newEffects.breathing = key === "breathing";
      newEffects.bounce = key === "bounce";
      newEffects.wiggle = key === "wiggle";
    } else if (value && key === "glow") {
      // Visual border effects
      newEffects.glow = true;
    } else {
      // Non-conflicting effects (pulse can work with anything)
      newEffects[key] = value;
    }

    onChange({
      ...customization,
      effects: newEffects,
    });
  };

  const updateRecording = (
    key: keyof ButtonCustomization["recording"],
    value: string | number | boolean,
  ) => {
    onChange({
      ...customization,
      recording: {
        ...customization.recording,
        [key]: value,
      },
    });
  };

  // ===================================================================
  // EXPORT SYSTEM - The journey completion!
  // ===================================================================

  const handleExport = async (exportType: string) => {
    try {
      // Play export sound with sparkles!
      playSound.export();
      hapticService.buttonPress();

      // Get API key if available (from voice panel)
      const apiKeyInput = document.querySelector(
        'input[type="password"]',
      ) as HTMLInputElement;
      const apiKey = apiKeyInput?.value || undefined;

      // Create exporter
      const exporter = new ButtonExporter(customization, apiKey);

      let result;

      switch (exportType) {
        case "html":
          result = exporter.generateHTML({
            includeAI: !!apiKey,
            customBranding: false,
          });
          if (result.success && result.data) {
            downloadFile(
              result.data as string,
              result.downloadName!,
              "text/html",
            );
            toast.success("🎉 HTML file downloaded!");
          }
          break;

        case "share":
          result = exporter.generateShareLink({
            title: customization.content.label || "Voice Button",
          });
          if (result.success && result.data) {
            await navigator.clipboard.writeText(result.data as string);
            toast.success("🔗 Share link copied to clipboard!");
          }
          break;

        default:
          toast.info("✨ Feature coming soon!");
          return;
      }

      if (result && result.success) {
        // Celebration sound!
        setTimeout(() => playSound.celebration(), 500);
      } else if (result && !result.success) {
        toast.error(`❌ Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("❌ Export failed. Please try again.");
    }
  };

  // Helper function to download files
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ===================================================================
  // PANEL MANAGEMENT - Accordion-style collapsible sections
  // ===================================================================

  const togglePanel = (panelId: string) => {
    const isOpening = !expandedPanels.value[panelId];

    expandedPanels.value = {
      ...expandedPanels.value,
      [panelId]: isOpening,
    };

    // Sound and haptic feedback
    if (isOpening) {
      playSound.panelOpen();
      hapticService.panelOpen();
    } else {
      playSound.panelClose();
      hapticService.panelClose();
    }
  };

  // Collapsible Panel Component
  const CollapsiblePanel = (
    { id, title, children, color = "light" }: {
      id: string;
      title: string;
      children: any;
      color?: string;
    },
  ) => {
    const isExpanded = expandedPanels.value[id];

    // 🌈 VIBRANT PANEL HEADERS - Each panel gets distinct bright color!
    const getBackgroundColor = (colorKey: string) => {
      const colors = {
        red: "bg-red-300 hover:bg-red-400",
        orange: "bg-orange-300 hover:bg-orange-400", 
        yellow: "bg-yellow-300 hover:bg-yellow-400",
        purple: "bg-purple-300 hover:bg-purple-400",
      };
      return colors[colorKey as keyof typeof colors] || colors.red;
    };

    return (
      <div class="bg-white rounded-3xl shadow-lg border-4 border-black overflow-hidden">
        <button
          onClick={() => togglePanel(id)}
          onMouseEnter={() => playSound.hover()}
          class={`w-full px-8 py-6 text-left font-black text-black transition-all duration-200 ${
            getBackgroundColor(color)
          } shadow-sm hover:shadow-md active:shadow-sm`}
        >
          <div class="flex items-center justify-between">
            <span class="text-xl">{title}</span>
            <span
              class={`text-2xl transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </div>
        </button>
        {isExpanded && (
          <div class="p-8 border-t-4 border-black">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div class="space-y-4">
      {/* 🍊 LUSH JUICE ANIMATIONS + EFFECTS */}
      <style jsx>
        {`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce-demo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes glow-demo {
          0%, 100% { 
            box-shadow: 2px 2px 0px #000000, 0 0 8px rgba(34, 197, 94, 0.3);
          }
          50% { 
            box-shadow: 2px 2px 0px #000000, 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4);
          }
        }
        
        @keyframes wiggle-demo {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        
        .effect-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        
        .effect-bounce {
          animation: bounce-demo 1.5s ease-in-out infinite;
        }
        
        .effect-glow {
          animation: glow-demo 2s ease-in-out infinite;
        }
        
        .effect-wiggle {
          animation: wiggle-demo 2s ease-in-out infinite;
        }
        `}
      </style>

      {/* 📐 Design Panel */}
      <CollapsiblePanel id="design" title="📐 Design" color="red">
        <div class="space-y-4">
          {/* Button Shape */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Button Shape</h4>
            <div class="grid grid-cols-3 gap-4">
              {[
                { shape: "circle", label: "Circle" },
                { shape: "rounded", label: "Rounded" },
                { shape: "square", label: "Square" },
              ].map(({ shape, label }) => (
                <button
                  key={shape}
                  onClick={() => {
                    updateAppearance("shape", shape);
                    playSound.selectionSelect();
                    hapticService.buttonPress();
                  }}
                  class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                    customization.appearance.shape === shape
                      ? "bg-red-200 text-black shadow-xl scale-105"
                      : "bg-white text-black hover:bg-red-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Style */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Border Style</h4>
            <div class="grid grid-cols-2 gap-4">
              {[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    updateAppearance("borderStyle", value);
                    playSound.selectionSelect();
                    hapticService.buttonPress();
                  }}
                  class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                    customization.appearance.borderStyle === value
                      ? "bg-red-200 text-black shadow-xl scale-105"
                      : "bg-white text-black hover:bg-red-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      {/* 🎭 Feel Panel */}
      <CollapsiblePanel id="feel" title="🎭 Feel" color="orange">
        <div class="space-y-6">
          {/* Effects */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Effects</h4>
            <div class="grid grid-cols-2 gap-4">
              {[
                { key: "breathing", label: "Breathe", demoClass: "effect-breathe" },
                { key: "bounce", label: "Bounce", demoClass: "effect-bounce" },
                { key: "glow", label: "Glow", demoClass: "" },
              ].map(({ key, label, demoClass }) => {
                const isActive = customization.effects[key as keyof ButtonCustomization["effects"]];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      updateEffect(
                        key as keyof ButtonCustomization["effects"],
                        !isActive,
                      );
                      playSound.selectionSelect();
                      hapticService.buttonPress();
                    }}
                    class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                      isActive
                        ? "bg-orange-200 text-black shadow-xl scale-105"
                        : `bg-white text-black hover:bg-orange-50 ${demoClass}`
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hover Effects */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Hover Effects</h4>
            <div class="grid grid-cols-2 gap-3">
              {[
                { value: "none", label: "None" },
                { value: "lift", label: "Lift" },
                { value: "glow", label: "Glow" },
                { value: "pulse", label: "Pulse" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    updateInteraction("hoverEffect", value);
                    playSound.selectionSelect();
                    hapticService.buttonPress();
                  }}
                  class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all shadow-sm hover:shadow-md active:scale-95 ${
                    customization.interactions.hoverEffect === value
                      ? "bg-orange-200 hover:bg-orange-300 text-black shadow-md scale-105"
                      : "bg-white hover:bg-orange-50 text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      {/* ✨ Magic Panel */}
      <CollapsiblePanel id="magic" title="✨ Magic" color="yellow">
        <div class="space-y-6">
          {/* API Configuration */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Voice Magic Setup</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-black text-black mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  class="w-full px-4 py-3 bg-white border-3 border-black rounded-xl focus:bg-yellow-50 focus:outline-none transition-all font-mono text-sm shadow-sm focus:shadow-md"
                />
              </div>
              <div class="text-xs text-gray-600">
                💡 Get your free key at{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  class="text-blue-600 underline"
                >
                  aistudio.google.com/apikey
                </a>
              </div>
            </div>
          </div>

          {/* Recording Behavior */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Recording Behavior</h4>
            <div class="grid grid-cols-2 gap-3">
              {[
                { value: "timer", label: "Timer", icon: "⏱️" },
                { value: "pulse", label: "Pulse", icon: "💓" },
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    updateRecording("visualFeedback", value);
                    playSound.selectionSelect();
                    hapticService.buttonPress();
                  }}
                  class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 ${
                    customization.recording.visualFeedback === value
                      ? "bg-yellow-200 hover:bg-yellow-300 text-black shadow-md scale-105"
                      : "bg-white hover:bg-yellow-50 text-black"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      {/* 🚀 Ship Panel */}
      <CollapsiblePanel id="ship" title="🚀 Ship" color="purple">
        <div class="space-y-6">
          {/* Export Options */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4">Save & Share Your Creation</h4>
            <div class="grid grid-cols-2 gap-4">
              {/* HTML Export */}
              <button
                onClick={() => handleExport("html")}
                onMouseEnter={() => playSound.hover()}
                class="group p-4 bg-gradient-to-br from-green-100 to-green-200 border-3 border-black rounded-2xl font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1"
                style={{
                  boxShadow: "4px 4px 0px #000000",
                }}
              >
                <div class="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  💾
                </div>
                <div class="text-sm font-black">HTML File</div>
                <div class="text-xs text-gray-600 font-bold mt-1">
                  Standalone webpage
                </div>
              </button>

              {/* Share Link */}
              <button
                onClick={() => handleExport("share")}
                onMouseEnter={() => playSound.hover()}
                class="group p-4 bg-gradient-to-br from-orange-100 to-orange-200 border-3 border-black rounded-2xl font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1"
                style={{
                  boxShadow: "4px 4px 0px #000000",
                }}
              >
                <div class="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  🔗
                </div>
                <div class="text-sm font-black">Share Link</div>
                <div class="text-xs text-gray-600 font-bold mt-1">
                  Instant sharing
                </div>
              </button>
            </div>
          </div>

          {/* Premium hint */}
          <div class="text-center text-xs text-gray-500 border-t-2 border-gray-200 pt-4">
            🎲 Made with <span class="font-black">ButtonStudio</span> - Where voice buttons come alive!
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  );
}