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
        <div class="grid grid-cols-2 gap-3">
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
              class={`h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all capitalize hover:shadow-md active:scale-95 ${
                customization.appearance.shape === shape
                  ? "bg-pink-200 hover:bg-pink-300 text-black scale-105"
                  : "bg-white hover:bg-pink-50 text-black"
              }`}
              style={{
                borderColor: "rgba(0,0,0,0.85)",
                boxShadow: customization.appearance.shape === shape
                  ? "4px 4px 0px rgba(0,0,0,0.85)"
                  : "2px 2px 0px rgba(0,0,0,0.85)",
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
        <div class="grid grid-cols-2 gap-3">
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
              class={`h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all capitalize hover:shadow-md active:scale-95 ${
                customization.appearance.borderStyle === value
                  ? "bg-pink-200 hover:bg-pink-300 text-black scale-105"
                  : "bg-white hover:bg-pink-50 text-black"
              }`}
              style={{
                borderColor: "rgba(0,0,0,0.85)",
                boxShadow: customization.appearance.borderStyle === value
                  ? "4px 4px 0px rgba(0,0,0,0.85)"
                  : "2px 2px 0px rgba(0,0,0,0.85)",
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
