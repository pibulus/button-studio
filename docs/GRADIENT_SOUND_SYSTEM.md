# 🎨 Gradient Sound System Documentation

## Overview

ButtonSpa features a sophisticated gradient sound system where different colored
UI panels play distinct tones, creating a musical interface that provides
spatial awareness and enhances the user experience.

## Architecture

### Sound Mapping System

The gradient sounds are part of the unified sound system defined in three key
files:

1. **`soundConfig.ts`** - Defines the sound file mappings:
   ```typescript
   gradient: {
     red: "kenney/variations/pluck_001_low",    // Deepest tone
     orange: "kenney/variations/pluck_001",      // Mid-low tone
     yellow: "kenney/variations/pluck_001_high", // Mid-high tone  
     purple: "kenney/variations/glass_001_high", // Highest tone
     green: "kenney/variations/select_001",      // Alternative mid
     cyan: "kenney/variations/glass_001_low",    // Alternative low glass
     blue: "kenney/variations/select_001_high",  // Alternative high
     pink: "kenney/variations/glass_001",        // Alternative glass
   }
   ```

2. **`soundMapping.ts`** - Dynamically generates playSound functions:
   - Creates functions like `playSound.gradientPanelsRed()`
   - Provides helper function `playSound.gradientPanel(color)`
   - Preserves "Panels" in gradientPanels category name

3. **`soundTypes.ts`** - TypeScript interface for discoverability

## Panel Color Usage

### CustomizationPanel (Right side panels)

- **Design Panel**: `red` - Deepest pluck tone
- **Feel Panel**: `orange` - Mid-low pluck tone
- **Ship Panel**: `yellow` - Mid-high pluck tone
- **Magic Panel**: `purple` - Highest glass tone

### ButtonSpa (Left side panels)

- **Colors Panel**: `cyan` - Low glass tone
- **Size & Shape Panel**: `green` - Mid select tone

## Implementation Details

### CollapsiblePanel Component

```typescript
// Each panel plays its gradient sound on hover
const playGradientSound = throttleSound(
  () => playSound.gradientPanel(color),
  200,  // Throttle per panel to prevent spam
  `gradient-panel-${id}`,  // Unique key per panel
);

<button onMouseEnter={() => playGradientSound()}>
```

### Throttling System

Each panel has its own throttle with a unique key to prevent:

- Sound spam when moving mouse quickly
- Overlapping sounds from the same panel
- Audio fatigue from excessive feedback

Throttle delay: 200ms per panel

## Sound Design Philosophy

The gradient system creates a **musical interface** where:

1. **Spatial Awareness**: Users learn which panel is which by tone
2. **Progressive Pitch**: Related panels have related tones
3. **Distinct Categories**: Different sound families (pluck vs glass) for
   different panel groups
4. **Accessibility**: Audio feedback helps users navigate without looking

## Testing

To verify gradient sounds are working:

1. Hover over each collapsible panel header
2. Each should play a distinct tone
3. Moving quickly across panels creates a musical scale
4. Throttling prevents sound spam

## Available Gradient Functions

All these functions are available via `playSound`:

- `playSound.gradientPanelsRed()` - Deepest pluck
- `playSound.gradientPanelsOrange()` - Mid-low pluck
- `playSound.gradientPanelsYellow()` - Mid-high pluck
- `playSound.gradientPanelsPurple()` - Highest glass
- `playSound.gradientPanelsGreen()` - Mid select
- `playSound.gradientPanelsCyan()` - Low glass
- `playSound.gradientPanelsBlue()` - High select
- `playSound.gradientPanelsPink()` - Mid glass

Plus the helper: `playSound.gradientPanel(color)`

## Future Enhancements

- User-customizable gradient sounds
- More color options
- Volume control per panel
- Sound theme packs with different instruments
