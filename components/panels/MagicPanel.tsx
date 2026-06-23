import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface MagicPanelProps {
  hasPaid?: boolean;
  onUnlockPremium?: () => void;
  customPromptValue?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

const outputPresets = [
  {
    label: "Diary",
    prompt:
      "Turn this recording into a warm diary entry with a short title, a reflective tone, and one small takeaway at the end.",
  },
  {
    label: "Recipe",
    prompt:
      "Turn this recording into a recipe with a title, ingredients, steps, and any timing or serving notes that were mentioned.",
  },
  {
    label: "Reflection",
    prompt:
      "Turn this recording into a clear reflection with the main idea, what it might mean, and one next step.",
  },
  {
    label: "Meeting notes",
    prompt:
      "Turn this recording into meeting notes with decisions, action items, owners, and open questions.",
  },
  {
    label: "To-do list",
    prompt:
      "Turn this recording into a tidy to-do list. Group related tasks and make each item start with an action verb.",
  },
  {
    label: "Clean text",
    prompt:
      "Transcribe this audio clearly, remove filler words, fix obvious punctuation, and return only the cleaned-up text.",
  },
];

const outputPlaceholder = [
  "Diary entry with a warm title",
  "Recipe with ingredients and steps",
  "Short reflection with one takeaway",
].join("\n");

export default function MagicPanel({
  hasPaid = false,
  onUnlockPremium,
  customPromptValue = "",
  onCustomPromptChange,
}: MagicPanelProps) {
  return (
    <div class="space-y-4">
      {/* Tier Badge */}
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-2">
          Voice AI
        </h4>
        <div class="flex items-center gap-3 mb-3">
          <span
            class={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border-2 ${
              hasPaid
                ? "bg-purple-200 border-purple-500 text-purple-800"
                : "bg-amber-100 border-amber-500 text-amber-800"
            }`}
          >
            {hasPaid ? "✨ Premium" : "🆓 Free"}
          </span>
          <span class="text-sm text-gray-600 font-medium">
            {hasPaid
              ? "All models · Unlimited transcriptions"
              : "20/day · Fast models"}
          </span>
        </div>
        {!hasPaid && (
          <div class="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 mb-3">
            <p class="text-sm font-bold text-purple-900 mb-2">
              Unlock premium AI models, unlimited use, and custom prompts.
            </p>
            <button
              type="button"
              onClick={() => {
                onUnlockPremium?.();
                playSound.celebration();
                hapticService.celebration();
              }}
              onMouseEnter={() => playSound.hover()}
              class="w-full px-4 py-2 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700 active:scale-95 transition-all"
              style={{ boxShadow: "3px 3px 0px #4C1D95" }}
            >
              Unlock Premium · $9/year
            </button>
          </div>
        )}
      </div>

      {/* Custom Prompt */}
      {onCustomPromptChange && (
        <div>
          <h4 class="text-lg font-black text-gray-900 mb-2">
            Output Style
          </h4>
          <p class="text-sm text-gray-600 mb-3">
            Tell ButtonSpa what the button should turn your input into.
          </p>
          <div class="grid grid-cols-2 gap-2 mb-3">
            {outputPresets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => {
                  onCustomPromptChange(preset.prompt);
                  playSound.primaryClick();
                  hapticService.buttonPress();
                }}
                onMouseEnter={() => playSound.hover()}
                class="min-h-[44px] rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-black text-left hover:bg-purple-50 active:scale-95 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <textarea
            value={customPromptValue}
            onChange={(e) =>
              onCustomPromptChange((e.target as HTMLTextAreaElement).value)}
            onFocus={() => {
              playSound.primaryClick();
              hapticService.buttonPress();
            }}
            placeholder={outputPlaceholder}
            rows={5}
            class="w-full px-4 py-3 rounded-xl border-3 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white resize-none"
          />
        </div>
      )}
    </div>
  );
}
