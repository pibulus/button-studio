/**
 * Audio Processing Pipeline
 * 
 * Built-in audio processing capabilities for the SoftStack Sound System.
 * Handles format conversion, silence detection, pitch shifting, and more.
 * Can use ffmpeg for preprocessing OR Web Audio API for real-time effects.
 * 
 * @author SoftStack Audio Team
 * @version 1.0.0
 */

// ===================================================================
// WEB AUDIO API PROCESSOR - Real-time effects in browser
// ===================================================================

export class WebAudioProcessor {
  private context: AudioContext | null = null;
  private cache: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.context = new AudioContext();
    }
  }

  /**
   * Load and cache an audio buffer
   */
  async loadSound(url: string): Promise<AudioBuffer> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
    
    this.cache.set(url, audioBuffer);
    return audioBuffer;
  }

  /**
   * Play a sound with optional pitch shift
   * 
   * @param url - Sound file URL
   * @param options - Playback options
   * @returns Audio source node for further manipulation
   */
  async playWithPitch(
    url: string,
    options: {
      pitch?: number;        // Semitones to shift (-12 to +12)
      volume?: number;       // 0 to 1
      detune?: number;      // Cents to detune (-100 to +100)
      playbackRate?: number; // Speed multiplier (0.5 = half speed, 2 = double)
    } = {}
  ) {
    if (!this.context) throw new Error('Web Audio API not available');

    const audioBuffer = await this.loadSound(url);
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = audioBuffer;
    
    // Apply pitch shift via playback rate (maintains duration)
    if (options.pitch !== undefined) {
      // Convert semitones to playback rate
      // +12 semitones = 2x frequency (one octave up)
      // -12 semitones = 0.5x frequency (one octave down)
      source.playbackRate.value = Math.pow(2, options.pitch / 12);
    }

    // Fine-tune with cents
    if (options.detune !== undefined) {
      source.detune.value = options.detune;
    }

    // Direct playback rate control
    if (options.playbackRate !== undefined) {
      source.playbackRate.value = options.playbackRate;
    }

    // Volume control
    if (options.volume !== undefined) {
      gainNode.gain.value = options.volume;
    }

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);
    return source;
  }

  /**
   * Create a gradient of pitched sounds from a single source
   * Perfect for UI elements with visual gradients
   * 
   * @param url - Base sound file
   * @param steps - Number of gradient steps
   * @param range - Semitone range (e.g., 12 for one octave)
   */
  createPitchGradient(
    url: string,
    steps: number = 4,
    range: number = 8
  ): Array<() => Promise<AudioBufferSourceNode>> {
    const pitches = [];
    const stepSize = range / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const pitch = -(range / 2) + (i * stepSize);
      pitches.push(() => this.playWithPitch(url, { pitch }));
    }

    return pitches;
  }

  /**
   * Apply real-time effects to a playing sound
   */
  async playWithEffects(
    url: string,
    effects: {
      lowpass?: number;    // Frequency cutoff for warmth
      highpass?: number;   // Frequency cutoff for brightness
      reverb?: number;     // Reverb amount (0-1)
      delay?: number;      // Delay time in seconds
      distortion?: number; // Distortion amount (0-1)
    } = {}
  ) {
    if (!this.context) throw new Error('Web Audio API not available');

    const audioBuffer = await this.loadSound(url);
    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;

    let currentNode: AudioNode = source;

    // Lowpass filter (warm/muffled sound)
    if (effects.lowpass) {
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = effects.lowpass;
      currentNode.connect(filter);
      currentNode = filter;
    }

    // Highpass filter (bright/tinny sound)
    if (effects.highpass) {
      const filter = this.context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = effects.highpass;
      currentNode.connect(filter);
      currentNode = filter;
    }

    // Simple delay effect
    if (effects.delay) {
      const delay = this.context.createDelay();
      const feedback = this.context.createGain();
      const mix = this.context.createGain();

      delay.delayTime.value = effects.delay;
      feedback.gain.value = 0.5;
      mix.gain.value = 0.5;

      currentNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(mix);
      currentNode.connect(mix);
      currentNode = mix;
    }

    currentNode.connect(this.context.destination);
    source.start(0);
    return source;
  }
}

// ===================================================================
// FFMPEG PROCESSOR - Preprocessing with silence detection
// ===================================================================

