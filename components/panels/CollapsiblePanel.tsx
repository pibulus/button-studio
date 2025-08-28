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

  // Inline gradient styles for subtle visual flow
  const getInlineStyle = (colorKey: string) => {
    const gradients: Record<string, string> = {
      red: "linear-gradient(135deg, #fecaca 0%, #fdb4b4 100%)",
      orange: "linear-gradient(135deg, #fed7aa 0%, #fdc499 100%)",
      yellow: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      purple: "linear-gradient(135deg, #e9d5ff 0%, #dbb6fc 100%)",
      cyan: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
      green: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      light: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
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

  return (
    <div class="bg-white rounded-2xl shadow-md border-3 border-black overflow-hidden group">
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class={`w-full px-7 py-5 text-left font-black text-black 
          transition-all duration-200 ease-out
          hover:shadow-lg 
          hover:scale-[1.01] hover:brightness-105
          hover:border-opacity-80
          active:scale-[0.99] active:shadow-sm
          transform-gpu
          ${getBackgroundColor(color)}`}
        style={getInlineStyle(color)}
      >
        <div class="flex items-center justify-between">
          <span class="text-lg transition-transform duration-200">{title}</span>
          <span
            class={`text-xl transition-all duration-300 ease-in-out 
              ${isExpanded ? "rotate-180" : "group-hover:rotate-12"}
              group-hover:scale-110`}
          >
            ▼
          </span>
        </div>
      </button>
      {isExpanded && (
        <div class="p-6 border-t-3 border-black">
          {children}
        </div>
      )}
    </div>
  );
}
