import { ComponentChildren } from "preact";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { throttleSound } from "../../utils/audio/throttledSound.ts";
import { gradientSynth } from "../../utils/audio/gradientSynth.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

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
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  toggleLabel?: string;
}

// 🎨 Clean three-wrapper pattern for perfect rendering
// No more jagged corners, shadow clipping, or double borders!

export default function CollapsiblePanel({
  id,
  title,
  children,
  color = "light",
  isExpanded,
  onToggle,
  size: _size = "medium",
  index = 0,
  special = false,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  toggleLabel: _toggleLabel = "Enable",
}: CollapsiblePanelProps) {
  // Lo-fi rainbow palette - lighter, softer colors for better visibility
  const getPanelColor = (colorKey: string) => {
    const panelColors = {
      violet: "var(--violet-light, #C8B9F2)", // Lighter violet
      pink: "var(--magenta-light, #EBABE6)", // Lighter magenta
      red: "var(--pink-light, #F4C0D5)", // Lighter pink
      orange: "var(--coral-light, #F2C1B3)", // Lighter coral
      yellow: "var(--amber-light, #F2D99B)", // Lighter amber
      purple: "var(--lime-light, #D4E6A8)", // Lighter lime
      light: "var(--panel, #FFF9F2)",
    };

    return panelColors[colorKey as keyof typeof panelColors] ||
      panelColors.light;
  };

  // 🎵 Play gradient sound based on panel color
  const playGradientSound = throttleSound(
    () => {
      gradientSynth.playGradientTone(color);
    },
    200,
    `gradient-panel-${id}`,
  );

  return (
    <div
      class="group relative isolation-isolate"
      style={{
        animationDelay: `${index * 50}ms`,
        animationDuration: "200ms",
        animationFillMode: "both",
        zIndex: isExpanded ? 1 : 0,
      }}
    >
      {/* Outer wrapper: owns the drop shadow only */}
      <div
        class="panel-outer relative"
        style={{
          filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35))",
          borderRadius: "var(--r, 22px)",
        }}
      >
        {/* Middle wrapper: has the border and clips content */}
        <div
          class="panel-border bg-white overflow-hidden"
          style={{
            borderRadius: "var(--r, 22px)",
            border: "var(--b, 3px) solid rgba(0,0,0,0.92)",
            background: "var(--panel, #FFF9F2)",
          }}
        >
          {/* Summary header */}
          <button
            type="button"
            onClick={() => onToggle(id)}
            onMouseEnter={() => playGradientSound()}
            class="panel-summary list-none cursor-pointer h-[58px] w-full px-[22px] flex items-center justify-between select-none font-black hover:brightness-105 active:brightness-95 transition-all duration-120 ease-out"
            style={{
              background: getPanelColor(color),
              borderRadius: isExpanded
                ? "0"
                : "calc(var(--r, 22px) - var(--b, 3px))",
              borderBottom: isExpanded
                ? "var(--b, 3px) solid rgba(0,0,0,0.12)"
                : "none",
            }}
          >
            <div class="flex items-center">
              {/* Proper centered dot element */}
              <span
                class="inline-block w-[6px] h-[6px] rounded-full mr-3"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  transform: "translateY(0.5px)",
                }}
              />
              <span
                class="text-[19px] font-bold leading-none"
                style={{ color: "rgba(0,0,0,0.85)" }}
              >
                {title}
              </span>
            </div>
            <div class="flex items-center gap-3">
              {/* Optional toggle switch */}
              {showToggle && onToggleChange && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent panel collapse
                    onToggleChange(!toggleValue);
                    playSound.primaryClick();
                    hapticService.buttonPress();
                  }}
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-black/80 font-black text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: toggleValue ? "#EA4C89" : "#F3E9DD",
                    color: toggleValue ? "#FFFFFF" : "rgba(0,0,0,0.5)",
                    boxShadow: "2px 2px 0px rgba(0,0,0,0.85)",
                  }}
                >
                  <span class="text-base">{toggleValue ? "🎙️" : "🔇"}</span>
                  <span>{toggleValue ? "On" : "Off"}</span>
                </button>
              )}
              <span
                class="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-2xl"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  willChange: "transform",
                }}
              >
                ▾
              </span>
            </div>
          </button>

          {/* Content body */}
          <div
            class={`panel-body overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
            style={{ willChange: "max-height" }}
          >
            <div
              class="p-[22px]"
              style={{
                background: special && id === "magic"
                  ? `radial-gradient(circle at 20% 80%, rgba(203,183,255,0.02) 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, rgba(255,203,170,0.02) 0%, transparent 50%),
                     radial-gradient(circle at 40% 40%, rgba(191,244,230,0.02) 0%, transparent 50%),
                     var(--panel, #FFF9F2)`
                  : "var(--panel, #FFF9F2)",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
