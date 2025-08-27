import { ComponentChildren } from "preact";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { throttleSound } from "../../utils/audio/throttledSound.ts";

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
  // 🌈 HARMONIOUS PANEL HEADERS - Each panel gets distinct pastel color!
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

  // Inline style safety net - keeping for absolute reliability
  const getInlineStyle = (colorKey: string) => {
    const colors: Record<string, string> = {
      red: "#fecaca",
      orange: "#fed7aa",
      yellow: "#fef3c7",
      purple: "#e9d5ff",
      cyan: "#cffafe",
      green: "#d1fae5",
      light: "#e5e7eb",
    };
    return { backgroundColor: colors[colorKey] || colors.light };
  };

  // 🎵 Play gradient sound based on panel color - each panel gets its unique tone!
  const playGradientSound = throttleSound(
    () => playSound.gradientPanel(color as any),
    200,
    `gradient-panel-${id}`,
  ); // Throttle per panel with unique key

  return (
    <div class="bg-white rounded-3xl shadow-lg border-4 border-black overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class={`w-full px-8 py-6 text-left font-black text-black transition-all duration-200 shadow-sm hover:shadow-md active:shadow-sm ${
          getBackgroundColor(color)
        }`}
        style={getInlineStyle(color)}
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
}
