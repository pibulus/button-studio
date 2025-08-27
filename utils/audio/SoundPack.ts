/**
 * Sound Pack System
 * 
 * Modular sound pack loader with automatic format conversion,
 * pitch variations, and gradient mapping support.
 * 
 * @author SoftStack Audio Team
 * @version 1.0.0
 */

import { WebAudioProcessor, GradientSoundMapper } from './AudioProcessor.ts';

// ===================================================================
// TYPES & INTERFACES
// ===================================================================

export interface SoundPackManifest {
  name: string;
  version: string;
  author?: string;
  license?: string;
  description?: string;
  
  // Sound mappings by category
  sounds: {
    [category: string]: {
      [action: string]: string | SoundVariant;
    };
  };
  
  // Optional gradient configurations
  gradients?: {
    [name: string]: GradientConfig;
  };
  
  // Optional haptic mappings
  haptics?: {
    [action: string]: 'light' | 'medium' | 'heavy';
  };
  
  // Format preferences
  formats?: {
    preferred: string[];  // ['mp3', 'ogg', 'wav']
    fallback: 'synth' | 'silence' | 'error';
  };
}

interface SoundVariant {
  default: string;
  variants?: string[];
  pitch?: number;      // Default pitch shift
  volume?: number;     // Default volume
}

interface GradientConfig {
  baseSound: string;
  type: 'pitch' | 'filter' | 'volume';
  range: number;
  scale?: 'major' | 'minor' | 'pentatonic';
}

// ===================================================================
// SOUND PACK CLASS
// ===================================================================

export class SoundPack {
  private manifest: SoundPackManifest;
  private basePath: string;
  private processor: WebAudioProcessor;
  private gradientMapper: GradientSoundMapper;
  private loadedSounds: Map<string, AudioBuffer> = new Map();
  private formatSupport: Map<string, boolean> = new Map();

  constructor(
    manifest: SoundPackManifest,
    basePath: string = '/sounds'
  ) {
    this.manifest = manifest;
    this.basePath = basePath;
    this.processor = new WebAudioProcessor();
    this.gradientMapper = new GradientSoundMapper(this.processor);
    
    this.detectFormatSupport();
  }

  /**
   * Detect which audio formats the browser supports
   */
  private detectFormatSupport() {
    if (typeof window === 'undefined') return;
    
    const audio = new Audio();
    const formats = {
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'wav': 'audio/wav',
      'webm': 'audio/webm',
    };

    for (const [ext, mime] of Object.entries(formats)) {
      const canPlay = audio.canPlayType(mime);
      this.formatSupport.set(ext, canPlay === 'probably' || canPlay === 'maybe');
    }
  }

  /**
   * Get the best available format for a sound file
   */
  private getBestFormat(baseFileName: string): string {
    const preferred = this.manifest.formats?.preferred || ['mp3', 'ogg', 'wav'];
    
    for (const format of preferred) {
      if (this.formatSupport.get(format)) {
        return `${baseFileName}.${format}`;
      }
    }
    
    // Fallback to first available
    return `${baseFileName}.${preferred[0]}`;
  }

  /**
   * Play a sound by category and action
   * 
   * @example
   * pack.play('click.primary')
   * pack.play('hover', { pitch: 2 })
   */
  async play(
    path: string,
    options: {
      pitch?: number;
      volume?: number;
      detune?: number;
      variant?: number;  // Which variant to use
    } = {}
  ) {
    const [category, action = 'default'] = path.split('.');
    const soundConfig = this.manifest.sounds[category]?.[action];
    
    if (!soundConfig) {
      console.warn(`Sound not found: ${path}`);
      return;
    }

    let soundFile: string;
    let defaultOptions = {};

    if (typeof soundConfig === 'string') {
      soundFile = soundConfig;
    } else {
      // Handle variant configuration
      if (options.variant !== undefined && soundConfig.variants) {
        soundFile = soundConfig.variants[options.variant % soundConfig.variants.length];
      } else {
        soundFile = soundConfig.default;
      }
      
      // Apply default options from manifest
      defaultOptions = {
        pitch: soundConfig.pitch,
        volume: soundConfig.volume,
      };
    }

    // Merge options
    const finalOptions = { ...defaultOptions, ...options };
    
    // Get best format
    const fileName = this.getBestFormat(soundFile.replace(/\.[^.]+$/, ''));
    const url = `${this.basePath}/${this.manifest.name}/${fileName}`;
    
    // Play with pitch and effects
    return this.processor.playWithPitch(url, finalOptions);
  }

