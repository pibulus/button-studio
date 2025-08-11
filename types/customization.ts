// ===================================================================
// BUTTON CUSTOMIZATION TYPES - Complete button design system
// ===================================================================
// Comprehensive interface for all button appearance, behavior, and functionality

export type ButtonTheme = "minimal" | "warm" | "professional" | "lush";
export type ColorIntensity = "pastel" | "neon";

// Smart contrast utility - determines if a color is light or dark
export function getSmartTextColor(backgroundColor: string): "black" | "white" {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance using standard formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "black" : "white";
}

// Main customization interface - everything configurable about a button
export interface ButtonCustomization {
  // Visual Properties
  appearance: {
    theme: ButtonTheme;
    colorIntensity: ColorIntensity; // NEW: Pastel vs Neon toggle
    fillType: "solid" | "gradient";
    solidColor: string; // Hex color for solid fills
    shape: "circle" | "rounded" | "square";
    scale: number; // 0.5-2.0x multiplier (Size)
    roundness: number; // 0-50px border radius
    borderWidth: number; // 0-10px border thickness
    shadowType: "brutalist" | "diffused"; // Shadow style
    borderStyle: "solid" | "dashed" | "dotted" | "double"; // Border style
    gradient: {
      start: string; // Hex color for gradient start
      end: string; // Hex color for gradient end
      direction: number; // 0-360 degrees
    };
    textColor: "auto" | "black" | "white"; // Auto for smart contrast
  };

  // Interaction Effects
  interactions: {
    hoverEffect: "none" | "lift" | "glow" | "pulse" | "rotate";
    clickAnimation: "none" | "bounce" | "shrink" | "spin" | "flash";
    textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
    fontWeight: "normal" | "bold" | "light";

    // 🎮 JUICE CONTROLS - The secret sauce!
    squishPower: number; // 0-20% - How much buttons compress when pressed
    bounceFactor: number; // 0-15% - Overshoot amount on release
    hoverLift: number; // 0-10px - How much buttons lift on hover
    animationSpeed: number; // 0.5x-2x - Duration multiplier
    easingStyle: "bouncy" | "smooth" | "snappy"; // Preset easing curves
  };

  // Content Properties
  content: {
    type: "emoji" | "text" | "icon";
    value: string;
    label?: string; // Optional descriptive label
  };

  // Effects - LUSH modular magic!
  effects: EffectToggles;

  // Interaction Properties
  feedback: {
    haptic: boolean;
    sound: boolean;
    animation: "subtle" | "playful" | "professional";
  };

  // Sound Configuration - NEW!
  sound: {
    enabled: boolean;
    type: "slate" | "amber" | "coral" | "sage" | "pearl";
    volume: number; // 0-100
  };

  // Voice Properties (preserve existing)
  voice: {
    enabled: boolean;
    autoTranscribe: boolean;
    clipboardCopy: boolean;
    showWaveform: boolean;
  };

  // Recording Behavior - NEW!
  recording: {
    visualFeedback: "timer" | "pulse" | "glow" | "ring" | "none";
    showTimer: boolean;
    pulseIntensity: number; // 0-100
    ringColor: string;
    keepSize: boolean; // Prevent layout shift
    showWaveform: boolean; // During recording
  };

  // API Configuration
  api?: {
    provider: "gemini" | "openai" | "custom";
    apiKey: string;
    model: string;
    customPrompt: string;
    temperature: number; // 0-1 for creativity
  };
}

// Theme system definition
export interface ThemeDefinition {
  name: string;
  icon: string;
  description: string;
  colors: {
    background: string;
    text: string;
    border: string;
    shadow: string;
  };
}

// Slider control configuration
export interface SliderDefinition {
  id: keyof ButtonCustomization["appearance"];
  label: string;
  icon: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
  property: string;
  preview: (value: number) => string;
}

// ===================================================================
// EFFECT SYSTEM - Modular visual effects
// ===================================================================

// Available visual effects (some conflict with each other)
export interface EffectToggles {
  bounce: boolean;
  glow: boolean;
  breathing: boolean;
  wiggle: boolean;
  pulse: boolean;
  shadow: boolean;
  rainbow: boolean;
  sparkle: boolean;
}

export const defaultEffects: EffectToggles = {
  bounce: false,
  glow: false,
  breathing: true, // starts with breathing
  wiggle: false,
  pulse: false,
  shadow: false,
  rainbow: false,
  sparkle: false,
};

