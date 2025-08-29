import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import VoiceButton from "../components/VoiceButton.tsx";
import CustomizationPanel from "../components/CustomizationPanel.tsx";
import AudioSettings from "../components/AudioSettings.tsx";
import {
  ButtonCustomization,
  defaultCustomization,
} from "../types/customization.ts";
import { hapticService } from "../utils/audio/hapticService.ts";
import { playSound } from "../utils/audio/soundMapping.ts";

// ===================================================================
// GLOBAL STATE - Main app state using Preact signals
// ===================================================================

const customization = signal<ButtonCustomization>(defaultCustomization);
const voiceEnabled = signal<boolean>(false);
const transcriptResult = signal<string>("");
const showTranscriptModal = signal<boolean>(false);
const apiKey = signal<string>("");
const customPrompt = signal<string>("");

export default function ButtonStudio() {
  // Welcome sound
  useEffect(() => {
    const timer = setTimeout(() => {
      playSound.primaryClick();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Shuffle handler
  useEffect(() => {
    const handleSurprise = () => {
      // Random themes
      const themes = ["soft", "flamingo", "voice"];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      // Apply random theme
      customization.value = {
        ...defaultCustomization,
        appearance: {
          ...defaultCustomization.appearance,
          theme: randomTheme as ButtonCustomization["appearance"]["theme"],
        },
      };
    };

    document.addEventListener("surpriseMe", handleSurprise);
    return () => document.removeEventListener("surpriseMe", handleSurprise);
  }, []);

  // ===================================================================
  // EVENT HANDLERS
  // ===================================================================

  const handleCustomizationChange = (newCustomization: ButtonCustomization) => {
    customization.value = newCustomization;
  };

  const handleVoiceToggle = (enabled: boolean) => {
    voiceEnabled.value = enabled;
  };

  const updateAppearance = (
    key: keyof ButtonCustomization["appearance"],
    value: number | string,
  ) => {
    customization.value = {
      ...customization.value,
      appearance: {
        ...customization.value.appearance,
        [key]: value,
      },
    };
  };

  return (
    <div class="min-h-screen bg-[#F7F0E2] flex flex-col">
      {/* Transcript Modal */}
      {showTranscriptModal.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto border-4 border-black">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-black text-black">
                  ✨ Voice Magic Result
                </h2>
                <button
                  onClick={() => showTranscriptModal.value = false}
                  class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div class="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                <p class="text-gray-900 text-lg leading-relaxed font-medium">
                  {transcriptResult.value || "No transcript available"}
                </p>
              </div>
              <div class="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcriptResult.value);
                  }}
                  class="flex-1 bg-orange-400 text-black px-4 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors border-2 border-black"
                  style={{ boxShadow: "4px 4px 0px #000000" }}
                >
                  📋 Copy Magic
                </button>
                <button
                  onClick={() => showTranscriptModal.value = false}
                  class="flex-1 bg-gray-200 text-black px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors border-2 border-black"
                  style={{ boxShadow: "4px 4px 0px #000000" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - CHONK typography restored */}
      <header class="max-w-[1280px] mx-auto w-full px-6 pt-10 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-6xl font-black tracking-tighter leading-none" style={{
              fontWeight: 900,
              letterSpacing: "-0.02em", 
              lineHeight: 1,
              WebkitFontSmoothing: "antialiased",
              textRendering: "optimizeLegibility"
            }}>
              ButtonStudio<span class="text-fuchsia-500">.app</span>
            </h1>
            <p class="text-[16px] italic" style={{ 
              marginTop: "12px", 
              letterSpacing: "0.02em",
              color: "rgba(0,0,0,0.75)",
              textShadow: "0 1px 0 rgba(255,255,255,0.6)"
            }}>
              Voice buttons that actually work
            </p>
          </div>
          <div class="flex items-center gap-2">
            <AudioSettings />
          </div>
        </div>
      </header>

      {/* Main Layout - Grid with stable proportions */}
      <main class="max-w-[1280px] mx-auto w-full px-6 flex-1 overflow-y-auto">
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(520px,1fr)_480px] gap-6 items-start">
          
          {/* Left Stage - Centered and balanced */}
          <section class="w-full">
            <div class="rounded-[22px] border-[4px] flex flex-col" style={{
              borderColor: "rgba(0,0,0,0.92)",
              filter: "drop-shadow(-6px 8px 0 rgba(0,0,0,0.9))",
              minHeight: "520px",
              height: "520px",
              background: "#FFFDFB"
            }}>
              
              {/* Stage Header with subtle gradient */}
              <div class="h-16 px-7 border-b-[3px] flex items-center justify-between rounded-t-[20px]" style={{
                borderColor: "rgba(0,0,0,0.88)",
                background: "var(--stage-grad, linear-gradient(180deg, #ECE6FB 0%, #F9EAE7 60%, #FBF7ED 100%))"
              }}>
                <span class="text-sm font-bold tracking-wider uppercase text-black/70">STAGE VIEW</span>
                {/* Compact Stage Pill - badge style */}
                <button
                  onClick={() => {
                    handleVoiceToggle(!voiceEnabled.value);
                    playSound.primaryClick();
                    hapticService.buttonPress();
                  }}
                  onMouseEnter={() => playSound.hover()}
                  class="h-9 min-w-[80px] rounded-full border-[3px] px-3 bg-white flex items-center gap-[6px] text-[13px] font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                  style={{
                    borderColor: "rgba(0,0,0,0.88)",
                    boxShadow: "2px 2px 0px rgba(0,0,0,0.75)"
                  }}
                >
                  <span>Stage</span>
                  <span class={`w-2 h-2 rounded-full border-2 border-black transition-colors ${
                    voiceEnabled.value ? "bg-green-500" : "bg-gray-300"
                  }`} />
                  <span class="font-bold">
                    {voiceEnabled.value ? "ON" : "OFF"}
                  </span>
                </button>
              </div>

              {/* Stage Body with better padding */}
              <div class="flex-1 p-[30px] overflow-hidden flex flex-col">
                <div class="h-full rounded-[18px] border-[3px] flex items-center justify-center relative" style={{
                  borderColor: "rgba(0,0,0,0.9)",
                  background: "linear-gradient(180deg, #fffaf4 0%, #fff2e3 100%)",
                  position: "relative"
                }}>
                  <div style={{ width: "240px" }}>
                    <VoiceButton
                      customization={customization.value}
                      onCustomizationChange={handleCustomizationChange}
                      voiceEnabled={voiceEnabled.value}
                      apiKey={apiKey.value}
                      customPrompt={customPrompt.value}
                      showWaveform={false}
                      onComplete={(result) => {
                        transcriptResult.value = result.text;
                        showTranscriptModal.value = true;
                      }}
                    />
                  </div>
                  
                  
                  {/* Magic Shuffle Button - BIG AND MAGICAL */}
                  <button
                    onClick={(e) => {
                      playSound.diceRoll?.() || playSound.primaryClick();
                      hapticService.diceRoll();
                      const btn = e.currentTarget;
                      btn.classList.add("animate-bounce");
                      btn.style.transform = "scale(0.9) rotate(-15deg)";
                      setTimeout(() => {
                        btn.style.transform = "scale(1.2) rotate(15deg)";
                      }, 100);
                      setTimeout(() => {
                        btn.style.transform = "scale(1) rotate(0deg)";
                        btn.classList.remove("animate-bounce");
                      }, 300);
                      const event = new CustomEvent("surpriseMe");
                      document.dispatchEvent(event);
                    }}
                    onMouseEnter={(e) => {
                      playSound.hover();
                      e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #FFF3B8 0%, #FFD4A3 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)";
                    }}
                    class="absolute bottom-4 right-4 h-[56px] w-[56px] rounded-[20px] border-[3px] flex items-center justify-center text-[28px] font-black transition-all duration-200 active:scale-95"
                    style={{
                      borderColor: "rgba(0,0,0,0.88)",
                      background: "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)",
                      boxShadow: "4px 4px 0px rgba(0,0,0,0.88), 0 8px 24px -12px rgba(255,200,0,0.4)"
                    }}
                    title="Surprise Me!"
                  >
                    🎲
                  </button>
                </div>
                
                {/* JUICE Slider/Text Input - Narrower, more refined */}
                <div class="mt-5 h-14 rounded-[18px] border-[3px]" style={{
                  borderColor: "rgba(0,0,0,0.88)"
                }}>
                  <input
                    type="text"
                    value={customization.value.content.value}
                    onInput={(e) => {
                      const newValue = (e.target as HTMLInputElement).value;
                      handleCustomizationChange({
                        ...customization.value,
                        content: {
                          ...customization.value.content,
                          value: newValue,
                        },
                      });
                    }}
                    onFocus={() => {
                      playSound.primaryClick();
                      hapticService.buttonPress();
                    }}
                    onMouseEnter={() => playSound.hover()}
                    placeholder="Boop me!"
                    maxLength={25}
                    class="w-full h-full rounded-[14px] border-[3px] bg-white font-black text-lg px-4 text-center hover:bg-gray-50 focus:bg-amber-50 focus:outline-none transition-colors active:translate-y-[1px]" style={{
                      borderColor: "rgba(0,0,0,0.88)"
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar - Panels with proper shadow spacing */}
          <aside class="w-full pb-5 pr-3">
            {/* All 6 panels now in CustomizationPanel */}
            <CustomizationPanel
              customization={customization.value}
              onChange={handleCustomizationChange}
              voiceEnabled={voiceEnabled.value}
              onVoiceToggle={handleVoiceToggle}
              apiKeyValue={apiKey.value}
              onApiKeyChange={(newApiKey) => {
                apiKey.value = newApiKey;
              }}
              customPromptValue={customPrompt.value}
              onCustomPromptChange={(newPrompt) => {
                customPrompt.value = newPrompt;
              }}
            />
          </aside>
        </div>
      </main>

      {/* Footer - Actually fixed at bottom */}
      <footer class="bg-white h-12 shrink-0" style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        marginTop: "auto"
      }}>
        <div class="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between text-xs text-neutral-500">
          <span>Made with 🔥 by Pablo • v1.0.0</span>
          <nav class="space-x-4">
            <a href="https://github.com/pablojosalvarado" target="_blank" rel="noopener noreferrer" class="hover:text-neutral-700 transition-colors">GitHub</a>
            <a href="mailto:pablo@buttonstudio.app" class="hover:text-neutral-700 transition-colors">Feedback</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}