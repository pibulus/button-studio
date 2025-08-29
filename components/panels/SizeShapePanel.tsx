import { ButtonCustomization, sliderConfig } from "../../types/customization.ts";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface SizeShapePanelProps {
  customization: ButtonCustomization;
  updateAppearance: (
    key: keyof ButtonCustomization["appearance"],
    value: number | string,
  ) => void;
}

export default function SizeShapePanel({
  customization,
  updateAppearance,
}: SizeShapePanelProps) {
  return (
    <div class="space-y-8">
      {sliderConfig
        .filter((slider) => {
          if (slider.id === "roundness") {
            return customization.appearance.shape === "square";
          }
          return true;
        })
        .map((slider) => {
          const rawValue =
            customization.appearance[
              slider.id as keyof ButtonCustomization["appearance"]
            ];
          const value = typeof rawValue === "number"
            ? rawValue
            : parseFloat(rawValue as string);
          const percentage = ((value - slider.min) /
            (slider.max - slider.min)) * 100;
          return (
            <div key={slider.id}>
              <div class="flex justify-between mb-3">
                <span class="text-sm font-bold text-black/70">
                  {slider.label}
                </span>
                <span class="text-sm font-bold text-black/90 tabular-nums">
                  {slider.id === "borderWidth" ||
                  slider.id === "shadowDistance"
                    ? `${value}px`
                    : slider.id === "roundness"
                    ? `${value}%`
                    : value}
                </span>
              </div>
              <div class="relative">
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={value}
                  onMouseDown={() => {
                    playSound.sliderGrab();
                    hapticService.sliderGrab();
                  }}
                  onChange={(e) => {
                    updateAppearance(
                      slider.id as keyof ButtonCustomization["appearance"],
                      parseFloat(
                        (e.target as HTMLInputElement).value,
                      ),
                    );
                    playSound.sliderStep();
                    hapticService.sliderStep();
                  }}
                  onMouseUp={() => {
                    playSound.sliderRelease();
                    hapticService.sliderRelease();
                  }}
                  class="w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                  style={{
                    background:
                      `linear-gradient(to right, #ff9eb5 0%, #ff9eb5 ${percentage}%, #f0f0f0 ${percentage}%, #f0f0f0 100%)`,
                    border: "3px solid #000000",
                  }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}