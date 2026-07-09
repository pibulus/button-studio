import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

// Mirrors the `format` union accepted by POST /api/transcribe
// (routes/api/transcribe.ts). Presets below tag which shape their prompt
// expects back so a structured renderer (checklist / sections) can be
// used instead of a flat textarea — see the handoff note above
// outputPresets for how this still needs to reach the export step.
type OutputFormat = "text" | "list" | "sections";

interface MagicPanelProps {
  hasPaid?: boolean;
  onUnlockPremium?: () => void;
  customPromptValue?: string;
  onCustomPromptChange?: (prompt: string, format?: OutputFormat) => void;
}

// Each preset carries the output `format` its prompt expects back. It flows:
// onCustomPromptChange(prompt, format) -> ButtonStudio customFormat signal
// -> ShipPanel customFormatValue -> exportCustomization.api.format
// -> ButtonExporter -> html-standalone POST body -> structured renderer.
const outputPresets: {
  label: string;
  prompt: string;
  format: OutputFormat;
}[] = [
  {
    label: "Diary",
    prompt:
      "Turn this recording into a warm diary entry with a short title, a reflective tone, and one small takeaway at the end.",
    format: "text",
  },
  {
    label: "Recipe",
    prompt:
      "Turn this recording into a recipe with a title, ingredients, steps, and any timing or serving notes that were mentioned.",
    format: "sections",
  },
  {
    label: "Reflection",
    prompt:
      "Turn this recording into a clear reflection with the main idea, what it might mean, and one next step.",
    format: "text",
  },
  {
    label: "Meeting notes",
    prompt:
      "Turn this recording into meeting notes with decisions, action items, owners, and open questions.",
    format: "sections",
  },
  {
    label: "To-do list",
    prompt:
      "Turn this recording into a tidy to-do list. Group related tasks and make each item start with an action verb.",
    format: "list",
  },
  {
    label: "Clean text",
    prompt:
      "Transcribe this audio clearly, remove filler words, fix obvious punctuation, and return only the cleaned-up text.",
    format: "text",
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
      {/* Tier line */}
      <div>
        <div class="flex items-center gap-3 mb-3">
          <span
            class={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border-2 ${
              hasPaid
                ? "bg-[#F4C0D5] border-black/80 text-black"
                : "bg-[#F3E9DD] border-black/40 text-black/60"
            }`}
          >
            {hasPaid ? "Supporter" : "Free"}
          </span>
          <span class="text-sm text-gray-600 font-medium">
            {hasPaid ? "Unlimited · every model" : "20 a day, on the house"}
          </span>
        </div>
        {!hasPaid && (
          <button
            type="button"
            onClick={() => {
              onUnlockPremium?.();
              playSound.primaryClick();
              hapticService.buttonPress();
            }}
            onMouseEnter={() => playSound.hover()}
            class="text-sm font-bold text-black/50 hover:text-black underline decoration-dotted underline-offset-4 transition-colors mb-1"
          >
            Want more? Chip in and go unlimited →
          </button>
        )}
      </div>

      {/* Custom Prompt */}
      {onCustomPromptChange && (
        <div>
          <h4 class="text-lg font-black text-gray-900 mb-3">
            Output Style
          </h4>
          <div class="grid grid-cols-2 gap-2 mb-3">
            {outputPresets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => {
                  onCustomPromptChange(preset.prompt, preset.format);
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
