import { signal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { playSound } from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
}

const isOpen = signal<boolean>(false);

// Common emojis organized by category
const emojiCategories = {
  "Voice & Sound": ["🎤", "🎧", "🔊", "📢", "📣", "🎵", "🎶", "🔉", "🔔", "📯"],
  "Smileys": ["😊", "😂", "🥰", "😎", "🤔", "😍", "🙂", "😃", "😄", "😆"],
  "Hands": ["👋", "✋", "🤚", "🖐️", "✌️", "🤞", "🤟", "🤘", "👌", "🤏"],
  "Objects": ["💎", "⭐", "✨", "🔥", "💡", "🎯", "🚀", "💫", "⚡", "🌟"],
  "Hearts": ["❤️", "💖", "💕", "💓", "💗", "💘", "💝", "💟", "❣️", "💔"],
  "Arrows": ["➡️", "⬅️", "⬆️", "⬇️", "↗️", "↖️", "↙️", "↘️", "🔄", "🔃"],
};

export default function EmojiPicker(
  { value, onChange, placeholder = "🎤" }: EmojiPickerProps,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        isOpen.value = false;
      }
    }

    if (isOpen.value) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen.value]);

  function selectEmoji(emoji: string) {
    onChange(emoji);
    isOpen.value = false;
    playSound.selectionSelect();
    hapticService.buttonPress();
  }

  return (
    <div class="relative" ref={containerRef}>
      {/* Current Value Button */}
      <button
        type="button"
        onClick={() => {
          isOpen.value = !isOpen.value;
          playSound.panelOpen();
          hapticService.buttonPress();
        }}
        onMouseEnter={() => playSound.hover()}
        class="w-full p-3 border-3 border-flamingo-primary rounded-chunky font-chunky text-center text-lg focus:outline-none focus:border-flamingo-purple hover:border-flamingo-purple transition-colors flex items-center justify-between"
      >
        <span class="text-2xl">{value || placeholder}</span>
        <span class="text-flamingo-purple text-sm">
          {isOpen.value ? "▲" : "▼"}
        </span>
      </button>

      {/* Emoji Picker Dropdown */}
      {isOpen.value && (
        <div class="absolute top-full left-0 right-0 mt-2 bg-white border-3 border-flamingo-primary rounded-chunky shadow-lg z-50 max-h-80 overflow-y-auto">
          <div class="p-4 space-y-4">
            {Object.entries(emojiCategories).map(([categoryName, emojis]) => (
              <div key={categoryName}>
                <h4 class="text-xs font-chunky text-flamingo-charcoal mb-2 uppercase tracking-wide">
                  {categoryName}
                </h4>
                <div class="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => selectEmoji(emoji)}
                      onMouseEnter={() => playSound.hover()}
                      class="w-8 h-8 flex items-center justify-center text-lg hover:bg-flamingo-cream rounded-md transition-colors"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Text Input for Custom */}
            <div class="border-t-2 border-flamingo-cream pt-4">
              <h4 class="text-xs font-chunky text-flamingo-charcoal mb-2 uppercase tracking-wide">
                Custom Text
              </h4>
              <input
                type="text"
                placeholder="Type any text..."
                class="w-full p-2 border-2 border-flamingo-concrete rounded-md text-sm focus:outline-none focus:border-flamingo-purple"
                onFocus={() => {
                  playSound.primaryClick();
                  hapticService.buttonPress();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      selectEmoji(target.value.trim());
                      target.value = "";
                    }
                  }
                }}
              />
              <p class="text-xs text-flamingo-purple mt-1">
                Press Enter to use
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
