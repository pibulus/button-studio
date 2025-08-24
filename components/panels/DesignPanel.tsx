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
              key={shape}
              onClick={() => {
                updateAppearance("shape", shape);
                playSound.selectionSelect();
                hapticService.buttonPress();
              }}
              class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                customization.appearance.shape === shape
                  ? "bg-red-200 text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-red-50"
              }`}
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
              key={value}
              onClick={() => {
                updateAppearance("borderStyle", value);
                playSound.selectionSelect();
                hapticService.buttonPress();
              }}
              class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                customization.appearance.borderStyle === value
                  ? "bg-red-200 text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-red-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
