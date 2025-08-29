import { ButtonCustomization } from "../../types/customization.ts";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface DesignPanelProps {
  customization: ButtonCustomization;
  updateAppearance: (
    key: keyof ButtonCustomization["appearance"],
    value: number | string,
  ) => void;
}

export default function DesignPanel(
  { customization, updateAppearance }: DesignPanelProps,
) {
  return (
    <div class="space-y-4">
      {/* Button Shape */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-4">Button Shape</h4>
        <div class="grid grid-cols-2 gap-4">
          {[
            { shape: "circle", label: "Circle" },
            { shape: "square", label: "Square" },
          ].map(({ shape, label }) => (
            <button
              type="button"
              key={shape}
              onClick={() => {
                updateAppearance("shape", shape);
                playSound.selectionSelect();
                hapticService.buttonPress();
              }}
              onMouseEnter={() => playSound.hover()}
              aria-label={`Select ${label} shape`}
              aria-pressed={customization.appearance.shape === shape}
              class={`relative px-[14px] py-[10px] rounded-[14px] border-[3px] font-bold text-[15px] transition-all duration-120 hover:-translate-y-[2px] active:scale-95 ${
                customization.appearance.shape === shape
                  ? "bg-gradient-to-b from-[#FFD5CB] to-[#FF7A66] text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-red-50"
              }`}
              style={{
                borderColor: "rgba(0,0,0,0.92)",
                boxShadow: customization.appearance.shape === shape 
                  ? "-6px 8px 0 rgba(0,0,0,0.88)"
                  : "-4px 6px 0 rgba(0,0,0,0.88)"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Border Style */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-4">Border Style</h4>
        <div class="grid grid-cols-2 gap-4">
          {[
            { value: "solid", label: "Solid" },
            { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" },
            { value: "double", label: "Double" },
          ].map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => {
                updateAppearance("borderStyle", value);
                playSound.selectionSelect();
                hapticService.buttonPress();
              }}
              onMouseEnter={() => playSound.hover()}
              aria-label={`Select ${label} border style`}
              aria-pressed={customization.appearance.borderStyle === value}
              class={`relative px-[14px] py-[10px] rounded-[14px] border-[3px] font-bold text-[15px] transition-all duration-120 hover:-translate-y-[2px] active:scale-95 ${
                customization.appearance.borderStyle === value
                  ? "bg-gradient-to-b from-[#FFD5CB] to-[#FF7A66] text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-red-50"
              }`}
              style={{
                borderColor: "rgba(0,0,0,0.92)",
                boxShadow: customization.appearance.borderStyle === value 
                  ? "-6px 8px 0 rgba(0,0,0,0.88)"
                  : "-4px 6px 0 rgba(0,0,0,0.88)"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
