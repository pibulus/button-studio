/**
 * Web Audio API Synthesis Engine for ButtonStudio
 *
 * Creates warm, analog-style button feedback sounds using pure Web Audio API.
 * These sounds are designed to feel like actual button presses - quick, subtle,
 * and satisfying. All sounds use abstract color names (slate, amber, coral, etc.)
 * and can be exported as standalone JavaScript code.
 *
 * Key Features:
 * - Button-perfect timing (0.08-0.15s duration)
 * - Analog warmth (sine waves, lowpass filtering, slight detuning)
 * - Exportable code (no external dependencies)
 * - Consistent volume levels (15% for subtlety)
 *
 * @example
 * // Play a button sound
 * await synthEngine.playSound(SOUND_PRESETS.coral)
 *
 * // Generate exportable code
 * const code = synthEngine.generateSoundCode(SOUND_PRESETS.amber)
 *
 * @author ButtonStudio Audio Team
 * @version 2.0.0 - Abstract color naming, button-optimized timing
 */

// Audio envelope configuration for natural sound shaping
export interface AudioEnvelope {
  attack: number; // Attack time in seconds
  decay: number; // Decay time in seconds
  sustain: number; // Sustain level (0-1)
  release: number; // Release time in seconds
}

// Sound synthesis configuration
export interface SynthConfig {
  type: "bloop" | "chime" | "pop" | "ding" | "candy";
  frequency: number; // Base frequency in Hz
  envelope: AudioEnvelope;
  modulation?: {
    type: "vibrato" | "tremolo" | "none";
    rate: number; // Modulation rate in Hz
    depth: number; // Modulation depth (0-1)
  };
  harmonics?: number[]; // Additional harmonic frequencies
  filter?: {
    type: "lowpass" | "highpass" | "bandpass";
    frequency: number;
    resonance: number;
  };
}

/**
 * Abstract Sound Presets - Button Feedback Collection
 *
 * Uses color names instead of descriptive terms to avoid misleading associations.
 * Each sound is optimized for button-like feedback with quick timing and subtle volume.
 *
 * Color System:
 * - slate: Deep & muted (200Hz) - For deselection, subtle actions
 * - amber: Warm & gentle (280Hz) - For selection, confirmations
 * - coral: Bright & crisp (350Hz) - For primary actions, dice rolls
 * - sage: Natural & balanced (320Hz) - For completion, exports
 * - pearl: Smooth & refined (400Hz) - For elegant actions, copy
 *
 * All sounds feature:
 * - Zero sustain for quick button feel
 * - 15% volume for subtlety
 * - Pure sine waves for analog warmth
 * - Lowpass filtering for button-like dampening
 */
export const SOUND_PRESETS: Record<string, SynthConfig> = {
  slate: {
    type: "slate",
    frequency: 200, // Deep, muted
    envelope: { attack: 0.02, decay: 0.08, sustain: 0.0, release: 0.12 }, // Very short & snappy
    modulation: { type: "none", rate: 0, depth: 0 }, // Clean
    filter: { type: "lowpass", frequency: 600, resonance: 0.5 }, // Muted button feel
  },

  amber: {
    type: "amber",
    frequency: 280, // Warm, gentle
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.0, release: 0.15 }, // Quick button feedback
    harmonics: [1, 1.2], // Minimal harmonics for button feel
    filter: { type: "lowpass", frequency: 800, resonance: 0.3 }, // Dampened like a button
  },

  coral: {
    type: "coral",
    frequency: 350, // Bright, crisp
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.0, release: 0.08 }, // Ultra quick pop
    modulation: { type: "none", rate: 0, depth: 0 }, // Clean button sound
    filter: { type: "lowpass", frequency: 900, resonance: 0.4 }, // Button dampening
  },

  sage: {
    type: "sage",
    frequency: 320, // Natural, balanced
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.12 }, // Short button ding
    harmonics: [1, 1.1], // Minimal harmonics
    filter: { type: "lowpass", frequency: 1000, resonance: 0.4 }, // Button-like filtering
  },

  pearl: {
    type: "pearl",
    frequency: 400, // Smooth, refined
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.0, release: 0.15 }, // Quick sweet button
    modulation: { type: "none", rate: 0, depth: 0 }, // No modulation for buttons
    filter: { type: "lowpass", frequency: 1100, resonance: 0.5 }, // Sweet but muted
  },
};

