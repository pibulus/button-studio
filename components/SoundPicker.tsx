import { signal } from "@preact/signals";
import { hapticService } from "../utils/audio/hapticService.ts";
import { playSound } from "../utils/audio/soundMapping.ts";
import { ButtonCustomization } from "../types/customization.ts";

// Simple state for playing indicator
const isPlaying = signal<boolean>(false);

interface SoundPickerProps {
  customization: ButtonCustomization;
  onChange: (customization: ButtonCustomization) => void;
}

export default function SoundPicker(
  { customization, onChange }: SoundPickerProps,
) {
  const playSoundPreview = (soundName: string) => {
    if (isPlaying.value) return;

    try {
      isPlaying.value = true;

      // Update customization state
      onChange({
        ...customization,
        sound: {
          ...customization.sound,
          type: soundName as "slate" | "amber" | "coral" | "sage" | "pearl",
        },
      });

      // Haptic feedback
      hapticService.buttonPress();

      // Play the synthesized sound preview
      playSound.soundPreview(soundName);

      setTimeout(() => {
        isPlaying.value = false;
      }, 600);
    } catch (error) {
      console.error("Error playing sound:", error);
      isPlaying.value = false;
    }
  };

  // Abstract sound presets - like color swatches
  const soundPresets = [
    { id: "slate", emoji: "⚫", name: "Slate", description: "Deep & muted" },
    { id: "amber", emoji: "🟠", name: "Amber", description: "Warm & gentle" },
    { id: "coral", emoji: "🔴", name: "Coral", description: "Bright & crisp" },
    {
      id: "sage",
      emoji: "🟢",
      name: "Sage",
      description: "Natural & balanced",
    },
    {
      id: "pearl",
      emoji: "⚪",
      name: "Pearl",
      description: "Smooth & refined",
    },
  ];

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-black text-gray-900">🎵 Button Sound</h3>
        <div class="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-300">
          {customization.sound.type.toUpperCase()}
        </div>
      </div>

      {/* Simple preset buttons */}
      <div class="grid grid-cols-5 gap-2">
        {soundPresets.map((preset) => {
          const isSelected = customization.sound.type === preset.id;
          const isCurrentlyPlaying = isPlaying.value && isSelected;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => playSoundPreview(preset.id)}
              onMouseEnter={() => {
                if (!isPlaying.value) {
                  playSound.hover();
                }
              }}
              disabled={isPlaying.value}
              title={`${preset.name} - ${preset.description}`}
              class={`p-3 rounded-xl border-3 border-black transition-all duration-200 ${
                isSelected
                  ? "bg-pink-200 hover:bg-pink-300 scale-105"
                  : "bg-white hover:bg-pink-50 hover:scale-102"
              } ${isCurrentlyPlaying ? "animate-pulse" : ""}`}
              style={{
                boxShadow: isSelected
                  ? "3px 3px 0px #000000"
                  : "2px 2px 0px #000000",
              }}
            >
              <div class="flex flex-col items-center gap-1">
                <span
                  class={`text-lg transition-transform duration-200 ${
                    isCurrentlyPlaying ? "animate-bounce" : "hover:scale-110"
                  }`}
                >
                  {preset.emoji}
                </span>
                <span class="text-xs font-bold text-black leading-none">
                  {preset.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simple description */}
      <div class="text-center text-sm text-gray-600 font-medium">
        {isPlaying.value ? "🎵 Playing..." : "Click to preview button sounds"}
      </div>
    </div>
  );
}
