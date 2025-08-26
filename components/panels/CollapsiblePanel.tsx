import { ComponentChildren } from "preact";
import { playSound } from "../../utils/audio/soundMapping.ts";

interface CollapsiblePanelProps {
  id: string;
  title: string;
  children: ComponentChildren;
  color?: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function CollapsiblePanel({
  id,
  title,
  children,
  color = "light",
  isExpanded,
  onToggle,
}: CollapsiblePanelProps) {
  // 🌈 HARMONIOUS PANEL HEADERS - Each panel gets distinct pastel color!
  const getBackgroundColor = (colorKey: string) => {
    const colors = {
      red: "bg-red-200 hover:bg-red-300",
      orange: "bg-orange-200 hover:bg-orange-300",
      yellow: "bg-yellow-200 hover:bg-yellow-300",
      purple: "bg-purple-200 hover:bg-purple-300",
      light: "bg-gray-200 hover:bg-gray-300",
    };
    return colors[colorKey as keyof typeof colors] || colors.light;
  };

  return (
    <div class="bg-white rounded-3xl shadow-lg border-4 border-black overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
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
}