// ===================================================================
// DEFAULTS & PRESETS
// ===================================================================

// Default button configuration (warm, satisfying rectangular button)
export const defaultCustomization: ButtonCustomization = {
  appearance: {
    theme: "warm",
    colorIntensity: "pastel", // Default to pastel
    fillType: "gradient",
    solidColor: "#ff60e0",
    shape: "rounded",
    scale: 1.0,
    roundness: 16,
    borderWidth: 4,
    shadowType: "brutalist",
    borderStyle: "solid",
    gradient: {
      start: "#f8c2cc", // Softer pink start
      end: "#f0d1a8", // Softer peach end
      direction: 135, // Diagonal
    },
    textColor: "auto", // Smart contrast
  },
  interactions: {
    hoverEffect: "lift",
    clickAnimation: "bounce",
    textTransform: "none",
    fontWeight: "bold",

    // Default juice settings - tasteful and smooth
    squishPower: 6, // 6% squish (more subtle)
    bounceFactor: 4, // 4% bounce (more subtle)
    hoverLift: 2, // 2px lift (more subtle)
    animationSpeed: 1.0, // Normal speed
    easingStyle: "smooth", // Smooth feel by default
  },
  content: {
    type: "text",
    value: "Boop me!",
    label: "Voice Button",
  },
  effects: defaultEffects,
  feedback: {
    haptic: true,
    sound: true,
    animation: "playful",
  },
  sound: {
    enabled: true,
    type: "slate",
    volume: 70,
  },
  voice: {
    enabled: true,
    autoTranscribe: true,
    clipboardCopy: true,
    showWaveform: true,
  },
  recording: {
    visualFeedback: "timer",
    showTimer: true,
    pulseIntensity: 80,
    ringColor: "#ff6b9d",
    keepSize: true,
    showWaveform: false,
  },
};

// Available theme presets
export const buttonThemes: Record<ButtonTheme, ThemeDefinition> = {
  minimal: {
    name: "Clean",
    icon: "⚪",
    description: "Simple & elegant",
    colors: {
      background: "bg-gray-100 hover:bg-gray-200",
      text: "text-gray-800",
      border: "border-2 border-gray-300",
      shadow: "shadow-lg hover:shadow-xl",
    },
  },

  warm: {
    name: "Warm",
    icon: "🧡",
    description: "Cozy gradients",
    colors: {
      background: "",
      text: "text-white",
      border: "border-0",
      shadow: "shadow-lg hover:shadow-xl",
    },
  },

  professional: {
    name: "Pro",
    icon: "💼",
    description: "Business ready",
    colors: {
      background: "",
      text: "text-white",
      border: "border-0",
      shadow: "shadow-lg hover:shadow-xl",
    },
  },

  lush: {
    name: "Lush",
    icon: "✨",
    description: "Rich & vibrant",
    colors: {
      background: "",
      text: "text-white",
      border: "border-0",
      shadow: "shadow-xl hover:shadow-2xl",
    },
  },
};

// Main slider controls (size, roundness, border thickness)
export const sliderConfig: SliderDefinition[] = [
  {
    id: "scale",
    label: "Size",
    icon: "📏",
    min: 0.5,
    max: 2.0,
    step: 0.1,
    unit: "x",
    property: "--button-scale",
    preview: (value) => `scale-[${value}]`,
  },
  {
    id: "roundness",
    label: "Roundness",
    icon: "⭕",
    min: 0,
    max: 50,
    unit: "px",
    property: "--button-roundness",
    preview: (value) => `rounded-[${value}px]`,
  },
  {
    id: "borderWidth",
    label: "Thickness",
    icon: "🖼️",
    min: 0,
    max: 10,
    unit: "px",
    property: "--button-border",
    preview: (value) => `border-[${value}px]`,
  },
];

// ===================================================================
// COLOR INTENSITY SYSTEM - Pastel vs Neon palettes
// ===================================================================

