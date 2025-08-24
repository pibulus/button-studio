import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";

interface MagicPanelProps {
  voiceEnabled?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;
  apiKeyValue?: string;
  onApiKeyChange?: (apiKey: string) => void;
  customPromptValue?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

export default function MagicPanel({
  voiceEnabled = false,
  onVoiceToggle,
  apiKeyValue = "",
  onApiKeyChange,
  customPromptValue = "",
  onCustomPromptChange,
}: MagicPanelProps) {
  return (
    <div class="space-y-4">
      {/* Voice Toggle */}
      {onVoiceToggle && (
        <div>
          <h4 class="text-lg font-black text-gray-900 mb-4">
            Voice Transcription
          </h4>
          <button
            onClick={() => {
              onVoiceToggle(!voiceEnabled);
              playSound.toggleOn();
              hapticService.buttonPress();
            }}
            class={`w-full px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 ${
              voiceEnabled
                ? "bg-purple-200 text-black shadow-xl scale-105"
                : "bg-white text-black hover:bg-purple-50"
            }`}
          >
            {voiceEnabled ? "Voice Enabled ✨" : "Enable Voice"}
          </button>
        </div>
      )}

      {/* API Key Input */}
      {voiceEnabled && onApiKeyChange && (
        <div>
          <h4 class="text-lg font-black text-gray-900 mb-2">Gemini API Key</h4>
          <p class="text-sm text-gray-600 mb-3">
            Enter your Gemini API key to enable voice transcription
          </p>
          <input
            type="password"
            value={apiKeyValue}
            onChange={(e) =>
              onApiKeyChange((e.target as HTMLInputElement).value)}
            placeholder="AIza..."
            class="w-full px-4 py-3 rounded-xl border-3 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white"
          />
        </div>
      )}

      {/* Custom Prompt */}
      {voiceEnabled && onCustomPromptChange && (
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
