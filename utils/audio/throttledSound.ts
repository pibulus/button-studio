/**
 * Throttled Sound System
 *
 * Prevents sound spam by limiting how often sounds can play.
 * Essential for sliders and rapid interactions.
 */

// Track last play times for each sound type
const lastPlayTimes = new Map<string, number>();

/**
 * Create a throttled version of a sound function
 * @param soundFn The original sound function to throttle
 * @param minDelay Minimum milliseconds between plays (default: 100ms)
 * @param soundKey Unique key to track this sound's throttle state
 */
export function throttleSound(
  soundFn: () => void,
  minDelay = 100,
  soundKey: string,
): () => void {
  return () => {
    const now = Date.now();
    const lastPlay = lastPlayTimes.get(soundKey) || 0;

    if (now - lastPlay >= minDelay) {
      lastPlayTimes.set(soundKey, now);
      soundFn();
    }
  };
}

// Pre-configured throttled sounds for common use cases
export const throttledSounds = {
  // Slider sounds - max once per 150ms
  sliderStep: (soundFn: () => void) =>
    throttleSound(soundFn, 150, "slider-step"),

  // Hover sounds - max once per 200ms
  hover: (soundFn: () => void) => throttleSound(soundFn, 200, "hover"),

  // Panel gradient sounds - max once per 300ms
  gradientPanel: (soundFn: () => void) =>
    throttleSound(soundFn, 300, "gradient-panel"),
};
