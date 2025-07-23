// Core VoiceButton Types
export type ButtonState =
  | "idle" // Ready to record - breathe animation
  | "requesting" // Requesting microphone permission
  | "recording" // Currently recording - pulse + waveform
  | "processing" // Transcribing audio - spinner
  | "success" // Completed successfully - checkmark pop
  | "error"; // Something went wrong - shake + error message

export type ButtonSize = "small" | "medium" | "large" | "xl" | "custom";

export type ThemeId = "amber" | "minimal" | "neon-cyber" | "organic" | "custom";

// Audio Types (based on Pablo's working MediaRecorder setup)
export interface AudioBlob {
  data: Blob;
  format: "webm" | "mp4" | "wav" | "mp3";
  duration: number;
  sampleRate?: number;
}

// Transcription Types
export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
  segments?: TranscriptionSegment[];
  metadata?: Record<string, unknown>;
}

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

// Error Types
export class VoiceButtonError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "VoiceButtonError";
  }
}

export enum ErrorCode {
  MICROPHONE_PERMISSION_DENIED = "MICROPHONE_PERMISSION_DENIED",
  MICROPHONE_NOT_AVAILABLE = "MICROPHONE_NOT_AVAILABLE",
  RECORDING_FAILED = "RECORDING_FAILED",
  RECORDING_TOO_SHORT = "RECORDING_TOO_SHORT",
  RECORDING_TOO_LONG = "RECORDING_TOO_LONG",
  TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED",
  TRANSCRIPTION_API_ERROR = "TRANSCRIPTION_API_ERROR",
  OUTPUT_FAILED = "OUTPUT_FAILED",
  INVALID_CONFIG = "INVALID_CONFIG",
  MISSING_API_KEY = "MISSING_API_KEY",
}

// Event Types
export interface VoiceButtonEvents {
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob: AudioBlob) => void;
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
  onComplete?: (result: TranscriptionResult) => void; // Main success callback
  onError?: (error: VoiceButtonError) => void;
  onStateChange?: (state: ButtonState) => void;
}
