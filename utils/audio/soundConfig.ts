/**
 * Universal Sound Configuration System
 *
 * Portable, modular sound system that can be easily transferred between apps.
 * All sound mappings, categories, and file assignments are centralized here.
 *
 * @author ButtonStudio Audio Team
 * @version 3.0.0 - Universal Portable System
 */

// ===================================================================
// SOUND FILE LIBRARY - Easy to swap entire sound packs
// ===================================================================

/**
 * Sound file library configuration
 *
 * Change these mappings to use different sound files.
 * Add new categories by adding new sections.
 */
export const SOUND_LIBRARY = {
  // INTERACTION SOUNDS - User interface feedback
  interactions: {
    hover: "scroll-haptic", // Gentle hover feedback
    clickLight: "kenney/original/click_001", // Light button clicks
    clickMedium: "kenney/original/click_002", // Medium emphasis clicks
    clickHeavy: "echo-button", // Important action clicks
    toggleOn: "pop-on", // Switch/toggle activation
    toggleOff: "pop-off", // Switch/toggle deactivation
  },

  // NAVIGATION SOUNDS - Panel and section changes
  navigation: {
    panelOpen: "kenney/original/maximize_001", // Opening panels/sections
    panelClose: "kenney/original/minimize_001", // Closing panels/sections
    tabSwitch: "kenney/original/switch_001", // Switching between tabs
    pageTransition: "kenney/original/open_001", // Major page changes
  },

  // SELECTION SOUNDS - Choosing options and values
  selection: {
    colorPick: "paste-drop", // Color selection
    shapeSelect: "kenney/original/select_001", // Shape/option selection
    themeChange: "kenney/original/confirmation_001", // Theme switching
    presetSelect: "kenney/original/select_002", // Preset selection
  },

  // CONTROL SOUNDS - Sliders and input controls
  controls: {
    sliderStep: "kenney/original/tick_001", // Slider movement steps
    sliderRelease: "grab-pop", // Slider release
    inputFocus: "kenney/original/open_001", // Input field focus
    inputBlur: "kenney/original/close_001", // Input field blur
  },

  // FEEDBACK SOUNDS - Success, error, completion
  feedback: {
    success: "download", // Successful actions
    error: "sweet-error", // Error states
    warning: "error-banjo", // Warning states
    completion: "computer-ready", // Task completion
    celebration: "KidsCheer", // Special celebrations
  },

  // EXPORT SOUNDS - Copy, save, export actions
  export: {
    copy: "download", // Clipboard copy
    save: "kenney/original/confirmation_002", // Save operations
    export: "computer-ready", // Export operations
    share: "kenney/variations/glass_001", // Share operations
  },

  // SPECIAL SOUNDS - App-specific unique actions
  special: {
    diceRoll: "grab-pop", // Random/surprise actions
    magic: "kenney/original/bong_001", // Special effects
    unlock: "kenney/original/glass_001", // Feature unlocks
    achievement: "KidsCheer", // Achievements
  },
};

// Type definitions for better IDE support
interface SoundCategoryConfig {
  description?: string;
  [key: string]: (() => string) | string | undefined;
}

// ===================================================================
// SOUND CATEGORIES - Logical groupings for different UI elements
// ===================================================================

/**
 * Sound category mappings
 *
 * Maps UI element types to appropriate sounds from the library.
 * Easy to reassign entire categories to different sounds.
 */
// Synthetic sound configuration for gradient panels
export const SYNTHETIC_SOUNDS = {
  gradientPanels: {
    // Musical scale frequencies mapped to panel colors
    red: { frequency: 261.63, note: "C4" },
    orange: { frequency: 293.66, note: "D4" },
    yellow: { frequency: 329.63, note: "E4" },
    purple: { frequency: 392.00, note: "G4" },
    cyan: { frequency: 440.00, note: "A4" },
    green: { frequency: 493.88, note: "B4" },
    blue: { frequency: 349.23, note: "F4" },
    pink: { frequency: 369.99, note: "F#4" },
  },
};