  /**
   * Create a gradient of sounds for UI elements
   * 
   * @example
   * const sounds = pack.createGradient('click', 4, { range: 8 });
   * buttons.forEach((btn, i) => {
   *   btn.onclick = () => sounds[i]();
   * });
   */
  createGradient(
    soundPath: string,
    steps: number = 4,
    options: {
      range?: number;        // Semitone range
      type?: 'pitch' | 'filter' | 'volume';
      scale?: 'major' | 'minor' | 'pentatonic';
    } = {}
  ): Array<() => Promise<void>> {
    const [category, action = 'default'] = soundPath.split('.');
    
    // Check for pre-configured gradient
    const gradientConfig = this.manifest.gradients?.[`${category}.${action}`];
    if (gradientConfig) {
      options = { ...gradientConfig, ...options };
    }

    const type = options.type || 'pitch';
    const range = options.range || 8;
    
    if (type === 'pitch') {
      // Pitch gradient
      const pitchValues = [];
      for (let i = 0; i < steps; i++) {
        const position = i / (steps - 1);
        const pitch = (position - 0.5) * range;
        pitchValues.push(pitch);
      }
      
      return pitchValues.map(pitch => 
        () => this.play(soundPath, { pitch })
      );
    } else if (type === 'volume') {
      // Volume gradient
      const volumes = [];
      for (let i = 0; i < steps; i++) {
        const volume = 0.3 + (0.7 * (i / (steps - 1)));
        volumes.push(volume);
      }
      
      return volumes.map(volume => 
        () => this.play(soundPath, { volume })
      );
    } else {
      // Filter gradient (brightness)
      // TODO: Implement filter gradient
      return Array(steps).fill(() => this.play(soundPath));
    }
  }

  /**
   * Create harmonic sounds for related elements
   */
  createHarmonicSet(
    soundPath: string,
    count: number = 4,
    scale: 'major' | 'minor' | 'pentatonic' = 'pentatonic'
  ) {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11, 12],
      minor: [0, 2, 3, 5, 7, 8, 10, 12],
      pentatonic: [0, 2, 4, 7, 9, 12],
    };

    const intervals = scales[scale];
    const sounds = [];

    for (let i = 0; i < count; i++) {
      const noteIndex = i % intervals.length;
      const pitch = intervals[noteIndex];
      sounds.push(() => this.play(soundPath, { pitch }));
    }

    return sounds;
  }

  /**
   * Preload all sounds in the pack
   */
  async preload(categories?: string[]) {
    const toLoad = categories || Object.keys(this.manifest.sounds);
    
    const promises = [];
    for (const category of toLoad) {
      const actions = this.manifest.sounds[category];
      if (!actions) continue;
      
      for (const [action, config] of Object.entries(actions)) {
        const file = typeof config === 'string' ? config : config.default;
        const fileName = this.getBestFormat(file.replace(/\.[^.]+$/, ''));
        const url = `${this.basePath}/${this.manifest.name}/${fileName}`;
        
        promises.push(this.processor.loadSound(url));
      }
    }
    
    await Promise.all(promises);
  }

  /**
   * Get manifest information
   */
  getInfo() {
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
}

// ===================================================================
// SOUND PACK MANAGER - Handle multiple packs
// ===================================================================

export class SoundPackManager {
  private packs: Map<string, SoundPack> = new Map();
  private activePack: string | null = null;
  private mixedMode: boolean = false;
  private categoryOverrides: Map<string, string> = new Map();

  /**
   * Load a sound pack
   */
  async loadPack(
    name: string,
    manifest: SoundPackManifest,
    basePath?: string
  ) {
    const pack = new SoundPack(manifest, basePath);
    this.packs.set(name, pack);
    
    if (!this.activePack) {
      this.activePack = name;
    }
    
    return pack;
  }

  /**
   * Switch active pack
   */
  switchPack(name: string) {
    if (!this.packs.has(name)) {
      throw new Error(`Pack '${name}' not loaded`);
    }
    this.activePack = name;
    this.mixedMode = false;
    this.categoryOverrides.clear();
  }

  /**
   * Use different packs for different categories
   */
  useMixed(overrides: Record<string, string>) {
    this.mixedMode = true;
    this.categoryOverrides.clear();
    
    for (const [category, packName] of Object.entries(overrides)) {
      if (!this.packs.has(packName)) {
        console.warn(`Pack '${packName}' not loaded`);
        continue;
      }
      this.categoryOverrides.set(category, packName);
    }
  }

  /**
   * Play a sound (automatically routes to correct pack)
   */
  play(path: string, options?: Parameters<SoundPack['play']>[1]) {
    const [category] = path.split('.');
    
    let pack: SoundPack | undefined;
    
    if (this.mixedMode && this.categoryOverrides.has(category)) {
      pack = this.packs.get(this.categoryOverrides.get(category)!);
    } else if (this.activePack) {
      pack = this.packs.get(this.activePack);
    }
    
    if (!pack) {
      console.warn(`No pack available for sound: ${path}`);
      return;
    }
    
    return pack.play(path, options);
  }

  /**
   * Create gradient sounds
   */
  createGradient(
    soundPath: string,
    steps: number,
    options?: Parameters<SoundPack['createGradient']>[2]
  ) {
    const [category] = soundPath.split('.');
    const packName = this.categoryOverrides.get(category) || this.activePack;
    const pack = packName ? this.packs.get(packName) : undefined;
    
    if (!pack) {
      console.warn(`No pack available for gradient: ${soundPath}`);
      return [];
    }
    
    return pack.createGradient(soundPath, steps, options);
  }
}

// ===================================================================
// EXPORT
// ===================================================================

export default {
  SoundPack,
  SoundPackManager,
};