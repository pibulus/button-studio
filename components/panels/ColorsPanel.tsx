import { ButtonCustomization } from "../../types/customization.ts";
import { signal } from "@preact/signals";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface ColorsPanelProps {
  customization: ButtonCustomization;
  onChange: (customization: ButtonCustomization) => void;
}

// Color mode state
const colorMode = signal<"pastel" | "neon" | "classic" | "gradient">("pastel");

// Color system
const colorModes = {
  pastel: {
    name: "Pastel",
    fillType: "solid" as const,
    colors: [
      "#ff9eb5",
      "#ffb08a",
      "#ffd4a3",
      "#fff3b8",
      "#c8e6c9",
      "#a8d8d1",
      "#b8d8e0",
      "#d1c4e0",
      "#e6a8d6",
      "#ffb3d1",
      "#ffc4e1",
      "#ff9a8b",
    ],
  },
  neon: {
    name: "Neon",
    fillType: "solid" as const,
    colors: [
      "#ff1493",
      "#ff4500",
      "#ffff00",
      "#7fff00",
      "#00ff7f",
      "#00ffff",
      "#1e90ff",
      "#ff00ff",
      "#ff6347",
      "#ffd700",
      "#00fa9a",
      "#ff69b4",
    ],
  },
  classic: {
    name: "Classic",
    fillType: "solid" as const,
    colors: [
      "#f87171",
      "#fb923c",
      "#fbbf24",
      "#a3e635",
      "#4ade80",
      "#22d3ee",
      "#60a5fa",
      "#818cf8",
      "#a78bfa",
      "#e879f9",
      "#f472b6",
      "#facc15",
    ],
  },
  gradient: {
    name: "Gradient",
    fillType: "gradient" as const,
    colors: [
      ["#ff9a9e", "#fecfef"],
      ["#ffecd2", "#fcb69f"],
      ["#a8edea", "#fed6e3"],
      ["#8fd3f4", "#84fab0"],
      ["#a1c4fd", "#c2e9fb"],
      ["#4facfe", "#00f2fe"],
      ["#fa709a", "#fee140"],
      ["#30cfd0", "#330867"],
      ["#a8ff78", "#78ffd6"],
      ["#ff9a00", "#ff5e62"],
      ["#ff6a88", "#ff99ac"],
      ["#667eea", "#764ba2"],
    ],
  },
};

export default function ColorsPanel({
  customization,
  onChange,
}: ColorsPanelProps) {
  return (
    <>
      <div class="grid grid-cols-2 gap-4 mb-6">
        {(["pastel", "neon", "classic", "gradient"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              colorMode.value = mode;
              const modeConfig = colorModes[mode];
              onChange({
                ...customization,
                appearance: {
                  ...customization.appearance,
                  fillType: modeConfig.fillType,
                },
              });
              playSound.selectionSelect();
              hapticService.buttonPress();
            }}
            onMouseEnter={() => playSound.hover()}
            class={`h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all capitalize hover:shadow-md active:scale-95 ${
              colorMode.value === mode
                ? "bg-purple-200 hover:bg-purple-300 text-black scale-105"
                : "bg-white hover:bg-purple-50 text-black"
            }`}
            style={{
              borderColor: "rgba(0,0,0,0.85)",
              boxShadow: colorMode.value === mode
                ? "4px 4px 0px rgba(0,0,0,0.85)"
                : "2px 2px 0px rgba(0,0,0,0.85)",
            }}
          >
            {colorModes[mode].name}
          </button>
        ))}
      </div>

      <div class="grid grid-cols-6 gap-3">
        {colorModes[colorMode.value].colors.map((color, index) => (
          <button
            key={index}
            onClick={() => {
              const currentMode = colorModes[colorMode.value];
              if (currentMode.fillType === "solid") {
                onChange({
                  ...customization,
                  appearance: {
                    ...customization.appearance,
                    fillType: "solid",
                    solidColor: color as string,
                  },
                });
              } else {
                const gradientColors = color as string[];
                onChange({
                  ...customization,
                  appearance: {
                    ...customization.appearance,
                    fillType: "gradient",
                    gradient: {
                      ...customization.appearance.gradient,
                      start: gradientColors[0],
                      end: gradientColors[1],
                    },
                  },
                });
              }
              playSound.colorSelect();
              hapticService.buttonPress();
            }}
            onMouseEnter={() => playSound.hover()}
            class="h-14 w-full rounded-2xl border-2 hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            style={{
              background:
                colorModes[colorMode.value].fillType === "solid"
                  ? color as string
                  : `linear-gradient(135deg, ${(color as string[])[0]}, ${(color as string[])[1]})`,
              borderColor: "rgba(0,0,0,0.85)",
              boxShadow: "3px 3px 0px rgba(0,0,0,0.85)",
            }}
          />
        ))}
      </div>
    </>
  );
}