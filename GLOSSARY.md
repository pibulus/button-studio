# Glossary - ButtonSpa

## Islands (Interactive Components)

- `ButtonStudio` - Main ButtonSpa design orchestration island
  (islands/ButtonStudio.tsx)
- `GradientSoundDemo` - Sound gradient demo (islands/GradientSoundDemo.tsx)

## Components (Shared UI)

- `VoiceButton` - Main voice recording component with transcription
  (components/VoiceButton.tsx)
- `CustomizationPanel` - Design interface with collapsible sections
  (components/CustomizationPanel.tsx)
- `EmojiPicker` - Custom emoji/text selection interface
  (components/EmojiPicker.tsx)
- `AudioSettings` - Global audio/haptic toggle controls
  (components/AudioSettings.tsx)
- `AudioVisualizer` - Real-time waveform visualization
  (components/AudioVisualizer.tsx)
- `SoundPicker` - Sound theme selection interface (components/SoundPicker.tsx)
- `ToastContainer` - Notification system (components/ToastContainer.tsx)
- `PWAShareModal` - PWA export modal (components/PWAShareModal.tsx)
- `InstallGuide` - PWA installation guide (components/InstallGuide.tsx)
- `KeyboardShortcutsModal` - Keyboard shortcuts help
  (components/KeyboardShortcutsModal.tsx)
- `LoadingSpinner` - Loading state component (components/LoadingSpinner.tsx)

## Audio System (`utils/audio/`)

- `soundMapping.ts` - Universal sound API (playSound.primaryClick(), etc.)
- `soundConfig.ts` - Centralized audio configuration
- `soundService.ts` - Web Audio API playback engine
- `synthEngine.ts` - Sound synthesis
- `hapticService.ts` - Haptic feedback patterns

## Export System (`utils/export/`)

- `ButtonExporter.ts` - Main export engine with Unicode support
- `templates/` - HTML, PWA, mobile app generators
- `shareLink.ts` - URL-safe encoding/decoding with compression

## Core Concepts

- **Soft Stack Design** - Warm pastels, rounded corners, gentle shadows
- **Flamingo Brutalist** - Bold, chunky design with strong colors
- **Export Formats** - HTML standalone, PWA, share links, embed code, mobile
  templates
- **Power User Features** - Auto-start recording, auto-copy transcripts, custom
  branding
- **Gemini Transcription** - Browser-compatible speech-to-text (user provides
  API key)
- **Signal-Based State** - Preact signals for buttonConfig, buttonState,
  transcript
- **Color-Coded Panels** - 8 colors for visual organization
  (red/orange/pink/yellow/cyan/purple/green/blue)
- **Monetization** - $1 per-button-feature unlocks (history, premium themes,
  power features)
