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
    <div class="space-y-3">
      {/* Movement Effects */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-3">Movement Effects</h4>
        <div class="grid grid-cols-2 gap-3">
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
              class={`h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all capitalize hover:shadow-md active:scale-95 ${
                customization
                    .effects[effect as keyof ButtonCustomization["effects"]]
                  ? "bg-orange-200 hover:bg-orange-300 text-black scale-105"
                  : "bg-white hover:bg-orange-50 text-black"
              }`}
              style={{
                borderColor: "rgba(0,0,0,0.85)",
                boxShadow: customization.effects[effect as keyof ButtonCustomization["effects"]]
                  ? "4px 4px 0px rgba(0,0,0,0.85)"
                  : "2px 2px 0px rgba(0,0,0,0.85)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Effects */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-3">Visual Effects</h4>
        <div class="grid grid-cols-3 gap-3">
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
              class={`h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all capitalize hover:shadow-md active:scale-95 ${
                customization
                    .effects[effect as keyof ButtonCustomization["effects"]]
                  ? "bg-orange-200 hover:bg-orange-300 text-black scale-105"
                  : "bg-white hover:bg-orange-50 text-black"
              }`}
              style={{
                borderColor: "rgba(0,0,0,0.85)",
                boxShadow: customization.effects[effect as keyof ButtonCustomization["effects"]]
                  ? "4px 4px 0px rgba(0,0,0,0.85)"
                  : "2px 2px 0px rgba(0,0,0,0.85)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Themes */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-3">Preset Themes</h4>
        <div class="grid grid-cols-2 gap-3">
          {Object.entries(buttonThemes).map(([key, theme]) => (
            <button
              type="button"
              key={key}
              onClick={() => {
                applyTheme(theme);
                playSound.selectionSelect();
                hapticService.success();
              }}
              class="h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all capitalize hover:shadow-md active:scale-95 bg-white hover:bg-orange-50 text-black"
              style={{
                borderColor: "rgba(0,0,0,0.85)",
                boxShadow: "2px 2px 0px rgba(0,0,0,0.85)",
              }}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
