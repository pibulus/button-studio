# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ButtonStudio is a Deno Fresh application that creates customizable voice recording buttons with real-time transcription using Google Gemini. It features a visual design studio for creating personalized voice buttons with extensive customization options.

## Key Technologies

- **Framework**: Deno Fresh 1.7.3 (file-based routing, islands architecture)
- **Runtime**: Deno (TypeScript-first, no Node.js dependencies)
- **Frontend**: Preact with signals for reactive state management
- **Styling**: Twind (Tailwind CSS-in-JS) with extensive custom theme
- **Audio**: Web APIs (MediaRecorder, AudioContext) with custom waveform analysis
- **AI**: Google Gemini for speech-to-text transcription

## Common Development Commands

```bash
# Start development server
deno task start

# Format and lint check
deno task check

# Build for production
deno task build

# Preview production build
deno task preview

# Update Fresh dependencies
deno task update
```

## Architecture Overview

### Core Application Structure

- **Entry Points**: `main.ts` (production), `dev.ts` (development)
- **Configuration**: `fresh.config.ts` (Fresh + Twind setup)
- **Routes**: File-based routing in `routes/` directory
- **Islands**: Interactive components in `islands/` (client-side hydration)
- **Components**: Reusable UI components in `components/`

### Key Components

1. **VoiceButton** (`components/VoiceButton.tsx`): Main voice recording component with configurable appearance, recording states, and transcription
2. **CustomizationPanel** (`components/CustomizationPanel.tsx`): Main design interface with collapsible sections and color-coded panels
3. **ButtonStudio** (`islands/ButtonStudio.tsx`): Main island that orchestrates the entire button design experience
4. **EmojiPicker** (`components/EmojiPicker.tsx`): Custom emoji/text selection interface  
5. **Toast** (`components/Toast.tsx`): Notification system for user feedback

### State Management Pattern

Uses Preact signals for reactive state management:
- `buttonConfig` signal in VoiceButtonStudio for design configuration
- `buttonState` signal in VoiceButton for recording states
- `transcript` signal for transcription results

### Audio Processing Flow

1. **Recording**: `AudioRecorder` class handles MediaRecorder setup with optimized settings for speech
2. **Analysis**: `AudioAnalyzer` class provides real-time waveform data during recording
3. **Transcription**: Gemini API integration for speech-to-text processing
4. **Feedback**: Haptic feedback patterns and visual state transitions

### Design System ("Soft Stack")

Custom Twind theme with three main design languages:
- **Soft Stack**: Warm, friendly aesthetic with rounded corners and gentle shadows
- **Flamingo Brutalist**: Bold, chunky design with strong colors and pronounced shadows
- **Voice/Amber**: Clean, professional appearance

## File Organization

```
/
├── routes/           # Fresh file-based routing
├── islands/          # Client-side interactive components
├── components/       # Shared UI components
├── utils/           # Utility functions (audio processing)
├── types/           # TypeScript type definitions
├── plugins/         # AI transcription plugins
├── static/          # Static assets
└── twind.config.ts  # Comprehensive design system
```

## Development Patterns

### Component Props Pattern
Components use comprehensive config objects rather than many individual props:
```typescript
buttonConfig: {
  content: { text: string, autoScale: boolean }
  size: { width: number, height: number }
  shape: { type: 'circle' | 'square' | 'rectangle', borderRadius: number }
  appearance: { fill, border, shadow }
}
```

### Error Handling
Custom `VoiceButtonError` class with specific error codes for audio permission, recording, and transcription failures.

### Styling Approach
- Twind for utility-first CSS with extensive custom theme
- Dynamic inline styles for user-customizable properties
- State-based animations using CSS classes
- Custom slider styling for design controls

### CustomizationPanel Color System
The `CustomizationPanel` uses a color-coded design system for visual organization:
- **Panel Headers**: Each collapsible panel has a distinct color (red, orange, pink, yellow, cyan, purple, green, blue)
- **Color Mapping**: Uses `getBackgroundColor()` function to map color keys to Tailwind classes
- **Button Theming**: Panel buttons inherit colors from their parent panel via `getButtonColors()`
- **Available Colors**: lightest, light, medium, warm, cool, deep, effects, recording, juice
- **CSS Scoping**: Juice sliders use `.juice-slider` class with `!important` declarations for specificity

## Testing and Quality

- Linting with Deno's built-in linter
- Type checking with TypeScript
- Format checking with Deno formatter
- No specific test framework currently configured

## Key APIs and Integrations

- **MediaRecorder API**: For audio recording with opus codec preference
- **AudioContext API**: For real-time waveform visualization
- **Clipboard API**: For automatic transcript copying
- **Vibration API**: For haptic feedback on mobile devices
- **Google Gemini API**: For speech transcription (API key required)

## Development Notes

- The app uses Deno's permission system - audio recording requires microphone permissions
- Fresh's island architecture means only `islands/` components run on the client
- The design studio provides real-time preview of button configurations
- Audio settings are optimized for speech recognition (16kHz, noise suppression, echo cancellation)