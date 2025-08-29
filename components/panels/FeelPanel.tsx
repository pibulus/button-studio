import {
  ButtonCustomization,
  ButtonTheme,
  buttonThemes,
} from "../../types/customization.ts";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface FeelPanelProps {
  customization: ButtonCustomization;
  updateEffect: (
    key: keyof ButtonCustomization["effects"],
    value: boolean,
  ) => void;
  applyTheme: (theme: ButtonTheme) => void;
}

export default function FeelPanel({
  customization,
  updateEffect,
  applyTheme,
}: FeelPanelProps) {
  return (
    <div class="space-y-4">
      {/* Movement Effects */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-4">Movement Effects</h4>
        <div class="grid grid-cols-2 gap-4">
          {[
            { effect: "breathing", label: "Breathing" },
            { effect: "bounce", label: "Bounce" },
          ].map(({ effect, label }) => (
            <button
              type="button"
              key={effect}
              onClick={() => {
                const isCurrentlyOn = customization
                  .effects[effect as keyof ButtonCustomization["effects"]];
                updateEffect(
                  effect as keyof ButtonCustomization["effects"],
                  !isCurrentlyOn,
                );
                // Play appropriate sound based on toggle state
                if (isCurrentlyOn) {
                  playSound.toggleOff();
                } else {
                  playSound.toggleOn();
                }
                hapticService.buttonPress();
              }}
              onMouseEnter={() => playSound.hover()}
              class={`relative px-6 py-6 rounded-2xl border-3 border-black font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                customization
                    .effects[effect as keyof ButtonCustomization["effects"]]
                  ? "bg-orange-200 text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-orange-50"
              }`}
              style={customization.effects[effect as keyof ButtonCustomization["effects"]] ? {
                boxShadow: "0 0 0 2px transparent, 0 0 0 4px rgba(203,183,255,0.5), 0 0 0 6px rgba(255,203,170,0.3), -6px 8px 0 0 rgba(0,0,0,0.9), 0 12px 30px -12px rgba(0,0,0,0.28)"
              } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Effects */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-4">Visual Effects</h4>
        <div class="grid grid-cols-3 gap-4">
          {[
            { effect: "glow", label: "Glow" },
            { effect: "flat", label: "Flat" },
            { effect: "shine", label: "Shine" },
          ].map(({ effect, label }) => (
            <button
              type="button"
              key={effect}
              onClick={() => {
                const isCurrentlyOn = customization
                  .effects[effect as keyof ButtonCustomization["effects"]];
                updateEffect(
                  effect as keyof ButtonCustomization["effects"],
                  !isCurrentlyOn,
                );
                // Play appropriate sound based on toggle state
                if (isCurrentlyOn) {
                  playSound.toggleOff();
                } else {
                  playSound.toggleOn();
                }
                hapticService.buttonPress();
              }}
              onMouseEnter={() => playSound.hover()}
              class={`relative px-6 py-6 rounded-2xl border-3 border-black font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                customization
                    .effects[effect as keyof ButtonCustomization["effects"]]
                  ? "bg-orange-200 text-black shadow-xl scale-105"
                  : "bg-white text-black hover:bg-orange-50"
              }`}
              style={customization.effects[effect as keyof ButtonCustomization["effects"]] ? {
                boxShadow: "0 0 0 2px transparent, 0 0 0 4px rgba(203,183,255,0.5), 0 0 0 6px rgba(255,203,170,0.3), -6px 8px 0 0 rgba(0,0,0,0.9), 0 12px 30px -12px rgba(0,0,0,0.28)"
              } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Themes */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-4">Preset Themes</h4>
        <div class="grid grid-cols-2 gap-4">
          {Object.entries(buttonThemes).map(([key, theme]) => (
            <button
              type="button"
              key={key}
              onClick={() => {
                applyTheme(theme);
                playSound.selectionSelect();
                hapticService.success();
              }}
              class="px-6 py-6 rounded-2xl border-3 border-black font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-black hover:bg-orange-50"
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
