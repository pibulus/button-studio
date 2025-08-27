# 🎵 Sound System Evolution Plan
> ButtonStudio → Universal SoftStack Sound System

## 🎯 Mission
Transform ButtonStudio's sound system into a **portable, modular, extensible** audio framework that can power any SoftStack app (and beyond). Think: **"Tailwind for Sound"** - utility-first, composable, theme-able.

## 🏗️ Architecture Vision

### Core Principles (80/20 Rule)
1. **Simple by default** - `sounds.play('click')` just works
2. **Powerful when needed** - Full control over mixing, timing, effects
3. **Pack-based** - Swap entire sound themes instantly
4. **Format-agnostic** - .ogg, .mp3, .wav, synth - all work seamlessly
5. **Framework-agnostic** - Works with Deno, Node, React, Svelte, vanilla

### 📦 Sound Pack Structure
```
sound-packs/
├── kenney/                    # Interface Sounds pack
│   ├── manifest.json          # Pack metadata & mappings
│   ├── sounds/
│   │   ├── click_001.mp3     # Converted from .ogg
│   │   ├── hover_001.mp3
│   │   └── ...
│   └── preview.html           # Interactive preview page
├── retro/                     # Synth-based 8-bit pack
│   ├── manifest.json
│   └── synth-config.json     # Synth parameters instead of files
└── organic/                   # Natural, warm sounds
    ├── manifest.json
    └── sounds/
```

### 🔊 Manifest Structure
```json
{
  "name": "Kenney Interface Sounds",
  "version": "1.0.0",
  "author": "Kenney.nl",
  "license": "CC0",
  "categories": {
    "click": {
      "primary": "click_003.mp3",
      "secondary": "click_001.mp3",
      "variants": ["click_002.mp3", "click_004.mp3"]
    },
    "hover": {
      "default": "scroll_001.mp3",
      "gentle": "tick_001.mp3"
    },
    "success": "confirmation_002.mp3",
    "error": "error_003.mp3",
    "navigation": {
      "open": "open_002.mp3",
      "close": "close_002.mp3",
      "switch": "switch_003.mp3"
    }
  },
  "haptic": {
    "click": "light",
    "success": "medium",
    "error": "heavy"
  }
}
```

## 🛠️ Implementation Plan

### Phase 1: Foundation (Current Branch)
- [x] Create sounds branch
- [ ] Convert .ogg files to .mp3 with ffmpeg
- [ ] Organize Kenney sounds into categories
- [ ] Create manifest.json for Kenney pack
- [ ] Build SoundPack class with loading/caching

### Phase 2: Integration
- [ ] Update soundService.ts to use SoundPack system
- [ ] Create pack switcher UI in ButtonStudio
- [ ] Add volume controls per category
- [ ] Implement sound preview grid

### Phase 3: Export & Package
- [ ] Extract sound system to `/packages/sounds/`
- [ ] Create npm/deno package structure
- [ ] Build standalone demo page
- [ ] Write API documentation

### Phase 4: Polish & Extend
- [ ] Add more sound packs (retro, organic)
- [ ] Create SoundDesigner improvements
- [ ] Add mixing/layering capabilities
- [ ] Performance optimizations

## 🎨 API Design

### Basic Usage
```typescript
import { SoundSystem } from '@softstack/sounds'

// Initialize with pack
const sounds = new SoundSystem('kenney')

// Simple playback
sounds.play('click')           // Auto-maps to click.primary
sounds.play('hover.gentle')     // Specific variant
sounds.play('success', { volume: 0.5 })

// Category volume control
sounds.setCategoryVolume('navigation', 0.7)

// Global controls
sounds.mute()
sounds.unmute()
sounds.setMasterVolume(0.8)
```

### React/Preact Hook
```typescript
import { useSound } from '@softstack/sounds/react'

function MyButton() {
  const { play, isPlaying } = useSound()
  
  return (
    <button 
      onClick={() => play('click')}
      onMouseEnter={() => play('hover', { volume: 0.3 })}
    >
      Click Me
    </button>
  )
}
```

### Advanced Features
```typescript
// Pack switching
await sounds.loadPack('retro')
sounds.switchPack('retro', { fadeTime: 500 })

// Mixing packs
sounds.useMixed({
  click: 'kenney',
  hover: 'retro',
  feedback: 'organic'
})

// Queue & priority
sounds.queue('success', { delay: 100, priority: 'high' })

// Events
sounds.on('play', (sound) => console.log(`Playing: ${sound}`))
sounds.on('packLoaded', (packName) => console.log(`Loaded: ${packName}`))
```

## 📁 File Organization

### Current ButtonStudio
```
utils/audio/
├── soundService.ts       → Core playback engine (keep & enhance)
├── soundConfig.ts        → Current mappings (migrate to packs)
├── soundMapping.ts       → Dynamic mapping (evolve for packs)
├── synthEngine.ts        → Synth sounds (becomes retro pack)
└── SoundSystem.ts        → NEW: Main class for pack system
```

### Future Package Structure
```
@softstack/sounds/
├── src/
│   ├── SoundSystem.ts
│   ├── SoundPack.ts
│   ├── AudioEngine.ts
│   ├── formats/
│   │   ├── FilePlayer.ts
│   │   └── SynthPlayer.ts
│   └── hooks/
│       ├── react.ts
│       └── svelte.ts
├── packs/
│   ├── kenney/
│   ├── retro/
│   └── organic/
├── demo/
│   └── index.html
└── package.json
```

## 🎯 Success Metrics
- ✅ Can swap sound packs with one line of code
- ✅ Works in ButtonStudio without breaking anything
- ✅ Can be copied to any other project easily
- ✅ Performance: <50ms load time per sound
- ✅ Bundle size: <10KB core (excluding sound files)
- ✅ Developer experience: Intuitive, discoverable API

## 💭 Future Claude Notes
Hey future Claude! This document is **living** - feel free to:
- **Improve** the architecture if you find better patterns
- **Simplify** anything that feels over-engineered
- **Add** new sound packs or features that make sense
- **Refactor** for better performance or DX

Key decisions made:
- Chose .mp3 over .ogg for better compatibility
- Pack-based system over individual file management
- Category mapping for semantic sound usage
- Synth fallbacks for ultimate reliability

Current status will be tracked in git commits. Check the branch history for progress.

## 🔥 Quick Start Commands
```bash
# Convert .ogg files to .mp3
for f in ~/Downloads/'Interface Sounds'/Audio/*.ogg; do 
  ffmpeg -i "$f" -acodec mp3 -ab 128k "static/sounds/kenney/$(basename "${f%.ogg}.mp3")"
done

# Test current implementation
deno task start

# Run sound preview grid (when ready)
open http://localhost:8000/sound-test
```

## 🎪 The Magic
This isn't just a sound system - it's a **vibe system**. Every click, hover, and transition should feel intentional, delightful, and part of a cohesive experience. We're not just playing sounds, we're creating **micro-moments of joy**.

Remember: **Simplicity with legs** - easy to use, hard to outgrow.

---
*Last updated: [Current Date]*
*Branch: sounds*
*Pablo's vision: "Make it feel like magic but work like clockwork"*