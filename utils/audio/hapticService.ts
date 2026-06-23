/**
 * Haptic Service for ButtonSpa
 * Provides vibration feedback for mobile devices
 * Adapted from RiffRap's haptic patterns
 */

// Vibration patterns for different interactions
export const HAPTIC_PATTERNS = {
  // Button interactions
  BUTTON_PRESS: [30],
  BUTTON_SUCCESS: [50, 30, 50],
  BUTTON_ERROR: [100, 50, 100],

  // Slider interactions
  SLIDER_STEP: [15],
  SLIDER_RELEASE: [25],

  // Toggle interactions
  TOGGLE_ON: [40, 20, 20],
  TOGGLE_OFF: [20],

  // Panel interactions
  PANEL_OPEN: [35],
  PANEL_CLOSE: [20],

  // Special interactions
  DICE_ROLL: [30, 40, 30],
  SURPRISE_SUCCESS: [60, 30, 60, 30, 60],

  // Voice recording
  RECORDING_START: [40, 60, 40],
  RECORDING_STOP: [50],

  // Copy/success actions
  COPY_SUCCESS: [25],
  CELEBRATION: [80, 50, 80, 50, 120],

  // Error patterns
  PERMISSION_ERROR: [20, 100, 20, 100, 20],
  GENERAL_ERROR: [20, 150, 20],
} as const;

class HapticService {
  private static readonly STORAGE_KEY = "buttonspa-haptics-enabled";
  private static readonly LEGACY_STORAGE_KEY = "buttonstudio-haptics-enabled";

  private isMobile: boolean;
  private isSupported: boolean;
  private enabled: boolean;

  constructor() {
    this.isMobile = typeof globalThis !== "undefined" &&
      globalThis.innerWidth <= 768;
    this.isSupported = typeof navigator !== "undefined" &&
      "vibrate" in navigator;
    this.enabled = true;

    this.initializeSettings();
  }

  private initializeSettings(): void {
    if (typeof localStorage !== "undefined") {
      const storedValue = localStorage.getItem(HapticService.STORAGE_KEY) ??
        localStorage.getItem(HapticService.LEGACY_STORAGE_KEY);
      if (storedValue === "false") {
        this.enabled = false;
      }
    }

    if (typeof globalThis !== "undefined") {
      (globalThis as Record<string, unknown>).hapticsEnabled = this.enabled;
      console.log("📳 ButtonSpa haptics enabled:", this.enabled);
    }
  }

  vibrate(pattern: number | readonly number[]): boolean {
    if (!this.enabled || !this.isSupported || !this.isMobile) {
      return false;
    }

    try {
      navigator.vibrate(pattern as number | number[]);
      return true;
    } catch (e) {
      console.log(`Vibration failed: ${(e as Error).message}`);
      return false;
    }
  }

  // Button interactions
  buttonPress(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_PRESS);
  }

  buttonSuccess(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_SUCCESS);
  }

  buttonError(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_ERROR);
  }

  // Slider interactions
  sliderStep(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.SLIDER_STEP);
  }

  sliderRelease(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.SLIDER_RELEASE);
  }

  // Toggle interactions
  toggleOn(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.TOGGLE_ON);
  }

  toggleOff(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.TOGGLE_OFF);
  }

  // Panel interactions
  panelOpen(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.PANEL_OPEN);
  }

  panelClose(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.PANEL_CLOSE);
  }

  // Special interactions
  diceRoll(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.DICE_ROLL);
  }

  surpriseSuccess(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.SURPRISE_SUCCESS);
  }

  // Voice recording
  startRecording(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.RECORDING_START);
  }

  stopRecording(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.RECORDING_STOP);
  }

  // Slider grab (for SizeShapePanel)
  sliderGrab(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_PRESS);
  }

  // Success actions
  copySuccess(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.COPY_SUCCESS);
  }

  celebration(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.CELEBRATION);
  }

  // Error handling
  permissionError(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.PERMISSION_ERROR);
  }

  generalError(): boolean {
    return this.vibrate(HAPTIC_PATTERNS.GENERAL_ERROR);
  }

  // Settings
  enable(): void {
    this.enabled = true;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HapticService.STORAGE_KEY, "true");
      localStorage.setItem(HapticService.LEGACY_STORAGE_KEY, "true");
    }

    // Give immediate feedback
    this.buttonSuccess();
  }

  disable(): void {
    this.enabled = false;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HapticService.STORAGE_KEY, "false");
      localStorage.setItem(HapticService.LEGACY_STORAGE_KEY, "false");
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isHapticsSupported(): boolean {
    return this.isSupported;
  }

  isMobileDevice(): boolean {
    return this.isMobile;
  }
}

// Export singleton instance
export const hapticService = new HapticService();
