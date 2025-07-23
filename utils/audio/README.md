# ButtonStudio Audio System

Version 3.0.0 - Modular audio feedback system with 100% UI coverage.

Two-track system: UI feedback sounds (MP3s) + exportable button sounds (Web
Audio synthesis). Designed to be portable between projects.

## Architecture Overview

### 🎵 **Dual-Track Audio System**

#### Track 1: UI/UX Sounds (MP3 Files)

- **Source**: RiffRap's proven sound library
- **Location**: `/static/sounds/`
- **Purpose**: Interface feedback (hovers, clicks, panels, etc.)
- **Implementation**: `soundService.ts`
- **Storage**: LocalStorage settings persistence

#### Track 2: Programmable Button Sounds (Web Audio API)

- **Source**: Custom synthesis engine
- **Location**: `synthEngine.ts`
- **Purpose**: Exportable button sounds that travel with code
- **Implementation**: Real-time synthesis with analog-style warmth
- **Export**: Generates standalone JavaScript code

## File Structure

```
utils/audio/
├── README.md                 # This documentation
├── soundConfig.ts           # 🆕 Universal configuration system
├── soundMapping.ts          # 🔄 Auto-generated sound mappings  
├── soundService.ts          # Track 1: UI/UX sounds (MP3)
├── hapticService.ts         # Vibration patterns for mobile
├── synthEngine.ts           # Track 2: Programmable sounds (Web Audio)
├── CHANGELOG.md            # Version history and migration notes
├── QUICK_REFERENCE.md      # Developer cheat sheet
└── SOUND_AUDIT.md          # Complete audit report
```

## Universal Configuration System 🆕

The new `soundConfig.ts` provides a portable, enterprise-grade sound system:

### Sound Library Management

```typescript
SOUND_LIBRARY = {
  interactions: { hover: "scroll-haptic.mp3", clickLight: "echo-button.mp3" },
  navigation: { panelOpen: "panel-swoosh.mp3", panelClose: "panel-close.mp3" },
  selection: { colorPick: "echo-button.mp3", shapeSelect: "shape-select.mp3" },
  // ... 7 total categories
};
```

### Sound Category Mapping

```typescript
SOUND_CATEGORIES = {
  selectionButtons: { select: () => SOUND_LIBRARY.selection.shapeSelect },
  toggleControls: { on: () => SOUND_LIBRARY.interactions.toggleOn },
  // ... auto-generates playSound.* API
};
```

## Sound Presets (Abstract Colors)

All button sounds use abstract color names to avoid misleading descriptors:

| Color   | Frequency | Feel               | Use Case                    |
| ------- | --------- | ------------------ | --------------------------- |
| `slate` | 200Hz     | Deep & muted       | Deselection, subtle actions |
| `amber` | 280Hz     | Warm & gentle      | Selection, confirmations    |
| `coral` | 350Hz     | Bright & crisp     | Primary actions, dice rolls |
| `sage`  | 320Hz     | Natural & balanced | Completion, exports         |
| `pearl` | 400Hz     | Smooth & refined   | Elegant actions, copy       |

## Modular Sound Mapping

The `soundMapping.ts` system allows easy bulk updates:

```typescript
// Change all selection sounds in one place
selectionButtons: {
  select: () => buttonSounds.playAmber(),
  deselect: () => buttonSounds.playSlate(),
}

// Update all primary action sounds at once
primaryButtons: {
  click: () => buttonSounds.playCoral(),
}
```

## Usage Patterns

### For UI Interactions

```typescript
import { playSound } from "../utils/audio/soundMapping.ts";

// Panel interactions
playSound.panelExpand();
playSound.panelCollapse();

// Button interactions
playSound.selectionSelect();
playSound.primaryClick();

// Universal hover (use everywhere)
playSound.hover();
```

### For Button Configuration

```typescript
// User selects button sound in UI
customization.sound = {
  enabled: true,
  type: "coral", // Abstract color name
  volume: 70,
};

// Button plays configured sound
await synthEngine.playSound(SOUND_PRESETS[customization.sound.type]);
```

### For Exports

```typescript
// Generates standalone JavaScript
const soundCode = synthEngine.generateSoundCode(SOUND_PRESETS["coral"]);
// Output: Complete playButtonSound() function with Web Audio code
```

## Sound Characteristics

### Button-Perfect Timing

- **Duration**: 0.08-0.15 seconds total
- **Envelope**: Quick attack → decay → zero sustain → immediate release
- **Volume**: 15% for subtle feedback
- **No modulation**: Clean, crisp button feel

### Analog Warmth

- **Waveform**: Pure sine waves for maximum warmth
- **Filtering**: Lowpass filters for analog character
- **Detuning**: ±1.5 cents for organic analog drift
- **Frequencies**: 200-400Hz range (tactile button feel)

## Settings & Persistence

### UI Sound Settings

- Stored in `localStorage` via `soundService.ts`
- Toggle: Enable/disable interface sounds
- Accessible via audio settings panel (🎵 icon)

### Haptic Settings

- Mobile device detection
- Vibration pattern library
- Toggle: Enable/disable vibration feedback

### Button Sound Configuration

- Part of main customization state
- Exports with button code
- Live preview in sound picker

## Integration Points

### Components Using Sound System ✅ 100% Coverage

- `CustomizationPanel.tsx` - **47/47 interactive elements** with consistent
  sound
- `SoundPicker.tsx` - Button sound selection and preview
- `AudioSettings.tsx` - System-wide audio controls
- `VoiceButton.tsx` - Plays configured button sounds
- `ButtonStudio.tsx` - Welcome sounds and dice interactions

### Sound Audit Results

- **Total Interactive Elements**: 47
- **Elements WITH Sound**: 47 (100%) ✅
- **Consistent Patterns**: All using `playSound.*` API
- **Performance**: No blocking, optimized for mobile

### Key Functions

- `playSound.*` - Modular sound mapping (recommended)
- `soundService.play*` - Direct UI sound calls
- `buttonSounds.play*` - Direct synthesis calls
- `synthEngine.playSound()` - Custom synthesis
- `hapticService.*` - Vibration patterns

## Future Maintenance

### Adding New Sound Categories

1. Add to `SOUND_MAPPING` in `soundMapping.ts`
2. Export via `playSound` object
3. Use consistently across components

### Changing Sound Assignments

1. Update mapping in `soundMapping.ts`
2. Changes apply to entire category automatically
3. No need to update individual components

### Adding New Button Sounds

1. Add preset to `SOUND_PRESETS` in `synthEngine.ts`
2. Update TypeScript types in `customization.ts`
3. Add to `SoundPicker.tsx` preset list

## Performance Notes

- **Lazy initialization**: AudioContext created on first use
- **Mobile optimization**: Resumes suspended contexts automatically
- **Memory efficient**: Synthesis vs. file loading
- **Export friendly**: No external dependencies in generated code

## Debugging

### Common Issues

- **No sound**: Check AudioContext permissions (user interaction required)
- **Mobile silence**: Ensure AudioContext.resume() after user gesture
- **Export issues**: Verify `generateSoundCode()` output format

### Debug Tools

- Browser DevTools → Console for audio errors
- `synthEngine.playSound()` for direct testing
- Audio settings panel for quick toggles
