// ===================================================================
// VOICE BUTTON AUDIO HANDLING
// Extracted from VoiceButton.tsx for better organization
// ===================================================================

import { signal } from "@preact/signals";
import {
  AudioAnalyzer,
  AudioRecorder,
  HapticPatterns,
  triggerHapticFeedback,
} from "../../utils/audio.ts";
import { ButtonState, ErrorCode, VoiceButtonError } from "../../types/core.ts";
import { TranscriptionPlugin } from "../../types/plugins.ts";
import { SOUND_PRESETS, synthEngine } from "../../utils/audio/synthEngine.ts";
import { toast } from "../Toast.tsx";

// ===================================================================
// AUDIO MANAGER CLASS
// Handles all audio recording and processing logic
// ===================================================================

export class VoiceButtonAudioManager {
  private recorder: AudioRecorder;
  private analyzer: AudioAnalyzer;
  private transcriptionPlugin?: TranscriptionPlugin;
  private enableHaptics: boolean;
  private enableAudio: boolean;
  private soundPreset: string;

  // State signals
  public buttonState = signal<ButtonState>("idle");
  public transcript = signal<string>("");
  public errorMessage = signal<string>("");
  public recordingDuration = signal<number>(0);
  public waveformData = signal<number[]>([]);

  private timerInterval?: number;
  private isProcessing = false;

  constructor(options: {
    transcriptionPlugin?: TranscriptionPlugin;
    enableHaptics?: boolean;
    enableAudio?: boolean;
    soundPreset?: string;
  }) {
    this.recorder = new AudioRecorder();
    this.analyzer = new AudioAnalyzer();
    this.transcriptionPlugin = options.transcriptionPlugin;
    this.enableHaptics = options.enableHaptics ?? true;
    this.enableAudio = options.enableAudio ?? true;
    this.soundPreset = options.soundPreset ?? "soft";
  }

  async initialize() {
    // Initialize audio components
    await this.analyzer.initialize();
  }

  async startRecording() {
    try {
      this.errorMessage.value = "";
      this.transcript.value = "";
      this.recordingDuration.value = 0;
      this.buttonState.value = "requesting";

      if (this.enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStart);
      }

      // Play start sound
      if (this.enableAudio) {
        const preset = SOUND_PRESETS[this.soundPreset];
        if (preset?.record) {
          synthEngine.playSound(preset.record);
        }
      }

      // Start recording
      await this.recorder.startRecording();
      this.buttonState.value = "recording";

      // Connect analyzer for waveform visualization
      const stream = this.recorder.getStream();
      if (stream) {
        await this.analyzer.connectStream(stream);
        this.startWaveformUpdate();
      }

      // Start duration timer
      this.startDurationTimer();
    } catch (error) {
      console.error("Recording error:", error);
      this.handleError(error);
    }
  }

  async stopRecording() {
    if (this.buttonState.value !== "recording") return;

    try {
      this.buttonState.value = "processing";
      this.stopDurationTimer();
      this.stopWaveformUpdate();

      if (this.enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStop);
      }

      // Play stop sound
      if (this.enableAudio) {
        const preset = SOUND_PRESETS[this.soundPreset];
        if (preset?.stop) {
          synthEngine.playSound(preset.stop);
        }
      }

      // Stop recording and get audio blob
      const audioBlob = await this.recorder.stopRecording();

      if (!audioBlob) {
        throw new VoiceButtonError(
          "No audio recorded",
          ErrorCode.RECORDING_FAILED,
        );
      }

      // Process transcription if plugin available
      if (this.transcriptionPlugin) {
        await this.processTranscription(audioBlob);
      } else {
        // No transcription plugin, just complete
        this.buttonState.value = "idle";
        toast.info("Recording saved (no transcription service configured)");
      }
    } catch (error) {
      console.error("Stop recording error:", error);
      this.handleError(error);
    }
  }

  private async processTranscription(audioBlob: Blob) {
    if (!this.transcriptionPlugin || this.isProcessing) return;

    try {
      this.isProcessing = true;

      const result = await this.transcriptionPlugin.transcribe(audioBlob);

      if (result?.text) {
        this.transcript.value = result.text;
        this.buttonState.value = "success";

        // Play success sound
        if (this.enableAudio) {
          const preset = SOUND_PRESETS[this.soundPreset];
          if (preset?.success) {
            synthEngine.playSound(preset.success);
          }
        }

        // Success haptic
        if (this.enableHaptics) {
          triggerHapticFeedback(HapticPatterns.success);
        }

        // Auto-reset after 2 seconds
        setTimeout(() => {
          if (this.buttonState.value === "success") {
            this.buttonState.value = "idle";
          }
        }, 2000);
      } else {
        throw new VoiceButtonError(
          "No transcription result",
          ErrorCode.TRANSCRIPTION_FAILED,
        );
      }
    } catch (error) {
      console.error("Transcription error:", error);
      this.handleError(error);
    } finally {
      this.isProcessing = false;
    }
  }

  private startDurationTimer() {
    this.timerInterval = setInterval(() => {
      this.recordingDuration.value++;
    }, 1000);
  }

  private stopDurationTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  private startWaveformUpdate() {
    const updateWaveform = () => {
      if (this.buttonState.value === "recording") {
        const data = this.analyzer.getWaveformData();
        this.waveformData.value = data;
        requestAnimationFrame(updateWaveform);
      }
    };
    updateWaveform();
  }

  private stopWaveformUpdate() {
    this.waveformData.value = [];
    this.analyzer.disconnect();
  }

  private handleError(error: unknown) {
    const voiceError = error instanceof VoiceButtonError
      ? error
      : new VoiceButtonError(
        (error as Error).message || "Recording failed",
        ErrorCode.RECORDING_FAILED,
      );

    this.errorMessage.value = voiceError.message;
    this.buttonState.value = "error";

    // Error haptic
    if (this.enableHaptics) {
      triggerHapticFeedback(HapticPatterns.error);
    }

    // Play error sound
    if (this.enableAudio) {
      const preset = SOUND_PRESETS[this.soundPreset];
      if (preset?.error) {
        synthEngine.playSound(preset.error);
      }
    }

    toast.error(voiceError.message);

    // Auto-reset after 3 seconds
    setTimeout(() => {
      if (this.buttonState.value === "error") {
        this.buttonState.value = "idle";
        this.errorMessage.value = "";
      }
    }, 3000);
  }

  cleanup() {
    this.stopDurationTimer();
    this.stopWaveformUpdate();
    this.analyzer.disconnect();
    this.recorder.cleanup();
  }

  // Getters for configuration
  getEnableHaptics() {
    return this.enableHaptics;
  }

  getEnableAudio() {
    return this.enableAudio;
  }

  getSoundPreset() {
    return this.soundPreset;
  }

  // Setters for configuration
  setEnableHaptics(value: boolean) {
    this.enableHaptics = value;
  }

  setEnableAudio(value: boolean) {
    this.enableAudio = value;
  }

  setSoundPreset(value: string) {
    this.soundPreset = value;
  }

  setTranscriptionPlugin(plugin: TranscriptionPlugin | undefined) {
    this.transcriptionPlugin = plugin;
  }
}
