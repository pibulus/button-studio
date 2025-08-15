# Button Studio + Browser Whisper Implementation Guide

## Context Discovery Complete ✅

**Reference Implementation**: `/Users/pabloalvarado/ziplist` - Dennis's production-ready browser Whisper system
- Branch: `offline-transcription-with-whisper` 
- Key files: `src/lib/services/transcription/whisper/whisperService.js`
- UI components: `ModelDownloadIndicator.svelte`, `ModelSelector.svelte`

## Core Architecture

### Dependencies
```json
{
  "@xenova/transformers": "^2.17.2"
}
```

### Essential Implementation (20 lines)
```javascript
import { pipeline } from "@xenova/transformers";

// Load model (happens once, cached forever)
const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");

// Transcribe audio blob from button recording
const result = await transcriber(audioFloat32Array, { task: "transcribe" });
const text = result.text; // "user spoke this text"
```

### Critical Configuration
- ✅ **English models**: Use `{ task: "transcribe" }` ONLY
- ❌ **DO NOT USE**: `{ language: "en", task: "transcribe" }` with `.en` models (silent failure)
- ✅ **Audio format**: 16kHz mono Float32Array
- ✅ **Model sizes**: tiny (39MB), base (74MB), small (244MB)

## Integration with Button Studio

### Audio Pipeline
1. **Button records voice** → WebM/Opus blob
2. **Audio conversion** → 16kHz mono Float32Array (use Dennis's `audioConverter.js`)
3. **Local transcription** → Text result in ~2 seconds
4. **Button action execution** → Use transcribed text

### File Structure
```
src/lib/
├── services/
│   └── transcription/
│       ├── whisperService.js      # Core service (copy from Dennis)
│       ├── audioConverter.js      # WebM→WAV conversion
│       └── modelRegistry.js       # Model definitions
├── components/
│   └── voice/
│       ├── ModelDownloader.svelte # Lush loading UI
│       └── VoiceButton.svelte     # Button + transcription
```

### Key Services to Copy from Dennis
- **whisperService.js**: Complete service class with progress tracking
- **audioConverter.js**: WebM/Opus to 16kHz Float32Array conversion
- **modelRegistry.js**: Model definitions (tiny/base/small)

## User Experience Flow

### First-Time Setup (Magical Loading)
1. User clicks voice button first time
2. "Download 39MB for offline voice transcription?" 
3. **Gorgeous progress bar** with speed estimates
4. "This happens once - enables magical offline voice buttons forever"
5. Model cached in IndexedDB, never downloads again

### Runtime Flow  
1. User holds button → Records audio
2. Release → Convert to Float32Array (33ms)  
3. Transcribe locally (~2 seconds for 4-second audio)
4. Execute button action with transcribed text

## PWA Integration

### Storage
- Models cached in **IndexedDB** (persistent across updates)
- **Unlimited storage** with user permission
- Survives browser restarts, PWA updates

### Offline-First
- Zero network requests after model download
- Perfect privacy (nothing leaves device)
- Works on planes, in tunnels, anywhere

## Performance Characteristics

### Timing (Production Data)
- **Model loading**: 1-3 seconds (first time only)
- **Audio conversion**: ~33ms  
- **Transcription speed**: 2x real-time (2s audio → 1s processing)
- **Memory usage**: ~60-80MB for tiny model

### Model Selection Strategy
- **Default**: `whisper-tiny.en` (39MB, 2x real-time, good quality)
- **Quality mode**: `whisper-base.en` (74MB, better accuracy) 
- **Desktop mode**: `whisper-small.en` (244MB, best quality)

## Deployment (Fly.io Perfect)

### Why Fly.io Wins
- **Client-side ML** = just static JS files
- **Edge CDN** = fast transformers.js delivery worldwide
- **Zero backend costs** = models download from HuggingFace directly
- **PWA optimized** = perfect service worker caching

### Build Process
```bash
# Deno/Fresh - native ES modules (cleaner than Node)
deno task build
fly deploy
```

## Implementation Steps

1. **Copy Dennis's whisper services** to Button Studio
2. **Add model selector UI** with lush progress bars  
3. **Integrate with voice button** recording flow
4. **Test audio pipeline** (WebM → Float32Array → text)
5. **Add PWA manifest** settings for unlimited storage
6. **Deploy to fly.io** as static assets

## Critical Success Factors

- **User sees value exchange**: "39MB download = magical offline voice forever"
- **Beautiful loading UI**: Real progress, not fake spinners
- **Zero API costs**: Complete privacy, infinite usage
- **PWA superpowers**: Works offline, survives updates

This gives Button Studio **next-level UX** that big companies can't match (they're locked into cloud APIs).

---

**Reference ziplist directory**: `/Users/pabloalvarado/ziplist`  
**Start with**: Copy `whisperService.js` and understand the model loading flow  
**Remember**: English-only models break with `language` parameter!