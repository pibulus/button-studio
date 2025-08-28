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

// Musical scale frequencies (in Hz) - C major scale
const GRADIENT_FREQUENCIES = {
  red: 261.63, // C4 - lowest
  orange: 293.66, // D4
  yellow: 329.63, // E4
  purple: 392.00, // G4
  cyan: 440.00, // A4
  green: 493.88, // B4 - highest
  blue: 349.23, // F4 (backup)
  pink: 369.99, // F#4 (backup)
};

class GradientSynthesizer {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  playGradientTone(color: string) {
    const frequency =
      GRADIENT_FREQUENCIES[color as keyof typeof GRADIENT_FREQUENCIES] || 440;

    try {
      const context = this.getContext();
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
    } catch (error) {
      console.error("Failed to play gradient tone:", error);
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
