import { signal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import {
  SOUND_PRESETS,
  type SynthConfig,
  synthEngine,
} from "../utils/audio/synthEngine.ts";
import { playSound, setSoundEnabled } from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";

// Sound designer state
const selectedPreset = signal<string>("bloop");
const isPlaying = signal<boolean>(false);
const customConfig = signal<SynthConfig>(SOUND_PRESETS.bloop);
const soundEnabled = signal<boolean>(true);

export default function SoundDesigner() {
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate fake waveform visualization for each preset
  const generateWaveform = (preset: string) => {
    const patterns = {
      bloop: [0.3, 0.7, 0.9, 0.6, 0.4, 0.2, 0.1, 0.05],
      chime: [0.1, 0.3, 0.8, 1.0, 0.7, 0.4, 0.2, 0.1, 0.05],
      pop: [0.9, 0.3, 0.1, 0.05],
      ding: [0.2, 0.6, 0.95, 0.8, 0.5, 0.3, 0.15, 0.08, 0.03],
      candy: [0.4, 0.8, 0.6, 0.9, 0.7, 0.5, 0.3, 0.2, 0.1, 0.05],
    };
    return patterns[preset as keyof typeof patterns] || patterns.bloop;
  };

  useEffect(() => {
    setWaveformData(generateWaveform(selectedPreset.value));
  }, [selectedPreset.value]);

  const playPreset = async (presetName: string) => {
    if (isPlaying.value) return;

    try {
      isPlaying.value = true;
      selectedPreset.value = presetName;

      // Play haptic feedback
      hapticService.buttonPress();

      // Play the synthesized sound
      await synthEngine.playSound(SOUND_PRESETS[presetName]);

      // UI feedback sound
      playSound.primaryClick();

      setTimeout(() => {
        isPlaying.value = false;
      }, 800);
    } catch (error) {
      console.error("Error playing sound:", error);
      isPlaying.value = false;
    }
  };

  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value;
    setSoundEnabled(soundEnabled.value);

    if (soundEnabled.value) {
      hapticService.toggleOn();
    } else {
      hapticService.toggleOff();
    }
  };

  // Preset button component
  const PresetButton = (
    { preset, emoji, name }: { preset: string; emoji: string; name: string },
  ) => {
    const isSelected = selectedPreset.value === preset;
    const isCurrentlyPlaying = isPlaying.value && isSelected;

    return (
      <button
        onClick={() => playPreset(preset)}
        disabled={isPlaying.value}
        class={`relative group p-4 rounded-2xl border-3 border-black transition-all duration-200 ${
          isSelected
            ? "bg-pink-200 hover:bg-pink-300 scale-105 shadow-lg"
            : "bg-white hover:bg-pink-50 hover:scale-102"
        } ${isCurrentlyPlaying ? "animate-pulse" : ""}`}
        style={{
          boxShadow: isSelected ? "4px 4px 0px #000000" : "2px 2px 0px #000000",
        }}
      >
        <div class="flex flex-col items-center gap-2">
          <span
            class={`text-2xl transition-transform duration-200 ${
              isCurrentlyPlaying ? "animate-bounce" : "group-hover:scale-110"
            }`}
          >
            {emoji}
          </span>
          <span class="text-sm font-bold text-black">{name}</span>
        </div>

        {/* Cute playing indicator */}
        {isCurrentlyPlaying && (
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-400 border-2 border-black rounded-full flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        )}
      </button>
    );
  };

  // Waveform visualization component
  const WaveformDisplay = () => (
    <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-3 border-black shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-black text-gray-900">🌊 Sound Wave</h3>
        <div
          class={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black ${
            selectedPreset.value === "bloop"
              ? "bg-blue-200"
              : selectedPreset.value === "chime"
              ? "bg-yellow-200"
              : selectedPreset.value === "pop"
              ? "bg-red-200"
              : selectedPreset.value === "ding"
              ? "bg-green-200"
              : "bg-purple-200"
          }`}
        >
          {selectedPreset.value.toUpperCase()}
        </div>
      </div>

      <div class="flex items-end justify-center gap-1 h-16">
        {waveformData.map((amplitude, index) => (
          <div
            key={index}
            class={`bg-gradient-to-t from-pink-500 to-purple-500 rounded-full transition-all duration-300 ${
              isPlaying.value ? "animate-pulse" : ""
            }`}
            style={{
              height: `${amplitude * 100}%`,
              width: "8px",
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div class="mt-4 text-center text-xs text-gray-600 font-medium">
        {isPlaying.value ? "🎵 Playing..." : "▶️ Click a preset to hear it!"}
      </div>
    </div>
  );

  return (
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-black space-y-6">
      {/* Header with sound toggle */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-gray-900">🎵 Button Sounds</h2>
          <p class="text-sm text-gray-600 font-medium">
            Choose your button's perfect sound
          </p>
        </div>

        <button
          onClick={toggleSound}
          title={soundEnabled.value ? "Disable sounds" : "Enable sounds"}
          class={`w-14 h-8 rounded-full border-3 border-black transition-all duration-300 flex items-center shadow-md hover:shadow-lg ${
            soundEnabled.value
              ? "bg-green-300 hover:bg-green-400"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <div
            class={`w-6 h-6 bg-white rounded-full border-2 border-black transition-all duration-300 shadow-sm ${
              soundEnabled.value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Waveform display */}
      <WaveformDisplay />

      {/* Sound presets */}
      <div>
        <h3 class="text-lg font-black text-gray-900 mb-4">🎨 Sound Presets</h3>
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <PresetButton preset="bloop" emoji="💧" name="Bloop" />
          <PresetButton preset="chime" emoji="🔔" name="Chime" />
          <PresetButton preset="pop" emoji="🎈" name="Pop" />
          <PresetButton preset="ding" emoji="✨" name="Ding" />
          <PresetButton preset="candy" emoji="🍭" name="Candy" />
        </div>
      </div>

      {/* Sound parameters (simplified for now) */}
      <div class="space-y-4">
        <h3 class="text-lg font-black text-gray-900">🎛️ Sound Settings</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pitch slider */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-800">🎼 Pitch</label>
              <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300">
                {Math.round(customConfig.value.frequency)}Hz
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="1200"
              step="50"
              value={customConfig.value.frequency}
              onInput={(e) => {
                const newConfig = { ...customConfig.value };
                newConfig.frequency = parseInt(
                  (e.target as HTMLInputElement).value,
                );
                customConfig.value = newConfig;

                // Play haptic feedback
                hapticService.sliderStep();
                playSound.sliderStep();
              }}
              class="w-full h-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full appearance-none cursor-pointer border-2 border-black"
            />
          </div>

          {/* Volume slider (visual only for now) */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-800">🔊 Volume</label>
              <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300">
                75%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value="75"
              class="w-full h-6 bg-gradient-to-r from-green-200 to-blue-200 rounded-full appearance-none cursor-pointer border-2 border-black"
            />
          </div>
        </div>
      </div>

      {/* Test button */}
      <div class="flex justify-center">
        <button
          onClick={() => playPreset(selectedPreset.value)}
          disabled={isPlaying.value}
          class={`px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-black text-lg rounded-2xl border-3 border-black shadow-lg transition-all duration-200 ${
            isPlaying.value
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 hover:shadow-xl active:scale-95"
          }`}
          style={{ boxShadow: "4px 4px 0px #000000" }}
        >
          {isPlaying.value ? "🎵 Playing..." : "🎮 Test Sound"}
        </button>
      </div>
    </div>
  );
}
