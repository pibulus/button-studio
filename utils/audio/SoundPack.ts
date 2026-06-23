/**
 * Sound Pack System
 *
 * Modular sound pack loader with manifest-based configuration.
 * Supports automatic format detection, pitch variations, and theming.
 *
 * @module @softstack/sounds
 * @version 1.0.0
 */

import { PlaybackOptions, WebAudioProcessor } from "./AudioProcessor.ts";

// ===================================================================
// TYPES & INTERFACES
// ===================================================================

export interface SoundPackManifest {
  name: string;
  version: string;
  author?: string;
  license?: string;
  description?: string;

  // Sound mappings by category.action
  sounds: {
    [category: string]: {
      [action: string]: string | SoundVariant;
    };
  };

  // Optional gradient configurations
  gradients?: {
    [path: string]: GradientConfig;
  };

  // Optional haptic feedback mappings
  haptics?: {
    [action: string]: HapticStrength;
  };

  // Format preferences
  formats?: {
    preferred: AudioFormat[];
    fallback: FallbackStrategy;
  };
}

export interface SoundVariant {
  default: string;
  variants?: string[];
  pitch?: number; // Default pitch shift in semitones
  volume?: number; // Default volume (0-1)
}

export interface GradientConfig {
  baseSound: string;
  type: "pitch" | "filter" | "volume";
  range: number;
  scale?: MusicalScale;
}

export type AudioFormat = "mp3" | "ogg" | "wav" | "webm";
export type FallbackStrategy = "synth" | "silence" | "error";
export type HapticStrength = "light" | "medium" | "heavy";
export type MusicalScale = "major" | "minor" | "pentatonic" | "chromatic";

export interface SoundPackOptions {
  basePath?: string;
  preload?: boolean;
  maxCacheSize?: number;
}

export interface GradientOptions {
  range?: number;
  type?: "pitch" | "filter" | "volume";
  scale?: MusicalScale;
  reverse?: boolean;
}

// ===================================================================
// SOUND PACK CLASS
// ===================================================================

export class SoundPack {
  private manifest: SoundPackManifest;
  private basePath: string;
  private processor: WebAudioProcessor;
  private formatSupport: Map<AudioFormat, boolean> = new Map();

  constructor(
    manifest: SoundPackManifest,
    options: SoundPackOptions = {},
  ) {
    this.manifest = manifest;
    this.basePath = options.basePath || "/sounds";
    this.processor = new WebAudioProcessor();

    this.detectFormatSupport();

    if (options.preload) {
      this.preload().catch(console.error);
    }
  }

  /**
   * Detect which audio formats the browser supports
   */
  private detectFormatSupport(): void {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    const formatTests: Record<AudioFormat, string> = {
      "mp3": "audio/mpeg",
      "ogg": "audio/ogg",
      "wav": "audio/wav",
      "webm": "audio/webm",
    };

    for (const [ext, mime] of Object.entries(formatTests)) {
      const canPlay = audio.canPlayType(mime);
      this.formatSupport.set(
        ext as AudioFormat,
        canPlay === "probably" || canPlay === "maybe",
      );
    }
  }

  /**
   * Get the best available format for a sound file
   */
  private getBestFormat(baseFileName: string): string {
    // Remove any existing extension
    const cleanName = baseFileName.replace(/\.[^.]+$/, "");
    const preferred = this.manifest.formats?.preferred || ["mp3", "ogg", "wav"];

    for (const format of preferred) {
      if (this.formatSupport.get(format as AudioFormat)) {
        return `${cleanName}.${format}`;
      }
    }

    // Fallback to first format if none supported
    return `${cleanName}.${preferred[0]}`;
  }

  /**
   * Resolve sound file from manifest
   */
  private resolveSound(
    path: string,
  ): { file: string; options: PlaybackOptions } {
    const [category, action = "default"] = path.split(".");
    const soundConfig = this.manifest.sounds[category]?.[action];

    if (!soundConfig) {
      throw new Error(`Sound not found in manifest: ${path}`);
    }

    if (typeof soundConfig === "string") {
      return { file: soundConfig, options: {} };
    }

    return {
      file: soundConfig.default,
      options: {
        pitch: soundConfig.pitch,
        volume: soundConfig.volume,
      },
    };
  }

