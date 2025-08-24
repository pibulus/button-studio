// ===================================================================
// COLOR MODE MANAGER
// Extracted from ButtonStudio.tsx for better organization
// ===================================================================

import { signal } from "@preact/signals";

// Color mode state - Smart unified color system
export const colorMode = signal<"pastel" | "neon" | "classic" | "gradient">(
  "pastel",
);

// Smart unified color system - each mode has its own color palette and style
export const colorModes = {
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
      ["#fbc2eb", "#a6c1ee"],
      ["#667eea", "#764ba2"],
      ["#f093fb", "#f5576c"],
      ["#ff8a80", "#ff80ab"],
      ["#fdcbf1", "#e6dee9"],
      ["#ffc4ef", "#ffdde1"],
    ],
  },
};

// Helper function to get current color palette
export function getCurrentColorPalette() {
  const mode = colorModes[colorMode.value];
  return mode.colors;
}

// Helper function to get fill type for current mode
export function getCurrentFillType() {
  const mode = colorModes[colorMode.value];
  return mode.fillType;
}

// Helper function to cycle through color modes
export function cycleColorMode() {
  const modes = Object.keys(colorModes) as Array<keyof typeof colorModes>;
  const currentIndex = modes.indexOf(colorMode.value);
  const nextIndex = (currentIndex + 1) % modes.length;
  colorMode.value = modes[nextIndex];
}

// Helper function to set specific color mode
export function setColorMode(mode: keyof typeof colorModes) {
  colorMode.value = mode;
}
