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
    clickLight: "kenney/variations/click_001", // Light button clicks
    clickMedium: "kenney/variations/click_001_high", // Medium emphasis clicks
    clickHeavy: "echo-button", // Important action clicks
    toggleOn: "pop-on", // Switch/toggle activation
    toggleOff: "pop-off", // Switch/toggle deactivation
  },

  // NAVIGATION SOUNDS - Panel and section changes
  navigation: {
    panelOpen: "kenney/variations/maximize_001", // Opening panels/sections
    panelClose: "kenney/variations/minimize_001", // Closing panels/sections
    tabSwitch: "kenney/variations/switch_001", // Switching between tabs
    pageTransition: "kenney/variations/open_001", // Major page changes
  },

  // SELECTION SOUNDS - Choosing options and values
  selection: {
    colorPick: "paste-drop", // Color selection
    shapeSelect: "kenney/variations/select_001", // Shape/option selection
    themeChange: "kenney/variations/confirmation_001", // Theme switching
    presetSelect: "kenney/variations/select_001_high", // Preset selection
  },

  // CONTROL SOUNDS - Sliders and input controls
  controls: {
    sliderStep: "kenney/variations/tick_001", // Slider movement steps
    sliderRelease: "grab-pop", // Slider release
    inputFocus: "kenney/variations/open_001", // Input field focus
    inputBlur: "kenney/variations/close_001", // Input field blur
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
    save: "kenney/variations/confirmation_001", // Save operations
    export: "computer-ready", // Export operations
    share: "kenney/variations/glass_001", // Share operations
  },

  // SPECIAL SOUNDS - App-specific unique actions
  special: {
    diceRoll: "grab-pop", // Random/surprise actions
    magic: "kenney/variations/bong_001", // Special effects
    unlock: "kenney/variations/glass_001_high", // Feature unlocks
    achievement: "KidsCheer", // Achievements
  },

  // GRADIENT SOUNDS - Progressive pitch variations for color-coded panels
  // Using a mix of glass and pluck sounds for distinct pitch progression
  gradient: {
    red: "kenney/variations/glass_001_low", // Deepest tone (Design panel) - low glass
    orange: "kenney/variations/glass_001", // Low-mid tone (Feel panel) - normal glass
    yellow: "kenney/variations/glass_001_high", // Mid tone (Ship panel) - high glass
    purple: "kenney/variations/pluck_001_low", // Mid-high tone (Magic panel) - low pluck
    cyan: "kenney/variations/pluck_001", // High tone (Colors panel) - normal pluck
    green: "kenney/variations/pluck_001_high", // Highest tone (Size & Shape) - high pluck
    blue: "kenney/variations/glass_001", // Backup mid tone
    pink: "kenney/variations/pluck_001", // Backup mid tone
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

  // GRADIENT PANEL SOUNDS - Progressive tones for color-coded panels
  gradientPanels: {
    red: () => SOUND_LIBRARY.gradient.red,
    orange: () => SOUND_LIBRARY.gradient.orange,
    yellow: () => SOUND_LIBRARY.gradient.yellow,
    purple: () => SOUND_LIBRARY.gradient.purple,
    green: () => SOUND_LIBRARY.gradient.green,
    blue: () => SOUND_LIBRARY.gradient.blue,
    pink: () => SOUND_LIBRARY.gradient.pink,
    cyan: () => SOUND_LIBRARY.gradient.cyan,
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