export class FFmpegProcessor {
  /**
   * Generate ffmpeg command for audio processing
   * Can be run server-side or via WASM in browser
   */
  static generateCommand(
    input: string,
    output: string,
    options: {
      format?: 'mp3' | 'ogg' | 'wav';
      bitrate?: string;          // e.g., '128k'
      silenceDetect?: boolean;   // Trim silence
      normalize?: boolean;       // Normalize volume
      pitch?: number;           // Semitones to shift
      tempo?: number;           // Speed change without pitch change
    } = {}
  ): string {
    const parts = ['ffmpeg', '-i', input];
    const filters = [];

    // Silence detection and removal
    if (options.silenceDetect) {
      // Remove silence from start and end
      filters.push('silenceremove=start_periods=1:start_silence=0.05:start_threshold=-50dB');
      filters.push('silenceremove=stop_periods=-1:stop_silence=0.05:stop_threshold=-50dB');
    }

    // Volume normalization
    if (options.normalize) {
      filters.push('loudnorm=I=-16:LRA=11:TP=-1.5');
    }

    // Pitch shifting
    if (options.pitch) {
      const semitoneRatio = Math.pow(2, options.pitch / 12);
      filters.push(`asetrate=44100*${semitoneRatio},aresample=44100`);
    }

    // Tempo change without pitch change
    if (options.tempo) {
      filters.push(`atempo=${options.tempo}`);
    }

    if (filters.length > 0) {
      parts.push('-af', filters.join(','));
    }

    // Output format and quality
    if (options.format === 'mp3') {
      parts.push('-acodec', 'mp3', '-ab', options.bitrate || '128k');
    } else if (options.format === 'ogg') {
      parts.push('-acodec', 'libvorbis', '-ab', options.bitrate || '128k');
    }

    parts.push(output);
    return parts.join(' ');
  }

  /**
   * Batch process audio files
   */
  static batchProcessCommands(
    files: string[],
    outputDir: string,
    options: Parameters<typeof FFmpegProcessor.generateCommand>[2]
  ): string[] {
    return files.map(file => {
      const basename = file.split('/').pop()?.replace(/\.[^.]+$/, '');
      const outputFormat = options.format || 'mp3';
      const output = `${outputDir}/${basename}.${outputFormat}`;
      return this.generateCommand(file, output, options);
    });
  }
}

// ===================================================================
// GRADIENT SOUND MAPPER - Map visual gradients to audio
// ===================================================================

export class GradientSoundMapper {
  private processor: WebAudioProcessor;

  constructor(processor: WebAudioProcessor) {
    this.processor = processor;
  }

  /**
   * Map a color gradient to sound pitches
   * 
   * @example
   * // For 4 buttons in purple gradient
   * const sounds = mapper.mapColorGradient(
   *   'click.mp3',
   *   ['#e9d5ff', '#d8b4fe', '#c084fc', '#9333ea'],
   *   { rangeInSemitones: 8 }
   * );
   * // Each sound plays the same click at different pitches
   */
  mapColorGradient(
    baseSound: string,
    colors: string[],
    options: {
      rangeInSemitones?: number;  // Total pitch range
      brightness?: boolean;       // Map to brightness instead of hue
      reverse?: boolean;          // Reverse pitch direction
    } = {}
  ) {
    const range = options.rangeInSemitones || 8;
    const count = colors.length;
    
    // Calculate pitch for each color
    const pitches = colors.map((color, index) => {
      let position = index / (count - 1); // 0 to 1
      if (options.reverse) position = 1 - position;
      
      // Map position to pitch range
      return (position - 0.5) * range;
    });

    // Return sound players with mapped pitches
    return pitches.map((pitch, index) => ({
      color: colors[index],
      pitch,
      play: () => this.processor.playWithPitch(baseSound, { pitch })
    }));
  }

  /**
   * Create harmonic intervals for related UI elements
   * Uses musical intervals for pleasing combinations
   */
  createHarmonicSet(
    baseSound: string,
    count: number = 4,
    scale: 'major' | 'minor' | 'pentatonic' = 'pentatonic'
  ) {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11, 12],      // Major scale
      minor: [0, 2, 3, 5, 7, 8, 10, 12],      // Natural minor
      pentatonic: [0, 2, 4, 7, 9, 12],        // Pentatonic (always sounds good)
    };

    const intervals = scales[scale];
    const sounds = [];

    for (let i = 0; i < count; i++) {
      const noteIndex = i % intervals.length;
      const octave = Math.floor(i / intervals.length);
      const pitch = intervals[noteIndex] + (octave * 12);
      
      sounds.push(() => this.processor.playWithPitch(baseSound, { pitch }));
    }

    return sounds;
  }
}

// ===================================================================
// USAGE EXAMPLES
// ===================================================================

/*
// Basic pitch shifting
const processor = new WebAudioProcessor();
processor.playWithPitch('click.mp3', { pitch: 4 }); // 4 semitones up

// Gradient sounds for buttons
const gradient = processor.createPitchGradient('click.mp3', 4, 8);
buttons.forEach((btn, i) => {
  btn.onclick = gradient[i]; // Each button plays different pitch
});

// Harmonic UI sounds
const mapper = new GradientSoundMapper(processor);
const harmonic = mapper.createHarmonicSet('hover.mp3', 5, 'pentatonic');

// FFmpeg preprocessing
const cmd = FFmpegProcessor.generateCommand(
  'input.ogg',
  'output.mp3',
  {
    format: 'mp3',
    silenceDetect: true,
    normalize: true,
    pitch: -2 // 2 semitones down
  }
);
*/

export default {
  WebAudioProcessor,
  FFmpegProcessor,
  GradientSoundMapper
};