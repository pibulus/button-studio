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
    hover: "scroll-haptic.mp3", // Gentle hover feedback
    clickLight: "echo-button.mp3", // Light button clicks
    clickMedium: "computer-ready.mp3", // Medium emphasis clicks
    clickHeavy: "KidsCheer.mp3", // Important action clicks
    toggleOn: "toggle-on.mp3", // Switch/toggle activation
    toggleOff: "toggle-off.mp3", // Switch/toggle deactivation
  },

  // NAVIGATION SOUNDS - Panel and section changes
  navigation: {
    panelOpen: "panel-swoosh.mp3", // Opening panels/sections
    panelClose: "panel-close.mp3", // Closing panels/sections
    tabSwitch: "tab-switch.mp3", // Switching between tabs
    pageTransition: "page-transition.mp3", // Major page changes
  },

  // SELECTION SOUNDS - Choosing options and values
  selection: {
    colorPick: "echo-button.mp3", // Color selection
    shapeSelect: "shape-select.mp3", // Shape/option selection
    themeChange: "theme-change.mp3", // Theme switching
    presetSelect: "preset-select.mp3", // Preset selection
  },

  // CONTROL SOUNDS - Sliders and input controls
  controls: {
    sliderStep: "slider-step.mp3", // Slider movement steps
    sliderRelease: "slider-release.mp3", // Slider release
    inputFocus: "input-focus.mp3", // Input field focus
    inputBlur: "input-blur.mp3", // Input field blur
  },

  // FEEDBACK SOUNDS - Success, error, completion
  feedback: {
    success: "computer-ready.mp3", // Successful actions
    error: "error-beep.mp3", // Error states
    warning: "warning-chime.mp3", // Warning states
    completion: "task-complete.mp3", // Task completion
    celebration: "KidsCheer.mp3", // Special celebrations
  },

  // EXPORT SOUNDS - Copy, save, export actions
  export: {
    copy: "copy-success.mp3", // Clipboard copy
    save: "save-success.mp3", // Save operations
    export: "export-complete.mp3", // Export operations
    share: "share-success.mp3", // Share operations
  },

  // SPECIAL SOUNDS - App-specific unique actions
  special: {
    diceRoll: "dice-roll.mp3", // Random/surprise actions
    magic: "magic-sparkle.mp3", // Special effects
    unlock: "unlock-feature.mp3", // Feature unlocks
    achievement: "achievement.mp3", // Achievements
  },
};

// ===================================================================
// SOUND CATEGORIES - Logical groupings for different UI elements
// ===================================================================

/**
 * Sound category mappings
 *
 * Maps UI element types to appropriate sounds from the library.
 * Easy to reassign entire categories to different sounds.
 */
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
export function addSoundCategory(name: string, config: any) {
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
