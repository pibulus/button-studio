/**
 * Gradient Synth - Synthetic pitched tones for panel gradients
 *
 * Creates clean, distinct pitched tones using Web Audio API.
 * Each panel gets a unique frequency in a musical scale.
 *
 * WHY THIS EXISTS:
 * - Pre-recorded sound files (pluck_001_low/high) didn't have audible pitch differences
 * - File-based sounds were unreliable and inconsistent
 * - Synthetic generation guarantees exact frequencies and pitch progression
 *
 * HOW IT WORKS:
 * - Uses Web Audio API to generate pure sine wave tones
 * - Each panel color maps to a specific frequency in the C major scale
 * - Short envelope (150ms) creates a pleasant "pluck" sound
 *
 * INTEGRATION:
 * - CollapsiblePanel.tsx calls gradientSynth.playGradientTone(color)
 * - Replaces the file-based gradient sounds from soundConfig.ts
 *
 * @author ButtonStudio Audio Team
 * @version 1.0.0 - Synthetic gradient system
 */

import { SYNTHETIC_SOUNDS } from "./soundConfig.ts";

// Extract frequencies from config for easy access
const GRADIENT_FREQUENCIES = Object.entries(
  SYNTHETIC_SOUNDS.gradientPanels,
).reduce((acc, [color, config]) => {
  acc[color] = config.frequency;
  return acc;
}, {} as Record<string, number>);

class GradientSynthesizer {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // Resume suspended context (browser autoplay policy)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {
        // Silent fail - will work on next interaction
      });
    }

    return this.audioContext;
  }

  playGradientTone(color: string) {
    const frequency =
      GRADIENT_FREQUENCIES[color as keyof typeof GRADIENT_FREQUENCIES] || 440;

    try {
      const context = this.getContext();

      // Skip if context isn't running yet (browser autoplay policy)
      if (context.state !== "running") {
        return;
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      // Create a pleasant sine wave tone
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);

      // Shape the envelope - quick attack, short sustain, quick decay
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.02); // Attack
      gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05); // Decay
      gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.1); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.15); // Release

      // Connect the nodes
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Play the tone
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.15);
    } catch (_error) {
      // Silent failure - audio playback errors are non-critical
      // Most common cause: user hasn't interacted with page yet (browser policy)
      // The sound will play on next interaction
    }
  }

  // Play a chromatic scale for testing
  playTestScale() {
    const colors = ["red", "orange", "yellow", "purple", "cyan", "green"];
    colors.forEach((color, index) => {
      setTimeout(() => {
        this.playGradientTone(color);
      }, index * 200);
    });
  }
}

export const gradientSynth = new GradientSynthesizer();
