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
 * onClick={() => playSound.primaryClick()}
 * onMouseEnter={() => playSound.hover()}
 *
 * @author ButtonStudio Audio Team
 * @version 3.0.0 - Universal Portable System
 */

import { SOUND_CATEGORIES } from "./soundConfig.ts";
import { soundService } from "./soundService.ts";
import { buttonSounds } from "./synthEngine.ts";

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
        const soundFile = soundGetter();
        mapping[categoryName][actionName] = () => {
          // Wrap all sound calls to handle autoplay errors gracefully
          try {
            // Map sound files to soundService functions
            if (soundFile.includes("panel")) {
              if (actionName === "expand") {
                soundService.playPanelOpen()?.catch(() => {});
              } else soundService.playPanelClose()?.catch(() => {});
            } else if (soundFile.includes("toggle")) {
              if (actionName === "on") {
                soundService.playToggleOn()?.catch(() => {});
              } else soundService.playToggleOff()?.catch(() => {});
            } else if (soundFile.includes("slider")) {
              if (actionName === "step") {
                soundService.playSliderStep()?.catch(() => {});
              } else soundService.playSliderRelease()?.catch(() => {});
            } else if (soundFile.includes("color")) {
              soundService.playColorSelect()?.catch(() => {});
            } else if (soundFile.includes("copy")) {
              buttonSounds.playSage()?.catch(() => {});
            } else if (soundFile.includes("export")) {
              buttonSounds.playPearl()?.catch(() => {});
            } else if (soundFile.includes("dice")) {
              soundService.playDiceRoll()?.catch(() => {});
            } else if (soundFile.includes("celebration")) {
              soundService.playCelebration()?.catch(() => {});
            } else if (soundFile.includes("hover")) {
              soundService.playButtonHover()?.catch(() => {});
            } else {
              // Default mappings based on action type
              if (actionName === "click") {
                if (categoryName === "primaryButtons") {
                  buttonSounds.playCoral()?.catch(() => {});
                } else if (categoryName === "secondaryButtons") {
                  buttonSounds.playAmber()?.catch(() => {});
                } else soundService.playButtonClick()?.catch(() => {});
              } else if (actionName === "select") {
                buttonSounds.playAmber()?.catch(() => {});
              } else if (actionName === "deselect") {
                buttonSounds.playSlate()?.catch(() => {});
              } else if (actionName === "hover") {
                soundService.playButtonHover()?.catch(() => {});
              }
            }
          } catch (error) {
            // Silently ignore any sound errors
          }
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
function createPlaySoundInterface() {
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

  return playSound;
}

export const playSound = createPlaySoundInterface();

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

// Get sound category info for documentation
export function getSoundCategories() {
  return Object.entries(SOUND_CATEGORIES).map(([name, config]) => ({
    name,
    description: (config as any).description || "No description",
    actions: Object.keys(config).filter((k) => k !== "description"),
  }));
}
