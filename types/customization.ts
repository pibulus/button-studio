// ===================================================================
// BUTTON CUSTOMIZATION TYPES - Complete button design system
// ===================================================================
// Comprehensive interface for all button appearance, behavior, and functionality

export type ButtonTheme = "minimal" | "warm" | "professional" | "lush";

// Main customization interface - everything configurable about a button
export interface ButtonCustomization {
  // Visual Properties
  appearance: {
    theme: ButtonTheme;
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
  rainbowGlow: boolean;
  pulse: boolean;
}

export const defaultEffects: EffectToggles = {
  bounce: false,
  glow: false,
  breathing: true, // starts with breathing
  wiggle: false,
  rainbowGlow: false,
  pulse: false,
};

// ===================================================================
// DEFAULTS & PRESETS
// ===================================================================

// Default button configuration (warm, satisfying rectangular button)
export const defaultCustomization: ButtonCustomization = {
  appearance: {
    theme: "warm",
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
// UTILITY FUNCTIONS - Style generation and helpers
// ===================================================================

// Generate CSS custom properties for dynamic styling
export function generateButtonStyles(
  customization: ButtonCustomization,
): Record<string, string> {
  const { gradient } = customization.appearance;

  return {
    // CSS custom properties for real-time updates
    "--button-radius": `${customization.appearance.radius}px`,
    "--button-scale": customization.appearance.scale.toString(),
    "--button-elevation": `${customization.appearance.elevation}px`,
    "--button-saturation": `${customization.appearance.saturation}%`,

    // Computed values
    "--shadow-blur": `${customization.appearance.elevation * 2}px`,
    "--shadow-spread": `${customization.appearance.elevation * 0.5}px`,

    // Pablo's gradient background
    background:
      `linear-gradient(${gradient.direction}deg, ${gradient.start}, ${gradient.end})`,

    // Pablo's thick border
    borderColor: "#000000",
    borderWidth: "4px",
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
