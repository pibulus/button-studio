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
              class={`relative px-6 py-6 rounded-2xl border-3 border-black font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                customization.appearance.shape === shape
                  ? "bg-red-200 text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-red-50"
              }`}
              style={customization.appearance.shape === shape ? {
                boxShadow: "0 0 0 2px transparent, 0 0 0 4px rgba(203,183,255,0.5), 0 0 0 6px rgba(255,203,170,0.3), -6px 8px 0 0 rgba(0,0,0,0.9), 0 12px 30px -12px rgba(0,0,0,0.28)"
              } : {}}
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
              class={`relative px-6 py-6 rounded-2xl border-3 border-black font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                customization.appearance.borderStyle === value
                  ? "bg-red-200 text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-red-50"
              }`}
              style={customization.appearance.borderStyle === value ? {
                boxShadow: "0 0 0 2px transparent, 0 0 0 4px rgba(203,183,255,0.5), 0 0 0 6px rgba(255,203,170,0.3), -6px 8px 0 0 rgba(0,0,0,0.9), 0 12px 30px -12px rgba(0,0,0,0.28)"
              } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
