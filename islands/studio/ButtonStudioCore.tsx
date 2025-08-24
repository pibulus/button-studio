// ===================================================================
// BUTTON STUDIO CORE - Refactored main component
// Uses extracted State and ColorMode components for better organization
// ===================================================================

import { useEffect } from "preact/hooks";
import VoiceButton from "../../components/VoiceButton.tsx";
import CustomizationPanel from "../../components/CustomizationPanel.tsx";
import AudioSettings from "../../components/AudioSettings.tsx";
import SoundPicker from "../../components/SoundPicker.tsx";
import { sliderConfig } from "../../types/customization.ts";
import { soundService } from "../../utils/audio/soundService.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";
import { playSound } from "../../utils/audio/soundMapping.ts";

// Import extracted modules
import { 
  customization,
  voiceEnabled,
  transcriptResult,
  showTranscriptModal,
  apiKey,
  customPrompt,
  setTranscriptResult,
  closeTranscriptModal,
  setApiKey,
  setCustomPrompt,
  toggleVoiceEnabled,
} from "./ButtonStudioState.tsx";

import {
  colorMode,
  colorModes,
  getCurrentColorPalette,
  getCurrentFillType,
  cycleColorMode,
} from "./ColorModeManager.tsx";

// Import Gemini transcription plugin
import { GeminiTranscriptionPlugin } from "../../plugins/transcription/gemini.ts";

export default function ButtonStudioCore() {
  // ===================================================================
  // INITIALIZATION & EFFECTS
  // ===================================================================
  
  useEffect(() => {
    // Initialize audio system
    soundService.initialize().then(() => {
      console.log("🎵 Sound service initialized");
    });

    // Initialize haptics
    hapticService.initialize();
    console.log("📳 Haptic service initialized");

    // Welcome sound
    playSound.startup();
  }, []);

  // ===================================================================
  // TRANSCRIPTION PLUGIN SETUP
  // ===================================================================
  
  const transcriptionPlugin = apiKey.value
    ? new GeminiTranscriptionPlugin()
    : undefined;

  // Configure the plugin when API key or custom prompt changes
  useEffect(() => {
    if (transcriptionPlugin && apiKey.value) {
      transcriptionPlugin.configure({
        apiKey: apiKey.value,
        customPrompt: customPrompt.value || undefined,
      }).catch((error) => {
        console.error("Failed to configure Gemini plugin:", error);
      });
    }
  }, [apiKey.value, customPrompt.value]);

  // ===================================================================
  // COLOR MODE INTEGRATION
  // ===================================================================
  
  useEffect(() => {
    const mode = colorModes[colorMode.value];
    const fillType = mode.fillType;
    
    // Update customization based on color mode
    if (fillType === "gradient") {
      const gradientColors = mode.colors[0] as [string, string];
      customization.value = {
        ...customization.value,
        appearance: {
          ...customization.value.appearance,
          fillType: "gradient",
        },
        colors: {
          ...customization.value.colors,
          primary: gradientColors[0],
          secondary: gradientColors[1],
        },
      };
    } else {
      const solidColor = mode.colors[0] as string;
      customization.value = {
        ...customization.value,
        appearance: {
          ...customization.value.appearance,
          fillType: "solid",
        },
        colors: {
          ...customization.value.colors,
          primary: solidColor,
        },
      };
    }
    
    // Play color change sound
    playSound.colorChange();
  }, [colorMode.value]);

  // ===================================================================
  // EVENT HANDLERS
  // ===================================================================
  
  const handleTranscript = (text: string) => {
    console.log("📝 Transcript received:", text);
    setTranscriptResult(text);
  };

  const handleStateChange = (state: string) => {
    console.log("🎤 Voice button state:", state);
  };

  const handleCustomizationChange = (newCustomization: any) => {
    customization.value = newCustomization;
    playSound.sliderStep();
  };

  // ===================================================================
  // RENDER
  // ===================================================================
  
  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sunset-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-juice-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-mint-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-cream/80 backdrop-blur-md border-b-2 border-black shadow-hard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-black tracking-tight font-display">
                ButtonStudio
              </h1>
              <span className="text-sm font-medium text-gray-600 bg-yellow-200 px-2 py-1 rounded-full border border-black">
                Voice Design Lab
              </span>
            </div>
            
            {/* Audio Settings */}
            <div className="flex items-center gap-4">
              <SoundPicker />
              <AudioSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Button Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl border-2 border-black shadow-hard p-8">
                <h2 className="text-xl font-bold mb-6 text-center">
                  Live Preview
                </h2>
                
                {/* Voice Button Preview */}
                <div className="flex justify-center items-center min-h-[300px]">
                  <VoiceButton
                    customization={customization.value}
                    voiceEnabled={voiceEnabled.value}
                    onVoiceToggle={toggleVoiceEnabled}
                    transcriptionPlugin={transcriptionPlugin}
                    onTranscript={handleTranscript}
                    onStateChange={handleStateChange}
                    apiKey={apiKey.value}
                    customPrompt={customPrompt.value}
                  />
                </div>

                {/* Color Mode Selector */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Color Mode
                    </span>
                    <button
                      onClick={() => cycleColorMode()}
                      className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
                    >
                      {colorModes[colorMode.value].name}
                    </button>
                  </div>
                  
                  {/* Color Palette Preview */}
                  <div className="grid grid-cols-6 gap-2">
                    {getCurrentColorPalette().slice(0, 12).map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (getCurrentFillType() === "gradient") {
                            const gradientColor = color as [string, string];
                            customization.value = {
                              ...customization.value,
                              colors: {
                                ...customization.value.colors,
                                primary: gradientColor[0],
                                secondary: gradientColor[1],
                              },
                            };
                          } else {
                            customization.value = {
                              ...customization.value,
                              colors: {
                                ...customization.value.colors,
                                primary: color as string,
                              },
                            };
                          }
                          playSound.colorChange();
                        }}
                        className="w-10 h-10 rounded-lg border-2 border-black shadow-md hover:scale-110 transition-transform"
                        style={{
                          background: getCurrentFillType() === "gradient"
                            ? `linear-gradient(135deg, ${(color as [string, string])[0]}, ${(color as [string, string])[1]})`
                            : color as string,
                        }}
                        aria-label={`Select color ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="lg:col-span-2">
            <CustomizationPanel
              customization={customization.value}
              onChange={handleCustomizationChange}
              sliderConfig={sliderConfig}
              apiKey={apiKey.value}
              onApiKeyChange={setApiKey}
              customPrompt={customPrompt.value}
              onCustomPromptChange={setCustomPrompt}
            />
          </div>
        </div>
      </main>

      {/* Transcript Modal */}
      {showTranscriptModal.value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl border-2 border-black shadow-hard max-w-2xl w-full p-6 animate-bounce-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Transcription Result</h3>
              <button
                onClick={closeTranscriptModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {transcriptResult.value}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeTranscriptModal}
                className="px-4 py-2 bg-juice-500 text-white font-semibold rounded-lg hover:bg-juice-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}