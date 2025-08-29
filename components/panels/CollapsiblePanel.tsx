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
    <div class="rounded-3xl border-4 bg-white overflow-hidden group" style={{
      borderColor: "rgba(0,0,0,0.9)"
    }}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class="h-16 w-full px-7 py-5 flex items-center justify-between rounded-t-3xl border-b-3 font-black hover:brightness-110 transition-all duration-200 ease-out"
        style={{
          ...getInlineStyle(color),
          borderColor: "rgba(0,0,0,0.9)"
        }}
      >
        <span class="text-xl font-black tracking-tight">{title}</span>
        <span class={`transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] text-2xl ${isExpanded ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      <div class={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div class={`p-5 bg-white transition-transform duration-300 ease-out origin-top ${
          isExpanded ? "scale-y-100" : "scale-y-95"
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
}
