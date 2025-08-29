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

// 🎨 Using inline styles for panel colors for absolute reliability
// Flat color blocks create the "stacked candy bar" visual hierarchy

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
  // FLAT STRIPE BLOCKS - Each panel gets one solid color, no gradients
  const getPanelColor = (colorKey: string) => {
    // Lo-fi rainbow palette - muted, harmonious colors
    const panelColors = {
      // Colors panel - Violet
      violet: "var(--violet, #9D7CE2)",
      
      // Size & Shape panel - Magenta  
      pink: "var(--magenta, #DA7AD1)",
      
      // Design panel - Pink
      red: "var(--pink, #EA8FB4)",
      
      // Feel panel - Coral
      orange: "var(--coral, #E79A86)",
      
      // Ship panel - Amber
      yellow: "var(--amber, #E6BF6B)",
      
      // Magic panel - Lime
      purple: "var(--lime, #B4D47A)",
      
      // Default panel background
      light: "var(--panel, #FFF9F2)",
    };
    
    return { 
      background: panelColors[colorKey as keyof typeof panelColors] || panelColors.light
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
    <div class="relative rounded-[22px] border-[4px] bg-white group animate-in fade-in slide-in-from-bottom-2" style={{
      borderColor: "rgba(0,0,0,0.92)",
      animationDelay: `${index * 50}ms`,
      animationDuration: "200ms",
      animationFillMode: "both",
      filter: "drop-shadow(-6px 8px 0 rgba(0,0,0,0.9))"
    }}>
      {/* Gradient hairline for open panels */}
      {isExpanded && (
        <div class="absolute -top-[3px] left-[3px] right-[3px] h-[6px] rounded-t-xl bg-gradient-to-r from-[#C9C0FF] via-[#FFCBAA] to-[#BFF4E6]" />
      )}
      <button
        type="button"
        onClick={() => onToggle(id)}
        onMouseEnter={() => playGradientSound()}
        class="h-[52px] w-full px-[22px] flex items-center justify-between rounded-t-[18px] font-black hover:brightness-110 active:brightness-95 transition-all duration-120 ease-out"
        style={{
          ...getPanelColor(color),
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