/**
 * Synthesis Engine Class
 */
export class SynthEngine {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext lazily to avoid autoplay restrictions
    this.initAudioContext();
  }

  private initAudioContext(): void {
    if (typeof window !== "undefined" && globalThis.AudioContext) {
      try {
        this.audioContext = new AudioContext();
      } catch (e) {
        console.warn("Web Audio API not supported:", e);
      }
    }
  }

  private async ensureAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (!this.audioContext) {
      throw new Error("Web Audio API not supported");
    }

    // Resume context if suspended (common on mobile)
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  // Play synthesized sound with Web Audio API (oscillators, filters, envelope)
  async playSound(config: SynthConfig): Promise<void> {
    const context = await this.ensureAudioContext();
    const now = context.currentTime;

    // Create master gain for volume control
    const masterGain = context.createGain();
    masterGain.connect(context.destination);

    // Create oscillators for base frequency and harmonics
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Base oscillator
    this.createOscillator(
      context,
      config.frequency,
      0.7,
      oscillators,
      gains,
      masterGain,
      config,
    );

    // Harmonic oscillators
    if (config.harmonics) {
      config.harmonics.forEach((harmonic, index) => {
        const volume = 0.3 / (index + 1); // Decreasing volume for higher harmonics
        this.createOscillator(
          context,
          config.frequency * harmonic,
          volume,
          oscillators,
          gains,
          masterGain,
          config,
        );
      });
    }

    // Apply modulation if specified
    if (config.modulation && config.modulation.type !== "none") {
      this.applyModulation(context, oscillators, gains, config.modulation, now);
    }

    // Apply filter if specified
    let filterNode: BiquadFilterNode | null = null;
    if (config.filter) {
      filterNode = this.createFilter(context, config.filter);

      // Reconnect through filter
      gains.forEach((gain) => {
        gain.disconnect();
        gain.connect(filterNode!);
      });
      filterNode.connect(masterGain);
    }

    // Apply envelope
    this.applyEnvelope(masterGain.gain, config.envelope, now);

    // Start all oscillators
    oscillators.forEach((osc) => osc.start(now));

    // Stop all oscillators after envelope completes
    const totalDuration = config.envelope.attack + config.envelope.decay +
      config.envelope.release;
    oscillators.forEach((osc) => osc.stop(now + totalDuration));
  }

  private createOscillator(
    context: AudioContext,
    frequency: number,
    volume: number,
    oscillators: OscillatorNode[],
    gains: GainNode[],
    destination: AudioNode,
    config: SynthConfig,
  ): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    // MUCH SOFTER waveforms - all sine for analog warmth
    oscillator.type = "sine"; // Everything is sine for maximum warmth

    // Add slight detuning for analog character
    const detune = (Math.random() - 0.5) * 3; // ±1.5 cents for analog drift
    oscillator.detune.value = detune;

    oscillator.frequency.value = frequency;
    gain.gain.value = volume * 0.15; // Button-like volume - 15% for subtle feedback

    oscillator.connect(gain);
    if (!config.filter) {
      gain.connect(destination);
    }

    oscillators.push(oscillator);
    gains.push(gain);
  }

  private applyModulation(
    context: AudioContext,
    oscillators: OscillatorNode[],
    gains: GainNode[],
    modulation: NonNullable<SynthConfig["modulation"]>,
    startTime: number,
  ): void {
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    lfo.frequency.value = modulation.rate;
    lfo.type = "sine";
    lfoGain.gain.value = modulation.depth;

    lfo.connect(lfoGain);

    if (modulation.type === "vibrato") {
      // Frequency modulation
      oscillators.forEach((osc) => {
        lfoGain.connect(osc.frequency);
      });
    } else if (modulation.type === "tremolo") {
      // Amplitude modulation
      gains.forEach((gain) => {
        lfoGain.connect(gain.gain);
      });
    }

    lfo.start(startTime);
    lfo.stop(startTime + 2); // Stop LFO after 2 seconds
  }

  private createFilter(
    context: AudioContext,
    filterConfig: NonNullable<SynthConfig["filter"]>,
  ): BiquadFilterNode {
    const filter = context.createBiquadFilter();
    filter.type = filterConfig.type;
    filter.frequency.value = filterConfig.frequency;
    filter.Q.value = filterConfig.resonance;
    return filter;
  }

  private applyEnvelope(
    gainParam: AudioParam,
    envelope: AudioEnvelope,
    startTime: number,
  ): void {
    const { attack, decay, sustain, release } = envelope;

    // Start at 0
    gainParam.setValueAtTime(0, startTime);

    // Attack: ramp up to 1
    gainParam.linearRampToValueAtTime(1, startTime + attack);

    // Decay: ramp down to sustain level
    gainParam.linearRampToValueAtTime(sustain, startTime + attack + decay);

    // Release: ramp down to 0
    gainParam.linearRampToValueAtTime(0, startTime + attack + decay + release);
  }

  // Generate standalone JavaScript code for button export (no dependencies)
  generateSoundCode(config: SynthConfig): string {
    return `
// Generated ButtonStudio sound - ${config.type}
function playButtonSound() {
  if (typeof AudioContext === 'undefined') return;
  
  const context = new AudioContext();
  const now = context.currentTime;
  
  // Sound configuration
  const config = ${JSON.stringify(config, null, 2)};
  
  // Create master gain
  const masterGain = context.createGain();
  masterGain.connect(context.destination);
  
  // Create main oscillator
  const osc = context.createOscillator();
  const gain = context.createGain();
  
  osc.type = '${this.getWaveformForType(config.type)}';
  osc.frequency.value = config.frequency;
  gain.gain.value = 0.7;
  
  osc.connect(gain);
  ${
      config.filter
        ? `
  // Apply filter
  const filter = context.createBiquadFilter();
  filter.type = '${config.filter.type}';
  filter.frequency.value = ${config.filter.frequency};
  filter.Q.value = ${config.filter.resonance};
  gain.connect(filter);
  filter.connect(masterGain);`
        : "gain.connect(masterGain);"
    }
  
  // Apply envelope
  const env = config.envelope;
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(1, now + env.attack);
  masterGain.gain.linearRampToValueAtTime(env.sustain, now + env.attack + env.decay);
  masterGain.gain.linearRampToValueAtTime(0, now + env.attack + env.decay + env.release);
  
  // Play sound
  osc.start(now);
  osc.stop(now + env.attack + env.decay + env.release);
}`;
  }

  private getWaveformForType(type: string): string {
    switch (type) {
      case "bloop":
      case "candy":
        return "sine";
      case "pop":
        return "triangle";
      case "chime":
      case "ding":
        return "square";
      default:
        return "sine";
    }
  }
}

// Export singleton instance
export const synthEngine = new SynthEngine();

// Convenience functions for playing preset sounds
export const buttonSounds = {
  playSlate: () => synthEngine.playSound(SOUND_PRESETS.slate),
  playAmber: () => synthEngine.playSound(SOUND_PRESETS.amber),
  playCoral: () => synthEngine.playSound(SOUND_PRESETS.coral),
  playSage: () => synthEngine.playSound(SOUND_PRESETS.sage),
  playPearl: () => synthEngine.playSound(SOUND_PRESETS.pearl),
};
