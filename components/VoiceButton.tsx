// ===================================================================
// VOICE BUTTON - MAIN EXPORT
// This file now re-exports the refactored VoiceButton component
// The actual implementation has been split into smaller modules:
// - VoiceButtonCore.tsx: Main component logic
// - VoiceButtonUI.tsx: UI components (Icon, Recording, Waveform)
// - VoiceButtonAudio.tsx: Audio recording and processing logic
// ===================================================================

import VoiceButtonCore from "./voice/VoiceButtonCore.tsx";

// Re-export the refactored VoiceButton component
export default VoiceButtonCore;

// Also export the UI components for external use if needed
export {
  ButtonIcon,
  RecordingContent,
  WaveformVisualizer,
} from "./voice/VoiceButtonUI.tsx";
export { VoiceButtonAudioManager } from "./voice/VoiceButtonAudio.tsx";
