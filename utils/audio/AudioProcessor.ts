/**
 * Audio Processing Pipeline
 * 
 * Core audio processing with Web Audio API.
 * Handles caching, pitch shifting, and effects processing.
 * 
 * @module @softstack/sounds
 * @version 1.0.0
 */

// ===================================================================
// TYPES
// ===================================================================

export interface PlaybackOptions {
  pitch?: number;        // Semitones to shift (-24 to +24)
  volume?: number;       // Volume level (0 to 1)
  detune?: number;       // Fine tuning in cents (-100 to +100)
  playbackRate?: number; // Speed multiplier (0.25 to 4)
}

export interface EffectOptions {
  lowpass?: number;      // Frequency cutoff for warmth (20-20000)
  highpass?: number;     // Frequency cutoff for brightness (20-20000)
  delay?: number;        // Delay time in seconds (0-5)
  reverb?: number;       // Reverb amount (0-1) - future enhancement
  distortion?: number;   // Distortion amount (0-1) - future enhancement
}

// ===================================================================
// WEB AUDIO PROCESSOR
// ===================================================================

export class WebAudioProcessor {
  private context: AudioContext | null = null;
  private cache: Map<string, AudioBuffer> = new Map();
  private maxCacheSize = 100; // Prevent memory leaks

  constructor() {
    this.initContext();
  }

  /**
   * Initialize or resume audio context
   */
  private async initContext(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (iOS requirement)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Load and cache an audio buffer with error handling
   */
  async loadSound(url: string): Promise<AudioBuffer> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      // Ensure context is ready
      await this.initContext();
      if (!this.context) throw new Error('AudioContext not available');

      // Fetch audio data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      // Manage cache size
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Play a sound with optional pitch and volume adjustments
   */
  async playWithPitch(
    url: string,
    options: PlaybackOptions = {}
  ): Promise<AudioBufferSourceNode> {
    await this.initContext();
    if (!this.context) throw new Error('AudioContext not available');

    const audioBuffer = await this.loadSound(url);
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = audioBuffer;
    
    // Apply pitch shift (preserves duration unlike playbackRate)
    if (options.pitch !== undefined) {
      const clampedPitch = Math.max(-24, Math.min(24, options.pitch));
      source.playbackRate.value = Math.pow(2, clampedPitch / 12);
    }

    // Fine-tune with cents
    if (options.detune !== undefined) {
      source.detune.value = Math.max(-100, Math.min(100, options.detune));
    }

    // Direct playback rate control (affects both pitch and duration)
    if (options.playbackRate !== undefined) {
      source.playbackRate.value = Math.max(0.25, Math.min(4, options.playbackRate));
    }

    // Volume control with smooth ramping to prevent clicks
    const targetVolume = Math.max(0, Math.min(1, options.volume ?? 1));
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(targetVolume, this.context.currentTime + 0.01);

    // Connect audio graph
    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);
    return source;
  }

  /**
   * Apply real-time effects to a sound
   */
  async playWithEffects(
    url: string,
    effects: EffectOptions = {},
    playbackOptions: PlaybackOptions = {}
  ): Promise<AudioBufferSourceNode> {
    await this.initContext();
    if (!this.context) throw new Error('AudioContext not available');

    const audioBuffer = await this.loadSound(url);
    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;

    // Apply playback options
    if (playbackOptions.pitch !== undefined) {
      const clampedPitch = Math.max(-24, Math.min(24, playbackOptions.pitch));
      source.playbackRate.value = Math.pow(2, clampedPitch / 12);
    }

    let currentNode: AudioNode = source;

    // Build effects chain
    if (effects.lowpass && effects.lowpass < 20000) {
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = Math.max(20, effects.lowpass);
      currentNode.connect(filter);
      currentNode = filter;
    }

    if (effects.highpass && effects.highpass > 20) {
      const filter = this.context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = Math.min(20000, effects.highpass);
      currentNode.connect(filter);
      currentNode = filter;
    }

    if (effects.delay && effects.delay > 0) {
      const delay = this.context.createDelay(5);
      const feedback = this.context.createGain();
      const mix = this.context.createGain();

      delay.delayTime.value = Math.min(5, effects.delay);
      feedback.gain.value = 0.4;
      mix.gain.value = 0.5;

      // Create delay feedback loop
      currentNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      
      // Mix dry and wet signals
      delay.connect(mix);
      currentNode.connect(mix);
      currentNode = mix;
    }

    // Apply final volume
    const gainNode = this.context.createGain();
    gainNode.gain.value = playbackOptions.volume ?? 1;
    currentNode.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);
    return source;
  }

  /**
   * Clear the audio cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; urls: string[] } {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.keys())
    };
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    this.clearCache();
    if (this.context && this.context.state !== 'closed') {
      await this.context.close();
    }
    this.context = null;
  }
}

// ===================================================================
// EXPORT
// ===================================================================

export default WebAudioProcessor;