import {
  ButtonCustomization,
  sliderConfig,
} from "../../types/customization.ts";
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
    <>
      <style>
        {`
          /* Big chunky slider thumbs - Cyan edition */
          .chunky-slider::-webkit-slider-thumb {
            appearance: none;
            width: 40px !important;
            height: 40px !important;
            background: #67E8F9 !important;
            border: 3px solid rgba(0,0,0,0.9) !important;
            border-radius: 50% !important;
            cursor: grab !important;
            box-shadow: 0 2px 0 0 rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15) !important;
            transition: all 0.2s ease !important;
          }

          .chunky-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 3px 0 0 rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.2) !important;
            background: #22D3EE !important;
          }

          .chunky-slider::-webkit-slider-thumb:active {
            cursor: grabbing !important;
            transform: scale(0.95) !important;
            background: #06B6D4 !important;
          }

          .chunky-slider::-moz-range-thumb {
            width: 40px !important;
            height: 40px !important;
            background: #67E8F9 !important;
            border: 3px solid rgba(0,0,0,0.9) !important;
            border-radius: 50% !important;
            cursor: grab !important;
            box-shadow: 0 2px 0 0 rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15) !important;
            transition: all 0.2s ease !important;
          }

          .chunky-slider::-moz-range-thumb:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 3px 0 0 rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.2) !important;
            background: #22D3EE !important;
          }

          .chunky-slider::-moz-range-thumb:active {
            cursor: grabbing !important;
            transform: scale(0.95) !important;
            background: #06B6D4 !important;
          }
        `}
      </style>
      <div class="space-y-8">
        {sliderConfig
          .filter((slider) => {
            if (slider.id === "roundness") {
              return customization.appearance.shape === "square";
            }
            return true;
          })
          .map((slider) => {
            const rawValue = customization.appearance[
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
                    class="chunky-slider w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
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
    </>
  );
}
