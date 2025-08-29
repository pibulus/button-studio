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
  index?: number;
  special?: boolean;
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
  index = 0,
  special = false,
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

  // RETRO LO-FI RAINBOW - More colorful headers with flatter gradients
  const getInlineStyle = (colorKey: string, index: number = 0) => {
    // Rainbow spectrum with higher opacity for headers (0.65-0.75)
    const rainbowStops = [
      "rgba(255, 179, 186, 0.7)", // soft pink
      "rgba(255, 223, 186, 0.7)", // peach
      "rgba(255, 255, 186, 0.7)", // butter yellow
      "rgba(186, 255, 201, 0.7)", // mint green
      "rgba(186, 225, 255, 0.7)", // sky blue
      "rgba(203, 186, 255, 0.7)", // lavender
      "rgba(255, 186, 255, 0.7)", // soft magenta
    ];
    
    // Flatter gradients - smaller color shift within each panel
    const panelGradients = {
      red: `linear-gradient(180deg, ${rainbowStops[0]} 0%, rgba(255, 200, 186, 0.65) 100%)`,
      orange: `linear-gradient(180deg, ${rainbowStops[1]} 0%, rgba(255, 240, 186, 0.65) 100%)`,
      yellow: `linear-gradient(180deg, ${rainbowStops[2]} 0%, rgba(220, 255, 186, 0.65) 100%)`,
      purple: `linear-gradient(180deg, ${rainbowStops[5]} 0%, rgba(230, 186, 255, 0.65) 100%)`,
      cyan: `linear-gradient(180deg, ${rainbowStops[3]} 0%, rgba(186, 240, 230, 0.65) 100%)`,
      green: `linear-gradient(180deg, ${rainbowStops[4]} 0%, rgba(186, 210, 255, 0.65) 100%)`,
      light: "linear-gradient(180deg, #FFFBF7 0%, #FFF8F2 100%)",
    };
    
    return { 
      background: panelGradients[colorKey as keyof typeof panelGradients] || panelGradients.light
    };
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
    <div class="relative rounded-[20px] border-[4px] bg-white overflow-hidden group animate-in fade-in slide-in-from-bottom-2" style={{
      borderColor: "#000000",
      animationDelay: `${index * 50}ms`,
      animationDuration: "200ms",
      animationFillMode: "both",
      boxShadow: "4px 4px 0 0 rgba(0,0,0,0.8)"
    }}>
      {/* Gradient hairline for open panels */}
      {isExpanded && (
        <div class="absolute -top-[3px] left-[3px] right-[3px] h-[6px] rounded-t-xl bg-gradient-to-r from-[#C9C0FF] via-[#FFCBAA] to-[#BFF4E6]" />
      )}
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class="h-auto w-full px-[24px] py-[20px] flex items-center justify-between rounded-t-[16px] font-black hover:brightness-110 active:brightness-95 transition-all duration-150 ease-out"
        style={{
          ...getInlineStyle(color, index),
          willChange: "transform"
        }}
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full opacity-60" style={{
            background: `linear-gradient(90deg, #CBB7FF, #FFCBAA, #BFF4E6)`
          }} />
          <span class="text-xl font-black tracking-tight">{title}</span>
        </div>
        <span class={`inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-2xl ${isExpanded ? "rotate-180" : ""}`} style={{ willChange: "transform" }}>
          ▾
        </span>
      </button>
      <div class={`overflow-hidden transition-[max-height,opacity] duration-200 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`} style={{ willChange: "max-height" }}>
        <div class={`p-[24px] bg-white transform transition-transform duration-200 ease-out origin-top ${
          isExpanded ? "translate-y-0 scale-100" : "-translate-y-2 scale-[0.98]"
        }`} style={{
          ...(special && id === "magic" && {
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(203,183,255,0.02) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,203,170,0.02) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(191,244,230,0.02) 0%, transparent 50%)`
          })
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
