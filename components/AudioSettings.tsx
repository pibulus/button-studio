import { signal } from "@preact/signals";
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";

// Simple state for audio settings
const showSettings = signal<boolean>(false);
const soundEnabled = signal<boolean>(isSoundEnabled());

export default function AudioSettings() {
  const toggleSound = () => {
    const newState = !soundEnabled.value;
    soundEnabled.value = newState;
    setSoundEnabled(newState);

    // Don't play sound if we're turning it off
    if (newState) {
      hapticService.toggleOn();
    } else {
      hapticService.toggleOff();
    }
  };

  const toggleHaptics = () => {
    if (hapticService.isEnabled()) {
      hapticService.disable();
      playSound.toggleOff();
    } else {
      hapticService.enable();
      playSound.toggleOn();
    }
  };

  return (
    <div class="relative">
      {/* Settings button */}
      <button
        onClick={() => {
          showSettings.value = !showSettings.value;
          playSound.primaryClick();
          hapticService.buttonPress();
        }}
        onMouseEnter={() => playSound.hover()}
        title="Audio & Haptic Settings"
        class="w-12 h-12 bg-white border-3 border-black rounded-xl flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        style={{ boxShadow: "3px 3px 0px #000000" }}
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </button>

      {/* Settings dropdown */}
      {showSettings.value && (
        <div
          class="absolute top-14 right-0 bg-white border-3 border-black rounded-2xl shadow-lg p-4 z-50 min-w-[200px]"
          style={{ boxShadow: "4px 4px 0px #000000" }}
        >
          <h3 class="text-lg font-black text-gray-900 mb-4">
            🎵 Audio Settings
          </h3>

          {/* Sound toggle */}
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-sm font-bold text-gray-800">🔊 UI Sounds</span>
              <p class="text-xs text-gray-600">Interface feedback sounds</p>
            </div>
            <button
              onClick={toggleSound}
              onMouseEnter={() => playSound.hover()}
              class={`w-12 h-6 rounded-full border-2 border-black transition-all duration-300 flex items-center ${
                soundEnabled.value ? "bg-green-300" : "bg-gray-200"
              }`}
            >
              <div
                class={`w-4 h-4 bg-white rounded-full border border-black transition-all duration-300 ${
                  soundEnabled.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Haptic toggle */}
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-sm font-bold text-gray-800">📳 Haptics</span>
              <p class="text-xs text-gray-600">Vibration feedback</p>
            </div>
            <button
              onClick={toggleHaptics}
              onMouseEnter={() => playSound.hover()}
              class={`w-12 h-6 rounded-full border-2 border-black transition-all duration-300 flex items-center ${
                hapticService.isEnabled() ? "bg-green-300" : "bg-gray-200"
              }`}
            >
              <div
                class={`w-4 h-4 bg-white rounded-full border border-black transition-all duration-300 ${
                  hapticService.isEnabled() ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Sound test button */}
          <button
            onClick={() => {
              playSound.celebration();
              hapticService.celebration();
            }}
            onMouseEnter={() => playSound.hover()}
            class="w-full px-4 py-2 bg-gradient-to-r from-pink-200 to-purple-200 border-2 border-black rounded-xl font-bold text-sm hover:scale-105 transition-all duration-200"
            style={{ boxShadow: "2px 2px 0px #000000" }}
          >
            🎉 Test Audio
          </button>
        </div>
      )}
    </div>
  );
}