  /**
   * Play a sound by category and action path
   *
   * @example
   * pack.play('click.primary')
   * pack.play('hover', { volume: 0.5 })
   */
  async play(
    path: string,
    options: PlaybackOptions = {},
  ): Promise<AudioBufferSourceNode> {
    try {
      const { file, options: defaultOptions } = this.resolveSound(path);
      const fileName = this.getBestFormat(file);
      const url = `${this.basePath}/${this.manifest.name}/${fileName}`;

      // Merge default options from manifest with provided options
      const finalOptions = { ...defaultOptions, ...options };

      return await this.processor.playWithPitch(url, finalOptions);
    } catch (error) {
      console.error(`Error playing sound ${path}:`, error);

      // Handle fallback strategy
      const fallback = this.manifest.formats?.fallback || "silence";
      if (fallback === "error") {
        throw error;
      }
      // For 'silence' or 'synth', just return a dummy source
      return {} as AudioBufferSourceNode;
    }
  }

  /**
   * Play a random variant of a sound
   */
  async playVariant(
    path: string,
    options: PlaybackOptions = {},
  ): Promise<AudioBufferSourceNode> {
    const [category, action = "default"] = path.split(".");
    const soundConfig = this.manifest.sounds[category]?.[action];

    if (!soundConfig || typeof soundConfig === "string") {
      return this.play(path, options);
    }

    const variants = soundConfig.variants || [soundConfig.default];
    const randomFile = variants[Math.floor(Math.random() * variants.length)];
    const fileName = this.getBestFormat(randomFile);
    const url = `${this.basePath}/${this.manifest.name}/${fileName}`;

    const finalOptions = {
      pitch: soundConfig.pitch,
      volume: soundConfig.volume,
      ...options,
    };

    return await this.processor.playWithPitch(url, finalOptions);
  }

  /**
   * Create a gradient of sounds for UI elements
   *
   * @example
   * const sounds = pack.createGradient('click.primary', 4);
   * buttons.forEach((btn, i) => {
   *   btn.onclick = () => sounds[i]();
   * });
   */
  createGradient(
    soundPath: string,
    steps: number = 4,
    options: GradientOptions = {},
  ): Array<() => Promise<AudioBufferSourceNode>> {
    const type = options.type || "pitch";
    const range = options.range || 8;

    const sounds: Array<() => Promise<AudioBufferSourceNode>> = [];

    if (type === "pitch") {
      for (let i = 0; i < steps; i++) {
        const position = i / (steps - 1);
        const pitch = (position - 0.5) * range;
        sounds.push(() => this.play(soundPath, { pitch }));
      }
    } else if (type === "volume") {
      for (let i = 0; i < steps; i++) {
        const volume = 0.3 + (0.7 * (i / (steps - 1)));
        sounds.push(() => this.play(soundPath, { volume }));
      }
    } else {
      // Filter type - not implemented yet
      for (let i = 0; i < steps; i++) {
        sounds.push(() => this.play(soundPath));
      }
    }

    return sounds;
  }

  /**
   * Create harmonic sounds using musical scales
   */
  createHarmonicSet(
    soundPath: string,
    count: number = 4,
    scale: MusicalScale = "pentatonic",
  ): Array<() => Promise<AudioBufferSourceNode>> {
    const scales: Record<MusicalScale, number[]> = {
      major: [0, 2, 4, 5, 7, 9, 11, 12],
      minor: [0, 2, 3, 5, 7, 8, 10, 12],
      pentatonic: [0, 2, 4, 7, 9, 12],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    };

    const intervals = scales[scale];
    const sounds: Array<() => Promise<AudioBufferSourceNode>> = [];

    for (let i = 0; i < count; i++) {
      const noteIndex = i % intervals.length;
      const octave = Math.floor(i / intervals.length);
      const pitch = intervals[noteIndex] + (octave * 12);
      sounds.push(() => this.play(soundPath, { pitch }));
    }

    return sounds;
  }

  /**
   * Preload sounds for faster playback
   */
  async preload(categories?: string[]): Promise<void> {
    const toLoad = categories || Object.keys(this.manifest.sounds);
    const promises: Promise<AudioBuffer>[] = [];

    for (const category of toLoad) {
      const actions = this.manifest.sounds[category];
      if (!actions) continue;

      for (const [_action, config] of Object.entries(actions)) {
        const file = typeof config === "string" ? config : config.default;
        const fileName = this.getBestFormat(file);
        const url = `${this.basePath}/${this.manifest.name}/${fileName}`;
        promises.push(this.processor.loadSound(url));
      }
    }

    await Promise.all(promises);
  }

