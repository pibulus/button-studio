import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface MagicPanelProps {
  apiKeyValue?: string;
  onApiKeyChange?: (apiKey: string) => void;
  customPromptValue?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

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
            Gemini API Key
            {apiKeyValue && apiKeyValue.trim() !== "" && (
              <span class="ml-2 text-green-600">✓ Voice Active</span>
            )}
          </h4>
          <p class="text-sm text-gray-600 mb-3">
            {!apiKeyValue || apiKeyValue.trim() === ""
              ? "⚠️ Add your API key to enable voice transcription - Get one at makersuite.google.com/app/apikey"
              : "Voice transcription is automatically enabled with your API key"}
          </p>
          <input
            type="password"
            value={apiKeyValue}
            onChange={(e) =>
              onApiKeyChange((e.target as HTMLInputElement).value)}
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
            Custom Instructions
          </h4>
          <p class="text-sm text-gray-600 mb-3">
            Add special instructions for transcription (optional)
          </p>
          <textarea
            value={customPromptValue}
            onChange={(e) =>
              onCustomPromptChange((e.target as HTMLTextAreaElement).value)}
            placeholder="e.g., 'Format as bullet points' or 'Use proper capitalization'"
            rows={3}
            class="w-full px-4 py-3 rounded-xl border-3 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white resize-none"
          />
        </div>
      )}
    </div>
  );
}