export const colorPalettes = {
  pastel: {
    // Soft, gentle colors
    pink: {
      solid: "#f8c2cc",
      gradientStart: "#f8c2cc",
      gradientEnd: "#f0d1a8",
    },
    blue: {
      solid: "#b3d9ff",
      gradientStart: "#b3d9ff",
      gradientEnd: "#d4b3ff",
    },
    green: {
      solid: "#c2f0c2",
      gradientStart: "#c2f0c2",
      gradientEnd: "#b3e5fc",
    },
    purple: {
      solid: "#d4b3ff",
      gradientStart: "#d4b3ff",
      gradientEnd: "#f8c2cc",
    },
    orange: {
      solid: "#ffcc99",
      gradientStart: "#ffcc99",
      gradientEnd: "#ffd9b3",
    },
    yellow: {
      solid: "#fff2b3",
      gradientStart: "#fff2b3",
      gradientEnd: "#ffcc99",
    },
  },
  neon: {
    // Electric, vibrant colors
    pink: {
      solid: "#ff1493",
      gradientStart: "#ff1493",
      gradientEnd: "#ff6347",
    },
    blue: {
      solid: "#00ffff",
      gradientStart: "#00ffff",
      gradientEnd: "#1e90ff",
    },
    green: {
      solid: "#00ff00",
      gradientStart: "#00ff00",
      gradientEnd: "#32cd32",
    },
    purple: {
      solid: "#8a2be2",
      gradientStart: "#8a2be2",
      gradientEnd: "#ff1493",
    },
    orange: {
      solid: "#ff4500",
      gradientStart: "#ff4500",
      gradientEnd: "#ffa500",
    },
    yellow: {
      solid: "#ffff00",
      gradientStart: "#ffff00",
      gradientEnd: "#ff4500",
    },
  },
};

// Helper to get colors based on intensity setting
export function getColorForIntensity(
  colorIntensity: ColorIntensity,
  colorName: keyof typeof colorPalettes.pastel = "pink",
) {
  return colorPalettes[colorIntensity][colorName];
}

// ===================================================================
// UTILITY FUNCTIONS - Style generation and helpers
// ===================================================================

// Generate CSS custom properties for dynamic styling
export function generateButtonStyles(
  customization: ButtonCustomization,
): Record<string, string> {
  const { gradient, colorIntensity } = customization.appearance;

  // Auto-enhance colors based on intensity
  const enhancedGradient = enhanceColorsForIntensity(gradient, colorIntensity);

  return {
    // CSS custom properties for real-time updates
    "--button-radius": `${customization.appearance.roundness}px`,
    "--button-scale": customization.appearance.scale.toString(),

    // Enhanced gradient background with intensity
    background: customization.appearance.fillType === "solid"
      ? enhanceColorForIntensity(
        customization.appearance.solidColor,
        colorIntensity,
      )
      : `linear-gradient(${enhancedGradient.direction}deg, ${enhancedGradient.start}, ${enhancedGradient.end})`,

    // Border styling
    borderColor: "#000000",
    borderWidth: `${customization.appearance.borderWidth}px`,

    // Neon glow effect for neon mode
    ...(colorIntensity === "neon" && {
      boxShadow:
        `0 0 20px ${enhancedGradient.start}80, 0 4px 8px rgba(0,0,0,0.3)`,
      filter: "saturate(1.2) brightness(1.1)",
    }),
  };
}

// Helper functions for color intensity
function enhanceColorForIntensity(
  color: string,
  intensity: ColorIntensity,
): string {
  if (intensity === "neon") {
    // For neon, we boost saturation and brightness
    return color; // Keep original for now, could add HSL manipulation
  }
  return color; // Pastel stays as-is
}

function enhanceColorsForIntensity(gradient: any, intensity: ColorIntensity) {
  return {
    start: enhanceColorForIntensity(gradient.start, intensity),
    end: enhanceColorForIntensity(gradient.end, intensity),
    direction: gradient.direction,
  };
}

export function generateButtonClasses(
  customization: ButtonCustomization,
): string {
  const theme = buttonThemes[customization.appearance.theme];

  const dynamicClasses = [
    "rounded-[var(--button-radius)]",
    "scale-[var(--button-scale)]",
    "saturate-[var(--button-saturation)]",
  ];

  return [
    // Base classes
    "inline-flex items-center justify-center font-black focus:outline-none",
    "transition-all duration-100 ease-out",
    "border-4 border-black", // Brutalist thick borders

    // Typography - chonky and cute
    "text-2xl tracking-tight",

    // Theme classes
    "text-black", // Always black text for contrast

    // Dynamic classes
    ...dynamicClasses,
  ].join(" ");
}
