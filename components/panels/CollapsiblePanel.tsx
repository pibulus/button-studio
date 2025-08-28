import { ComponentChildren } from "preact";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { throttleSound } from "../../utils/audio/throttledSound.ts";
import { gradientSynth } from "../../utils/audio/gradientSynth.ts";

interface CollapsiblePanelProps {
  id: string;
  title: string;
  children: ComponentChildren;
  color?: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  size?: "small" | "medium" | "large";
}

// 🎨 Using proper Tailwind CSS with custom panel colors defined in tailwind.config.ts
// We still keep inline styles as a safety net for absolute reliability

export default function CollapsiblePanel({
  id,
  title,
  children,
  color = "light",
  isExpanded,
  onToggle,
  size = "medium",
}: CollapsiblePanelProps) {
  // 🌈 HARMONIOUS PANEL HEADERS - Each panel gets distinct pastel gradient!
  // These map to our custom panel colors in tailwind.config.ts
  const getBackgroundColor = (colorKey: string) => {
    const colors = {
      red: "bg-panel-red hover:bg-red-300",
      orange: "bg-panel-orange hover:bg-orange-300",
      yellow: "bg-panel-yellow hover:bg-yellow-300",
      purple: "bg-panel-purple hover:bg-purple-300",
      cyan: "bg-panel-cyan hover:bg-cyan-300",
      green: "bg-panel-green hover:bg-green-300",
      light: "bg-gray-200 hover:bg-gray-300",
    };
    return colors[colorKey as keyof typeof colors] || colors.light;
  };

  // Inline gradient styles matching spec colors
  const getInlineStyle = (colorKey: string) => {
    const gradients: Record<string, string> = {
      cyan: "linear-gradient(90deg, #C9F2FF 0%, #C6F8E3 100%)",
      green: "linear-gradient(90deg, #C6F8E3 0%, #EAF7D5 100%)",
      red: "linear-gradient(90deg, #FAD1D7 0%, #F9D5E5 100%)",
      orange: "linear-gradient(90deg, #FFD8A8 0%, #FFE7B4 100%)",
      yellow: "linear-gradient(90deg, #FFE7B4 0%, #FFF1C9 100%)",
      purple: "linear-gradient(90deg, #D9C6FF 0%, #E7D2FF 100%)",
      light: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)",
    };
    return { background: gradients[colorKey] || gradients.light };
  };

  // 🎵 Play gradient sound based on panel color - each panel gets its unique tone!
  const playGradientSound = throttleSound(
    () => {
      // Use synthetic gradient tones for guaranteed pitch differences
      gradientSynth.playGradientTone(color);
    },
    200,
    `gradient-panel-${id}`,
  ); // Throttle per panel with unique key

  // Size-based padding
  const getPadding = () => {
    switch(size) {
      case "small": return "px-6 py-4";
      case "large": return "px-8 py-6";
      default: return "px-7 py-5";
    }
  };

  return (
    <div class="rounded-2xl border-2 border-black/80 bg-white shadow-[0_6px_0_0_rgba(0,0,0,0.12)] overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class="h-12 w-full px-4 flex items-center justify-between rounded-t-2xl border-b-2 border-black/80 font-semibold hover:translate-y-[2px] transition-transform duration-120 ease-out"
        style={getInlineStyle(color)}
      >
        <span>{title}</span>
        <span class={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {isExpanded && (
        <div class="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
