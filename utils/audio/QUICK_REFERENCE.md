# ButtonStudio Audio - Quick Reference

## 🚀 **Quick Start**

```typescript
// Import the modular sound system
import { playSound } from '../utils/audio/soundMapping.ts'

// Use in any component
onClick={() => {
  playSound.selectionSelect()  // For selection buttons
  hapticService.buttonPress()
}}
onMouseEnter={() => playSound.hover()}  // Always use for hovers
```

### 🤖 **Auto-Generated API**

The `playSound` interface is automatically generated from `soundConfig.ts`:

- Add new categories → Get new `playSound.*` functions automatically
- Change sound mappings → Functions update automatically
- No manual maintenance needed!

## 🎨 **Sound Colors & Usage**

| Color   | Freq  | Feel               | Best For            |
| ------- | ----- | ------------------ | ------------------- |
| `slate` | 200Hz | Deep & muted       | Deselection, cancel |
| `amber` | 280Hz | Warm & gentle      | Selection, confirm  |
| `coral` | 350Hz | Bright & crisp     | Primary actions     |
| `sage`  | 320Hz | Natural & balanced | Completion, success |
| `pearl` | 400Hz | Smooth & refined   | Copy, export        |

## 🔧 **Common Patterns**

### Selection Buttons (shapes, themes, colors)

```typescript
onClick={() => {
  updateSomething(value)
  playSound.selectionSelect()  // amber
  hapticService.buttonPress()
}}
```

### Primary Action Buttons (dice, reset, submit)

```typescript
onClick={() => {
  doMainAction()
  playSound.primaryClick()  // coral
  hapticService.buttonPress()
}}
```

### Export/Copy Actions

```typescript
onClick={() => {
  navigator.clipboard.writeText(code)
  playSound.copyCode()  // sage
  hapticService.buttonPress()
}}
```

### Panel Headers

```typescript
onClick={() => {
  const wasOpen = isOpen
  setIsOpen(!isOpen)
  if (wasOpen) {
    playSound.panelCollapse()
  } else {
    playSound.panelExpand()
  }
}}
```

## 📂 **File Locations**

```
utils/audio/
├── soundConfig.ts       # 🎛️ Central configuration (NEW!)
├── soundMapping.ts      # 👈 Import playSound from here
├── synthEngine.ts       # Button sound presets  
├── soundService.ts      # UI feedback sounds
├── hapticService.ts     # Vibration patterns
├── README.md           # Full documentation
├── CHANGELOG.md        # Version history  
└── QUICK_REFERENCE.md  # This file
```

## 🎯 **Do's and Don'ts**

### ✅ **Do**

- Always use `playSound.hover()` for hover sounds
- Use `playSound.*` functions instead of direct calls
- Add haptic feedback with sound feedback
- Test on mobile devices

### ❌ **Don't**

- Mix UI sounds (MP3) with button sounds (synthesis)
- Use sounds longer than 0.2 seconds for buttons
- Forget hover sounds on interactive elements
- Hardcode sound calls in components

## 🛠 **Maintenance**

### To Change All Selection Sounds

Edit `soundConfig.ts`:

```typescript
SOUND_CATEGORIES = {
  selectionButtons: {
    select: () => SOUND_LIBRARY.interactions.clickMedium, // Change this
    deselect: () => SOUND_LIBRARY.interactions.clickLight,
  },
};
```

### To Swap Sound Packs

Edit `soundConfig.ts`:

```typescript
SOUND_LIBRARY = {
  interactions: {
    hover: "new-hover.mp3", // Change filenames
    clickLight: "new-click.mp3", // Or entire sections
  },
};
```

### To Add New Sound Category

```typescript
import { addSoundCategory } from "./soundConfig.ts";

addSoundCategory("modalControls", {
  open: () => SOUND_LIBRARY.navigation.panelOpen,
  close: () => SOUND_LIBRARY.navigation.panelClose,
  description: "Modal dialog interactions",
});
```

### To Add New Button Sound

1. Add preset to `SOUND_PRESETS` in `synthEngine.ts`
2. Update types in `customization.ts`
3. Add to SoundPicker component
