import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface MagicPanelProps {
  apiKeyValue?: string;
  onApiKeyChange?: (apiKey: string) => void;
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
  apiKeyValue = "",
  onApiKeyChange,
  customPromptValue = "",
  onCustomPromptChange,
}: MagicPanelProps) {
  return (
    <div class="space-y-4">
      {/* API Key Input */}
      {onApiKeyChange && (
        <div>
          <h4 class="text-lg font-black text-gray-900 mb-2">
            Voice Starter
            {apiKeyValue && apiKeyValue.trim() !== "" && (
              <span class="ml-2 text-green-600">✓ Voice Active</span>
            )}
          </h4>
          <p class="text-sm text-gray-600 mb-3">
            {!apiKeyValue || apiKeyValue.trim() === ""
              ? (
                <>
                  Voice transcription is the first ButtonSpa action. Paste a
                  Gemini key to turn recordings into copied text.{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-purple-600 hover:text-purple-700 underline font-bold"
                    onClick={() => {
                      playSound.primaryClick();
                      hapticService.buttonPress();
                    }}
                  >
                    Get a free Gemini key →
                  </a>
                </>
              )
              : "Voice transcription is on. Recordings will be transcribed and copied."}
          </p>
          <input
            type="password"
            value={apiKeyValue}
            onChange={(e) =>
              onApiKeyChange((e.target as HTMLInputElement).value)}
            onFocus={() => {
              playSound.primaryClick();
              hapticService.buttonPress();
            }}
            placeholder="AIza..."
            class={`w-full px-4 py-3 rounded-xl border-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-purple-300 ${
              apiKeyValue && apiKeyValue.trim() !== ""
                ? "border-green-500 bg-green-50"
                : "border-orange-500 bg-orange-50"
            }`}
          />
        </div>
      )}

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
