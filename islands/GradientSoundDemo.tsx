/**
 * Gradient Sound Demo
 * 
 * Interactive demo showing how sounds can match visual gradients.
 * Each button in a gradient plays the same sound at different pitches.
 */

import { signal } from "@preact/signals";
import { WebAudioProcessor, GradientSoundMapper } from "../utils/audio/AudioProcessor.ts";

const processor = new WebAudioProcessor();
const mapper = new GradientSoundMapper(processor);

// Demo gradients with different color schemes
const gradients = {
  purple: {
    name: "Purple Dream",
    colors: ["#faf5ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea"],
    sound: "/sounds/kenney/original/click_001.mp3",
  },
  sunset: {
    name: "Sunset Vibes", 
    colors: ["#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#ea580c"],
    sound: "/sounds/kenney/original/glass_001.mp3",
  },
  ocean: {
    name: "Ocean Wave",
    colors: ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"],
    sound: "/sounds/kenney/original/drop_001.mp3",
  },
  forest: {
    name: "Forest Moss",
    colors: ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a"],
    sound: "/sounds/kenney/original/pluck_001.mp3",
  },
};

const selectedGradient = signal("purple");
const pitchRange = signal(8);
const reverseDirection = signal(false);
const harmonicMode = signal(false);

export default function GradientSoundDemo() {
  const gradient = gradients[selectedGradient.value];
  
  // Create pitched sounds for each button
  const sounds = harmonicMode.value
    ? mapper.createHarmonicSet(gradient.sound, gradient.colors.length, 'pentatonic')
    : mapper.mapColorGradient(
        gradient.sound,
        gradient.colors,
        {
          rangeInSemitones: pitchRange.value,
          reverse: reverseDirection.value,
        }
      );

  return (
    <div class="p-6 bg-gray-900 rounded-lg">
      <h2 class="text-2xl font-bold text-white mb-6">
        🎵 Gradient Sound System Demo
      </h2>
      
      {/* Controls */}
      <div class="mb-8 space-y-4">
        <div class="flex gap-4 flex-wrap">
          {Object.entries(gradients).map(([key, g]) => (
            <button
              key={key}
              onClick={() => selectedGradient.value = key}
              class={`px-4 py-2 rounded-lg transition-all ${
                selectedGradient.value === key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div class="flex gap-6 items-center">
          <label class="text-white flex items-center gap-2">
            Pitch Range:
            <input
              type="range"
              min="2"
              max="24"
              value={pitchRange.value}
              onInput={(e) => pitchRange.value = Number(e.currentTarget.value)}
              class="w-32"
            />
            <span class="text-purple-400 w-12">{pitchRange.value}</span>
          </label>

          <label class="text-white flex items-center gap-2">
            <input
              type="checkbox"
              checked={reverseDirection.value}
              onChange={(e) => reverseDirection.value = e.currentTarget.checked}
            />
            Reverse
          </label>

          <label class="text-white flex items-center gap-2">
            <input
              type="checkbox"
              checked={harmonicMode.value}
              onChange={(e) => harmonicMode.value = e.currentTarget.checked}
            />
            Harmonic Mode
          </label>
        </div>
      </div>

      {/* Gradient Buttons */}
      <div class="space-y-6">
        <h3 class="text-lg text-gray-400">
          Click buttons to hear pitch gradients:
        </h3>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {gradient.colors.map((color, index) => (
            <button
              key={index}
              onClick={() => sounds[index].play()}
              style={{ backgroundColor: color }}
              class="h-24 rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 border-2 border-white/20 relative group"
            >
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-white/80 font-bold text-lg bg-black/30 px-2 py-1 rounded">
                  {harmonicMode.value 
                    ? ['C', 'D', 'E', 'G', 'A', 'C'][index] || '♪'
                    : `${sounds[index].pitch > 0 ? '+' : ''}${sounds[index].pitch.toFixed(1)}`
                  }
                </span>
              </div>
              <div class="absolute bottom-2 left-0 right-0 text-center">
                <span class="text-xs text-white/60 bg-black/40 px-2 rounded">
                  {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Visual Waveform */}
        <div class="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 class="text-sm text-gray-400 mb-2">Pitch Visualization:</h4>
          <div class="flex items-end gap-1 h-20">
            {gradient.colors.map((color, index) => {
              const height = harmonicMode.value
                ? 50 + (index * 10)
                : 50 + (sounds[index].pitch * 2);
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: color,
                    height: `${Math.max(10, Math.min(100, height))}%`,
                  }}
                  class="flex-1 rounded-t transition-all duration-300"
                />
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div class="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 class="text-blue-400 font-bold mb-2">💡 How it works:</h4>
          <p class="text-gray-300 text-sm">
            {harmonicMode.value
              ? "Harmonic Mode: Buttons play notes from a pentatonic scale, creating musical intervals that always sound good together."
              : "Pitch Gradient: Each button plays the same sound file, but pitch-shifted to match the visual gradient. Lighter colors = higher pitch, darker = lower pitch."
            }
          </p>
          <p class="text-gray-400 text-xs mt-2">
            Using Web Audio API for real-time pitch shifting without changing playback speed.
          </p>
        </div>
      </div>
    </div>
  );
}