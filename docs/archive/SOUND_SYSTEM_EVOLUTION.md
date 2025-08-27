# 🎵 Sound System Evolution Plan

> ButtonStudio → Universal SoftStack Sound System

## 🚨 CURRENT STATUS - READY FOR NEXT CLAUDE!

**Branch**: `sounds` - Major architecture complete, ready for integration
**Pablo's Vision**: Gradient sounds that match visual gradients (IMPLEMENTED!
🔥)

## 🎯 Mission

Transform ButtonStudio's sound system into a **portable, modular, extensible**
audio framework that can power any SoftStack app (and beyond). Think:
**"Tailwind for Sound"** - utility-first, composable, theme-able.

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

### Phase 1: Foundation ✅ COMPLETE!

- [x] Create sounds branch
- [x] Build AudioProcessor.ts with Web Audio API pitch shifting
- [x] Create SoundPack.ts modular system with manifest support
- [x] Design GradientSoundMapper for visual→audio mapping
- [x] Build convert-sounds.sh with ffmpeg pipeline
- [x] Create GradientSoundDemo.tsx interactive showcase

### Phase 2: Integration ✅ IN PROGRESS!

- [x] Run `./scripts/convert-sounds.sh` to process Kenney sounds
- [x] Create route `/sound-demo` for GradientSoundDemo
- [x] Create manifest.json with proper ButtonStudio mappings
- [x] Fix import syntax for Deno compatibility (assert → with)
- [x] Test demo at http://localhost:8001/sound-demo
- [ ] Update ButtonStudio components to use SoundPack system
- [ ] Replace current soundService calls with new system
- [ ] Add pack switcher UI in CustomizationPanel

### Phase 3: Export & Package

- [ ] Extract sound system to `/packages/sounds/`
- [ ] Create npm/deno package structure
- [ ] Build standalone demo page
- [ ] Write API documentation

### Phase 4: Polish & Extend

- [ ] Add more sound packs (retro synth, organic)
- [ ] Integrate with existing SoundDesigner
- [ ] Add real-time mixing/layering
- [ ] Performance optimizations

## 🎨 API Design

### Basic Usage

```typescript
import { SoundSystem } from "@softstack/sounds";

// Initialize with pack
const sounds = new SoundSystem("kenney");

// Simple playback
sounds.play("click"); // Auto-maps to click.primary
sounds.play("hover.gentle"); // Specific variant
sounds.play("success", { volume: 0.5 });

// Category volume control
sounds.setCategoryVolume("navigation", 0.7);

// Global controls
sounds.mute();
sounds.unmute();
sounds.setMasterVolume(0.8);
```

### React/Preact Hook

```typescript
import { useSound } from "@softstack/sounds/react";

function MyButton() {
  const { play, isPlaying } = useSound();

  return (
    <button
      onClick={() => play("click")}
      onMouseEnter={() => play("hover", { volume: 0.3 })}
    >
      Click Me
    </button>
  );
}
```

### Advanced Features

```typescript
// Pack switching
await sounds.loadPack("retro");
sounds.switchPack("retro", { fadeTime: 500 });

// Mixing packs
sounds.useMixed({
  click: "kenney",
  hover: "retro",
  feedback: "organic",
});

// Queue & priority
sounds.queue("success", { delay: 100, priority: "high" });

// Events
sounds.on("play", (sound) => console.log(`Playing: ${sound}`));
sounds.on("packLoaded", (packName) => console.log(`Loaded: ${packName}`));
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

## 💭 Future Claude Notes - START HERE!

Hey future Claude! You're picking up the **sounds branch** with Phase 2
partially complete:

### 🎯 Current Status (Dec 27, 2024)

**What's Working:**

- ✅ Sound pack system fully functional
- ✅ 100 Kenney sounds converted and organized
- ✅ Demo page at http://localhost:8001/sound-demo showing the modular system
- ✅ Manifest properly maps sounds to ButtonStudio UI categories

**What's NOT Done:**

- ❌ ButtonStudio still uses old soundService (not SoundPack)
- ❌ No UI for switching between sound packs
- ❌ Export system doesn't include new sound packs

### 🎯 Main Goal: Modular Sound Pack System

**Primary Mission**: Create a portable sound system that can be dropped into ANY
webapp (especially Deno/Fresh projects). Think "npm install @softstack/sounds"
simplicity.

### ✅ What Previous Claude Built:

1. **SoundPack.ts** - CORE: Modular pack system with manifest-based loading
2. **AudioProcessor.ts** - Processing engine (format conversion, pitch shifting,
   effects)
3. **convert-sounds.sh** - FFmpeg pipeline for batch processing sounds
4. **Manifest structure** - JSON-based pack configuration
5. **Pitch variations** - Bonus feature for UI gradients (not the main focus)

### 🚀 Your IMMEDIATE Next Steps:

1. **Create SoundService adapter**: Bridge between old API and new SoundPack
   system
   - Keep existing `playSound` calls working
   - Load Kenney pack on app init
   - Gradually migrate components

2. **Add to ButtonStudio main app**:
   - Initialize SoundPackManager in ButtonStudio.tsx
   - Keep old system as fallback during transition

3. **Simple pack switcher UI**:
   - Add dropdown in CustomizationPanel
   - Just "Classic" vs "Kenney" to start
   - Store preference in localStorage

4. **Test thoroughly**:
   - Ensure all UI interactions have sounds
   - Check performance with pack switching
   - Verify export still works

### 🔧 Key Files to Know:

```
utils/audio/
├── AudioProcessor.ts    # Core pitch/effects engine (NEW)
├── SoundPack.ts        # Pack loader & manager (NEW)
├── soundService.ts     # Current system (needs updating)
├── soundConfig.ts      # Current mappings (migrate to packs)
└── soundMapping.ts     # Dynamic mapping (keep parts)

islands/
└── GradientSoundDemo.tsx  # Working demo to test (NEW)

scripts/
└── convert-sounds.sh      # Run this first! (NEW)
```

### 💡 Core Architecture:

- **Manifest-based packs** - Easy theme switching via JSON config
- **Format auto-detection** - mp3/ogg/wav based on browser support
- **Simple API** - `sounds.play('click')` with optional variants
- **Portable** - Works with Deno, Node, vanilla JS
- **Bonus features** - Pitch shifting, effects (nice to have, not core)

### 🎯 Remember the Focus:

This is about creating a **reusable sound system** for ALL SoftStack apps:

- Drop-in replacement for any webapp's sound needs
- Pack-based for easy customization
- Simple enough for `sounds.play('click')`
- Powerful enough for complex apps
- **Not** just about gradients (that's just one cool feature)

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

This isn't just a sound system - it's a **vibe system**. Every click, hover, and
transition should feel intentional, delightful, and part of a cohesive
experience. We're not just playing sounds, we're creating **micro-moments of
joy**.

Remember: **Simplicity with legs** - easy to use, hard to outgrow.

---

_Last updated: [Current Date]_ _Branch: sounds_ _Pablo's vision: "Make it feel
like magic but work like clockwork"_
