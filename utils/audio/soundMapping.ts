/**
 * Universal Sound Mapping System
 *
 * Portable sound system that uses the centralized sound configuration.
 * This file connects the universal sound config to actual sound playback.
 * Easy to transfer between apps by copying this + soundConfig.ts
 *
 * @example
 * // Use in any component:
 * import { playSound } from './soundMapping.ts'
 *
 * // All functions are now discoverable through autocomplete!
 * onClick={() => playSound.primaryClick()}
 * onMouseEnter={() => playSound.hover()}
 *
 * // Gradient panels - two ways to use:
 * onMouseEnter={() => playSound.gradientPanelsRed()}  // Specific color
 * onMouseEnter={() => playSound.gradientPanel('red')} // Helper method
 *
 * @author ButtonStudio Audio Team
 * @version 3.1.0 - Improved with TypeScript types and helpers
 */

import { SOUND_CATEGORIES } from "./soundConfig.ts";
import { soundService } from "./soundService.ts";
import { buttonSounds } from "./synthEngine.ts";
import { throttleSound } from "./throttledSound.ts";
import type { GradientPanelColor, PlaySoundInterface } from "./soundTypes.ts";

/**
 * Dynamic Sound Mapping - Connects config to actual playback
 *
 * Automatically maps sound categories from config to soundService functions.
 * No need to manually maintain mappings - they're generated from the config!
 */

// Create dynamic sound mapping from config
function createSoundMapping() {
  const mapping: Record<string, any> = {};

  // Map each category from config to actual sound functions
  for (
    const [categoryName, categoryConfig] of Object.entries(SOUND_CATEGORIES)
  ) {
    mapping[categoryName] = {};

    // For each action in the category, create the actual function call
    for (const [actionName, soundGetter] of Object.entries(categoryConfig)) {
      if (typeof soundGetter === "function" && actionName !== "description") {
        mapping[categoryName][actionName] = () => {
          // Get the sound file path from config
          const soundFile = soundGetter();

          // Play the sound file directly using soundService
          soundService.playCustomSound(soundFile)?.catch(() => {});
        };
      }
    }
  }

  return mapping;
}

export const SOUND_MAPPING = createSoundMapping();

// Special sound preview function for sound picker
SOUND_MAPPING.soundPreview = {
  preview: (soundType: string) => {
    const soundMap: Record<string, () => void> = {
      slate: buttonSounds.playSlate,
      amber: buttonSounds.playAmber,
      coral: buttonSounds.playCoral,
      sage: buttonSounds.playSage,
      pearl: buttonSounds.playPearl,
    };
    return soundMap[soundType]?.() || buttonSounds.playSlate();
  },
  hover: () => soundService.playButtonHover(),
};

/**
 * Universal Sound Interface for Components
 *
 * Clean, consistent API auto-generated from sound categories.
 * Easy to extend - just add new categories to soundConfig.ts!
 *
 * @example
 * import { playSound } from './soundMapping.ts'
 * onClick={() => playSound.primaryClick()}
 * onMouseEnter={() => playSound.hover()}
 */

// Auto-generate clean playSound interface from categories
function createPlaySoundInterface(): PlaySoundInterface {
  const playSound: Record<string, any> = {};

  // Generate functions for each category and action
  for (const [categoryName, categoryConfig] of Object.entries(SOUND_MAPPING)) {
    if (typeof categoryConfig === "object") {
      for (
        const [actionName, actionFunction] of Object.entries(categoryConfig)
      ) {
        if (typeof actionFunction === "function") {
          // Create camelCase function names: primaryButtons.click -> primaryClick
          const functionName =
            categoryName.replace("Controls", "").replace("Buttons", "").replace(
              "Actions",
              "",
            ) +
            actionName.charAt(0).toUpperCase() + actionName.slice(1);
          playSound[functionName] = actionFunction;
        }
      }
    }
  }

  // Add universal hover function (most commonly used)
  playSound.hover = () => soundService.playButtonHover()?.catch(() => {});

  // Add special convenience functions
  playSound.soundPreview = SOUND_MAPPING.soundPreview.preview;

  // Add throttled versions for high-frequency sounds
  playSound.sliderStepThrottled = throttleSound(
    playSound.sliderStep || (() => {}),
    150,
    "slider-step",
  );

  playSound.hoverThrottled = throttleSound(
    playSound.hover || (() => {}),
    200,
    "hover",
  );

  playSound.gradientPanelThrottled = throttleSound(
    playSound.gradientPanel || (() => {}),
    300,
    "gradient-panel",
  );

  // Add helper function for gradient panels - MUCH easier to use!
  playSound.gradientPanel = (color: GradientPanelColor) => {
    const functionName = `gradientPanels${color.charAt(0).toUpperCase()}${
      color.slice(1)
    }`;
    const fn = playSound[functionName];
    if (fn && typeof fn === "function") {
      fn();
    } else {
      // Fallback to hover if color not found
      playSound.hover();
    }
  };

  // Add feedback sounds as direct methods for easier discovery
  playSound.success = () => soundService.playSuccess();
  playSound.error = () => soundService.playError();
  playSound.warning = () => soundService.playWarning();
  playSound.completion = () => soundService.playCompletion();
  playSound.celebration = () => soundService.playCelebration();

  return playSound as PlaySoundInterface;
}

export const playSound: PlaySoundInterface = createPlaySoundInterface();

// ===================================================================
// SOUND AUDIT HELPERS - For systematic sound application
// ===================================================================

// Development helper - list all available sound functions
export function listAvailableSounds() {
  console.group("🎵 Available Sound Functions:");
  Object.keys(playSound).sort().forEach((soundName) => {
    console.log(`playSound.${soundName}()`);
  });
  console.groupEnd();
}

/**
 * Get all available sound function names
 * Useful for debugging and documentation
 */
export function getAvailableSounds(): string[] {
  return Object.keys(playSound).sort();
}

/**
 * USAGE EXAMPLES - Copy these into your components!
 *
 * @example
 * // Button clicks
 * <button onClick={() => playSound.primaryClick()}>Submit</button>
 * <button onClick={() => playSound.secondaryClick()}>Cancel</button>
 *
 * @example
 * // Hover effects
 * <div onMouseEnter={() => playSound.hover()}>Hover me</div>
 *
 * @example
 * // Gradient panels - NEW easier way!
 * <div onMouseEnter={() => playSound.gradientPanel('red')}>Red Panel</div>
 * <div onMouseEnter={() => playSound.gradientPanel('blue')}>Blue Panel</div>
 *
 * @example
 * // Toggle switches
 * <Switch
 *   onChange={(checked) => checked ? playSound.toggleOn() : playSound.toggleOff()}
 * />
 *
 * @example
 * // Success feedback
 * await saveData();
 * playSound.success();
 */

// Get sound category info for documentation
export function getSoundCategories() {
  return Object.entries(SOUND_CATEGORIES).map(([name, config]) => ({
    name,
    description: (config as any).description || "No description",
    actions: Object.keys(config).filter((k) => k !== "description"),
  }));
}
