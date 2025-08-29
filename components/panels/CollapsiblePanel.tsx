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

  // Each panel gets its own whisper gradient over cream base
  const getInlineStyle = (colorKey: string) => {
    const gradients = {
      red: "linear-gradient(135deg, rgba(255,228,225,0.4) 0%, rgba(255,218,185,0.3) 100%)", // sherbet → peach whisper
      orange: "linear-gradient(135deg, rgba(255,237,213,0.4) 0%, rgba(255,218,225,0.3) 100%)", // warm amber → pink whisper  
      yellow: "linear-gradient(135deg, rgba(255,250,205,0.4) 0%, rgba(255,237,213,0.3) 100%)", // butter → cream whisper
      purple: "linear-gradient(135deg, rgba(255,182,255,0.25) 0%, rgba(230,200,255,0.25) 100%)", // pink → lilac louder
      cyan: "linear-gradient(135deg, rgba(191,244,230,0.4) 0%, rgba(207,230,255,0.3) 100%)", // mint → sky whisper
      green: "linear-gradient(135deg, rgba(203,183,255,0.3) 0%, rgba(255,203,170,0.3) 100%)", // lilac → peach whisper
      light: "linear-gradient(135deg, #FFF9F2 0%, #FFF5E8 100%)", // default cream
    };
    
    // Layer the gradient over a cream base
    return { 
      background: `${gradients[colorKey as keyof typeof gradients] || gradients.light}, #FFF9F2`
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
    <div class="relative rounded-[24px] border-[4px] bg-white overflow-hidden group animate-in fade-in slide-in-from-bottom-2" style={{
      borderColor: "rgba(0,0,0,0.85)",
      animationDelay: `${index * 50}ms`,
      animationDuration: "200ms",
      animationFillMode: "both",
      boxShadow: "-6px 8px 0 0 rgba(0,0,0,0.85), 0 12px 20px rgba(0,0,0,0.12)"
    }}>
      {/* Gradient hairline for open panels */}
      {isExpanded && (
        <div class="absolute -top-[3px] left-[3px] right-[3px] h-[6px] rounded-t-xl bg-gradient-to-r from-[#C9C0FF] via-[#FFCBAA] to-[#BFF4E6]" />
      )}
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class="h-auto w-full px-[28px] py-[22px] flex items-center justify-between rounded-t-[20px] border-b-[4px] font-black hover:brightness-110 active:brightness-95 transition-all duration-150 ease-out"
        style={{
          ...getInlineStyle(color),
          borderColor: "rgba(0,0,0,0.85)",
          willChange: "transform"
        }}
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full opacity-60" style={{
            background: `linear-gradient(90deg, #CBB7FF, #FFCBAA, #BFF4E6)`
          }} />
          <span class="text-lg font-bold tracking-tight">{title}</span>
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
