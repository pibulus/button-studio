/**
 * Sound System Type Definitions
 *
 * Provides TypeScript types for all available sound functions,
 * making them discoverable through IDE autocomplete.
 */

// Available gradient panel colors
export type GradientPanelColor =
  | "red"
  | "orange"
  | "yellow"
  | "purple"
  | "green"
  | "blue"
  | "pink"
  | "cyan";

// Available sound themes
export type SoundTheme = "slate" | "amber" | "coral" | "sage" | "pearl";

/**
 * Complete sound interface with all available functions
 * This makes all sound functions discoverable through autocomplete!
 */
export interface PlaySoundInterface {
  // Primary Actions
  primaryClick(): void;
  primaryHover(): void;

  // Secondary Actions
  secondaryClick(): void;
  secondaryHover(): void;

  // Selection Actions
  selectionSelect(): void;
  selectionDeselect(): void;
  selectionHover(): void;

  // Toggle Controls
  toggleOn(): void;
  toggleOff(): void;
  toggleHover(): void;

  // Panel Controls
  panelExpand(): void;
  panelCollapse(): void;
  panelHover(): void;

  // Slider Controls
  sliderStep(): void;
  sliderRelease(): void;
  sliderHover(): void;

  // Color Controls
  colorSelect(): void;
  colorHover(): void;

  // Export Actions
  exportCopy(): void;
  exportSave(): void;
  exportExport(): void;
  exportHover(): void;

  // Special Actions
  specialDice(): void;
  specialMagic(): void;
  specialCelebration(): void;
  specialHover(): void;

  // Feedback Sounds
  success(): void;
  error(): void;
  warning(): void;
  completion(): void;
  celebration(): void;

  // Gradient Panel Sounds - NOW DISCOVERABLE!
  gradientPanelsRed(): void;
  gradientPanelsOrange(): void;
  gradientPanelsYellow(): void;
  gradientPanelsPurple(): void;
  gradientPanelsGreen(): void;
  gradientPanelsBlue(): void;
  gradientPanelsPink(): void;
  gradientPanelsCyan(): void;

  // Convenience Methods
  hover(): void;
  soundPreview(theme: SoundTheme): void;

  // NEW: Helper method for gradient panels
  gradientPanel(color: GradientPanelColor): void;

  // Throttled versions
  sliderStepThrottled(): void;
  hoverThrottled(): void;
  gradientPanelThrottled(): void;
}

/**
 * Sound category definition
 */
export interface SoundCategory {
  description?: string;
  [action: string]: (() => string) | string | undefined;
}

/**
 * Sound library structure
 */
export interface SoundLibrary {
  interactions: Record<string, string>;
  navigation: Record<string, string>;
  selection: Record<string, string>;
  controls: Record<string, string>;
  feedback: Record<string, string>;
  export: Record<string, string>;
  special: Record<string, string>;
  gradient: Record<string, string>;
}
