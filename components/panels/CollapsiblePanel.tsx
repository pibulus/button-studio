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

  // LO-FI BROADCAST CANDY - Each panel gets ONE hue with gentle same-hue gradient
  const getInlineStyle = (colorKey: string, index: number = 0) => {
    // Design tokens from spec - lo-fi refined colors
    const colors = {
      pink: "#F35C9F",
      coral: "#FF7A66", 
      amber: "#FFB84D",
      mint: "#7ED7B6",
      aqua: "#7ACFEA",
      lilac: "#B9A5F4",
    };
    
    const tints = {
      pink: "#F9CEE1",
      coral: "#FFD5CB",
      amber: "#FFE7BF",
      mint: "#DDF3EA",
      aqua: "#D9F0FA",
      lilac: "#E7E0FB",
    };
    
    // Each panel gets a single-hue gradient from tint to base
    const panelGradients = {
      // Design panel - Coral
      red: `linear-gradient(180deg, ${tints.coral}, ${colors.coral})`,
      
      // Feel panel - Amber
      orange: `linear-gradient(180deg, ${tints.amber}, ${colors.amber})`,
      
      // Ship panel - Mint to lime
      yellow: `linear-gradient(180deg, ${tints.mint}, #D9FF78)`,
      
      // Magic panel - Lilac
      purple: `linear-gradient(180deg, ${tints.lilac}, ${colors.lilac})`,
      
      // Extra panels
      cyan: `linear-gradient(180deg, ${tints.aqua}, ${colors.aqua})`,
      green: `linear-gradient(180deg, ${tints.mint}, ${colors.mint})`,
      light: "linear-gradient(180deg, #FFF9F2, #FFF9F2)",
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
    <div class="relative rounded-[22px] border-[4px] bg-white overflow-hidden group animate-in fade-in slide-in-from-bottom-2" style={{
      borderColor: "rgba(0,0,0,0.92)",
      animationDelay: `${index * 50}ms`,
      animationDuration: "200ms",
      animationFillMode: "both",
      boxShadow: "-6px 8px 0 rgba(0,0,0,0.88), 0 14px 32px -16px rgba(0,0,0,0.24)"
    }}>
      {/* Gradient hairline for open panels */}
      {isExpanded && (
        <div class="absolute -top-[3px] left-[3px] right-[3px] h-[6px] rounded-t-xl bg-gradient-to-r from-[#C9C0FF] via-[#FFCBAA] to-[#BFF4E6]" />
      )}
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class="h-auto w-full px-[22px] py-[18px] flex items-center justify-between rounded-t-[18px] font-black hover:brightness-110 active:brightness-95 transition-all duration-120 ease-out"
        style={{
          ...getInlineStyle(color, index),
          willChange: "transform"
        }}
      >
        <div class="flex items-center gap-2">
          <span class="w-[6px] h-[6px] rounded-full bg-black opacity-40" />
          <span class="text-[18px] font-bold leading-none" style={{ color: "rgba(0,0,0,0.88)" }}>{title}</span>
        </div>
        <span class={`inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-2xl ${isExpanded ? "rotate-180" : ""}`} style={{ willChange: "transform" }}>
          ▾
        </span>
      </button>
      <div class={`overflow-hidden transition-[max-height,opacity] duration-200 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`} style={{ willChange: "max-height" }}>
        <div class={`p-[22px] bg-[#FFF9F2] transform transition-transform duration-140 ease-out origin-top ${
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
