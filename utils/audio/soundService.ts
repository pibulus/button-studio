/**
 * Sound Service for ButtonStudio
 * Adapted from RiffRap's excellent sound system
 * Provides centralized UI sound effects for the application
 */

import { toast } from "../../components/Toast.tsx";

// Check if we're in a browser environment with audio support
const hasAudioSupport = typeof window !== "undefined" &&
  globalThis.HTMLAudioElement;

// Store settings flag - default to true
let soundsEnabled = true;

// Default configuration for all sounds
const defaultConfig = {
  volume: 0.15, // Default volume for all sounds (15%)
  delay: 0, // No delay by default
  basePath: "/sounds/", // Base path to sound files
};

// Sound file mappings for ButtonStudio UI interactions
const soundFiles = {
  // Button interactions
  buttonHover: "scroll-haptic",
  buttonClick: "echo-button",
  buttonSuccess: "pop-on",

  // Panel interactions
  panelOpen: "pop-up-warm",
  panelClose: "pop-off",

  // Slider interactions
  sliderStep: "scroll-haptic",
  sliderRelease: "grab-pop",

  // Toggle interactions
  toggleOn: "pop-on",
  toggleOff: "pop-off",

  // Feedback sounds
  success: "download",
  error: "sweet-error",
  celebration: "KidsCheer",

  // Dice/surprise button
  diceRoll: "grab-pop",
  surprise: "computer-ready",

  // Color picker
  colorSelect: "paste-drop",

  // General interactions
  copy: "download",
  undo: "undo",
  processing: "thinking-ambient",
};

// Initialize sound settings from localStorage
function initSoundSettings() {
  if (typeof localStorage !== "undefined") {
    const storedValue = localStorage.getItem("buttonstudio-sounds-enabled");
    if (storedValue === "false") {
      soundsEnabled = false;
    }
  }

  // Make soundsEnabled available globally for debugging
  if (typeof window !== "undefined") {
    (window as unknown as { soundsEnabled: boolean }).soundsEnabled =
      soundsEnabled;
    console.log("🔊 ButtonStudio sound effects enabled:", soundsEnabled);
  }
}

// Core sound playback function - handles loading, volume, and errors
function playSound(soundName: keyof typeof soundFiles, options: {
  volume?: number;
  delay?: number;
} = {}): Promise<void> {
  // Skip if sounds are disabled or audio not supported
  if (!soundsEnabled || !hasAudioSupport) {
    return Promise.resolve();
  }

  // If sound name isn't in our mapping, log an error
  if (!soundFiles[soundName]) {
    console.warn(
      `Sound "${soundName}" not found in ButtonStudio sound library`,
    );
    return Promise.reject(new Error(`Sound "${soundName}" not found`));
  }

  // Merge default config with provided options
  const config = {
    volume: options.volume ?? defaultConfig.volume,
    delay: options.delay ?? defaultConfig.delay,
  };

  // Build file path
  const filePath = `${defaultConfig.basePath}${soundFiles[soundName]}.mp3`;

  return new Promise((resolve, reject) => {
    try {
      // Create audio element
      const audio = new Audio(filePath);
      audio.volume = config.volume;

      // Setup event listeners
      audio.addEventListener("ended", () => {
        resolve();
      });

      audio.addEventListener("error", (error) => {
        console.warn(`Error playing sound "${soundName}":`, error);
        reject(error);
      });

      // Play with delay
      setTimeout(() => {
        audio.play().catch((error) => {
          // Silently ignore autoplay policy errors - these are expected before user interaction
          if (error.name === "NotAllowedError") {
            // Don't log autoplay errors - they're expected and handled gracefully
            resolve(); // Resolve instead of reject for autoplay issues
          } else {
            console.warn(`Error playing sound "${soundName}":`, error);
            reject(error);
          }
        });
      }, config.delay * 1000);
    } catch (error) {
      console.warn("Audio playback error:", error);
      reject(error);
    }
  });
}

// ButtonStudio-specific sound functions
export const buttonStudioSounds = {
  // Button interactions
  playButtonHover: () => playSound("buttonHover", { volume: 0.05 }),
  playButtonClick: () => playSound("buttonClick"),
  playButtonSuccess: () => playSound("buttonSuccess"),

  // Panel interactions
  playPanelOpen: () => playSound("panelOpen"),
  playPanelClose: () => playSound("panelClose"),

  // Slider interactions
  playSliderStep: () => playSound("sliderStep", { volume: 0.08 }),
  playSliderRelease: () => playSound("sliderRelease"),

  // Toggle interactions
  playToggleOn: () => playSound("toggleOn"),
  playToggleOff: () => playSound("toggleOff"),

  // Feedback sounds
  playSuccess: () => playSound("success"),
  playError: () => playSound("error"),
  playCelebration: () => playSound("celebration", { delay: 0.3 }),

  // Dice/surprise interactions
  playDiceRoll: () => playSound("diceRoll"),
  playSurprise: () => playSound("surprise"),

  // Color picker
  playColorSelect: () => playSound("colorSelect"),

  // Selection sounds (for customization options)
  playSelectionSelect: () => playSound("buttonSuccess", { volume: 0.3 }),
  playSelectionDeselect: () => playSound("sliderStep", { volume: 0.2 }),

  // Action sounds
  playCopyCode: () => playSound("copy"),
  playExport: () => playSound("success", { volume: 0.4 }),

  // General interactions
  playCopy: () => playSound("copy"),
  playUndo: () => playSound("undo"),
  playProcessing: () => playSound("processing", { volume: 0.1 }),
};

// Check if sounds are enabled (from localStorage + memory)
export function isSoundEnabled(): boolean {
  return soundsEnabled;
}

// Set sound enabled state (updates localStorage + shows feedback)
export function setSoundEnabled(enabled: boolean): void {
  soundsEnabled = enabled;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("buttonstudio-sounds-enabled", enabled.toString());
  }

  // Show feedback
  if (enabled) {
    toast.success("🔊 Sounds enabled!");
    buttonStudioSounds.playSuccess();
  } else {
    toast.info("🔇 Sounds disabled");
  }
}

// Initialize on import
if (typeof window !== "undefined") {
  initSoundSettings();
}

// Export the main sound service
export const soundService = {
  init: initSoundSettings,
  isSoundEnabled,
  setSoundEnabled,
  playSound,
  ...buttonStudioSounds,
};