export const SOUND_CATEGORIES = {
  // PRIMARY ACTION BUTTONS - Main call-to-action buttons
  primaryButtons: {
    click: () => SOUND_LIBRARY.interactions.clickHeavy,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Main action buttons (submit, create, export)",
  },

  // SECONDARY BUTTONS - Supporting action buttons
  secondaryButtons: {
    click: () => SOUND_LIBRARY.interactions.clickMedium,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Secondary actions (cancel, reset, clear)",
  },

  // SELECTION BUTTONS - Option selection buttons
  selectionButtons: {
    select: () => SOUND_LIBRARY.selection.shapeSelect,
    deselect: () => SOUND_LIBRARY.interactions.clickLight,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Shape, theme, effect selection buttons",
  },

  // TOGGLE CONTROLS - Switches, checkboxes, radio buttons
  toggleControls: {
    on: () => SOUND_LIBRARY.interactions.toggleOn,
    off: () => SOUND_LIBRARY.interactions.toggleOff,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Switches, checkboxes, toggle buttons",
  },

  // PANEL CONTROLS - Collapsible sections and navigation
  panelControls: {
    expand: () => SOUND_LIBRARY.navigation.panelOpen,
    collapse: () => SOUND_LIBRARY.navigation.panelClose,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Collapsible panels, accordions, tabs",
  },

  // SLIDER CONTROLS - Range inputs and continuous controls
  sliderControls: {
    step: () => SOUND_LIBRARY.controls.sliderStep,
    release: () => SOUND_LIBRARY.controls.sliderRelease,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Sliders, range inputs, continuous controls",
  },

  // COLOR CONTROLS - Color picker interactions
  colorControls: {
    select: () => SOUND_LIBRARY.selection.colorPick,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Color pickers, palette interactions",
  },

  // EXPORT ACTIONS - Copy, save, export operations
  exportActions: {
    copy: () => SOUND_LIBRARY.export.copy,
    save: () => SOUND_LIBRARY.export.save,
    export: () => SOUND_LIBRARY.export.export,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Copy code, export, save operations",
  },

  // SPECIAL ACTIONS - App-specific unique interactions
  specialActions: {
    dice: () => SOUND_LIBRARY.special.diceRoll,
    magic: () => SOUND_LIBRARY.special.magic,
    celebration: () => SOUND_LIBRARY.feedback.celebration,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Dice rolls, surprise actions, celebrations",
  },

  // GRADIENT PANELS - Synthetic tones (handled by gradientSynth.ts)
  // This mapping exists for compatibility with soundMapping.ts
  gradientPanels: {
    red: () => "synthetic",
    orange: () => "synthetic",
    yellow: () => "synthetic",
    purple: () => "synthetic",
    cyan: () => "synthetic",
    green: () => "synthetic",
    blue: () => "synthetic",
    pink: () => "synthetic",
    description: "Progressive pitch variations for colored UI panels",
  },
};

// ===================================================================
// EASY CONFIGURATION - Quick setup for new apps
// ===================================================================

/**
 * Quick configuration presets for different app types
 */
export const APP_SOUND_PRESETS = {
  // Minimal - Just essential feedback
  minimal: {
    enabled: ["primaryButtons", "toggleControls", "feedback"],
    volume: 0.3,
  },

  // Standard - Balanced feedback for most apps
  standard: {
    enabled: [
      "primaryButtons",
      "secondaryButtons",
      "selectionButtons",
      "toggleControls",
      "panelControls",
    ],
    volume: 0.5,
  },

  // Rich - Full audio experience like ButtonStudio
  rich: {
    enabled: Object.keys(SOUND_CATEGORIES),
    volume: 0.7,
  },
};

// ===================================================================
// EXTENSION HELPERS - Easy to add new categories
// ===================================================================

/**
 * Add a new sound category to the system
 *
 * Dynamically extends the sound system with new categories at runtime.
 * Useful for apps that need to add custom sound categories beyond the defaults.
 *
 * @param {string} name - Category name (e.g., 'modalControls')
 * @param {any} config - Category configuration with action->function mappings
 * @returns {void}
 * @example
 * addSoundCategory('modalControls', {
 *   open: () => SOUND_LIBRARY.navigation.panelOpen,
 *   close: () => SOUND_LIBRARY.navigation.panelClose,
 *   description: 'Modal dialog interactions'
 * })
 */
export function addSoundCategory(name: string, config: SoundCategoryConfig) {
  // @ts-ignore - Dynamic category addition
  SOUND_CATEGORIES[name] = config;
}

/**
 * Add new sounds to the sound file library
 *
 * Extends the sound file library with new audio files.
 * Allows apps to add custom sound files beyond the default set.
 *
 * @param {string} category - Library category (e.g., 'animations')
 * @param {Record<string, string>} sounds - Object mapping sound names to file paths
 * @returns {void}
 * @example
 * addSoundFiles('animations', {
 *   fadeIn: 'fade-in.mp3',
 *   fadeOut: 'fade-out.mp3'
 * })
 */
export function addSoundFiles(
  category: string,
  sounds: Record<string, string>,
) {
  // @ts-ignore - Dynamic library extension
  SOUND_LIBRARY[category] = { ...SOUND_LIBRARY[category], ...sounds };
}