  /**
   * Get pack information
   */
  getInfo(): {
    name: string;
    version: string;
    author?: string;
    description?: string;
    soundCount: number;
    categories: string[];
  } {
    return {
      name: this.manifest.name,
      version: this.manifest.version,
      author: this.manifest.author,
      description: this.manifest.description,
      soundCount: Object.values(this.manifest.sounds)
        .reduce((acc, cat) => acc + Object.keys(cat).length, 0),
      categories: Object.keys(this.manifest.sounds),
    };
  }

  /**
   * Trigger haptic feedback if supported
   */
  triggerHaptic(action: string): void {
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;

    const strength = this.manifest.haptics?.[action] || "light";
    const patterns: Record<HapticStrength, number[]> = {
      light: [10],
      medium: [20],
      heavy: [40, 20, 40],
    };

    navigator.vibrate(patterns[strength]);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.processor.dispose();
  }
}

// ===================================================================
// SOUND PACK MANAGER - Handle multiple packs
// ===================================================================

export class SoundPackManager {
  private packs: Map<string, SoundPack> = new Map();
  private activePack: string | null = null;
  private categoryOverrides: Map<string, string> = new Map();

  /**
   * Load a sound pack
   */
  // deno-lint-ignore require-await
  async loadPack(
    name: string,
    manifest: SoundPackManifest,
    options?: SoundPackOptions,
  ): Promise<SoundPack> {
    const pack = new SoundPack(manifest, options);
    this.packs.set(name, pack);

    if (!this.activePack) {
      this.activePack = name;
    }

    return pack;
  }

  /**
   * Load pack from URL
   */
  async loadPackFromUrl(
    name: string,
    manifestUrl: string,
    options?: SoundPackOptions,
  ): Promise<SoundPack> {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }

    const manifest = await response.json() as SoundPackManifest;
    return this.loadPack(name, manifest, options);
  }

  /**
   * Switch active pack
   */
  switchPack(name: string): void {
    if (!this.packs.has(name)) {
      throw new Error(`Pack '${name}' not loaded`);
    }
    this.activePack = name;
    this.categoryOverrides.clear();
  }

  /**
   * Use different packs for different categories
   */
  useMixed(overrides: Record<string, string>): void {
    this.categoryOverrides.clear();

    for (const [category, packName] of Object.entries(overrides)) {
      if (!this.packs.has(packName)) {
        console.warn(
          `Pack '${packName}' not loaded, skipping override for '${category}'`,
        );
        continue;
      }
      this.categoryOverrides.set(category, packName);
    }
  }

  /**
   * Play a sound (automatically routes to correct pack)
   */
  async play(
    path: string,
    options?: PlaybackOptions,
  ): Promise<AudioBufferSourceNode | void> {
    const [category] = path.split(".");

    const packName = this.categoryOverrides.get(category) || this.activePack;
    if (!packName) {
      console.warn(`No pack available for sound: ${path}`);
      return;
    }

    const pack = this.packs.get(packName);
    if (!pack) {
      console.warn(`Pack '${packName}' not found`);
      return;
    }

    return await pack.play(path, options);
  }

  /**
   * Create gradient sounds
   */
  createGradient(
    soundPath: string,
    steps: number,
    options?: GradientOptions,
  ): Array<() => Promise<AudioBufferSourceNode>> {
    const [category] = soundPath.split(".");
    const packName = this.categoryOverrides.get(category) || this.activePack;
    const pack = packName ? this.packs.get(packName) : undefined;

    if (!pack) {
      console.warn(`No pack available for gradient: ${soundPath}`);
      return [];
    }

    return pack.createGradient(soundPath, steps, options);
  }

  /**
   * Get loaded packs info
   */
  getPacksInfo(): Array<
    { name: string; info: ReturnType<SoundPack["getInfo"]> }
  > {
    return Array.from(this.packs.entries()).map(([name, pack]) => ({
      name,
      info: pack.getInfo(),
    }));
  }

  /**
   * Get active pack
   */
  getActivePack(): SoundPack | undefined {
    return this.activePack ? this.packs.get(this.activePack) : undefined;
  }

  /**
   * Cleanup all packs
   */
  dispose(): void {
    for (const pack of this.packs.values()) {
      pack.dispose();
    }
    this.packs.clear();
    this.activePack = null;
    this.categoryOverrides.clear();
  }
}

// ===================================================================
// EXPORT
// ===================================================================

export default {
  SoundPack,
  SoundPackManager,
};
