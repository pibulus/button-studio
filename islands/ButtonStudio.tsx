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
    <div class="h-screen bg-[#F7F0E2] flex flex-col overflow-hidden">
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

      {/* Header - Enhanced with better presence */}
      <header class="max-w-[1280px] mx-auto w-full px-6 pt-12 pb-8 shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-8xl font-black tracking-tighter leading-none" style={{
              fontWeight: 900,
              letterSpacing: "-0.03em", 
              lineHeight: 0.9,
              WebkitFontSmoothing: "antialiased",
              textRendering: "optimizeLegibility",
              textShadow: "4px 4px 0px rgba(255,183,255,0.2)"
            }}>
              ButtonStudio<span class="text-6xl text-fuchsia-500" style={{
                background: "linear-gradient(135deg, #FF00FF 0%, #FF69B4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.1))"
              }}>.app</span>
            </h1>
            <p class="text-[18px] italic font-medium" style={{ 
              marginTop: "16px", 
              letterSpacing: "0.02em",
              color: "rgba(0,0,0,0.7)",
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

      {/* Main Layout - Grid with better spacing */}
      <main class="max-w-[1280px] mx-auto w-full px-6 pt-6 pb-8 flex-1 overflow-hidden min-h-0">
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(520px,1fr)_480px] gap-8 h-full items-start">
          
          {/* Left Stage - Better proportioned */}
          <section class="w-full flex flex-col">
            <div class="flex flex-col" style={{
              borderRadius: "var(--r, 22px)",
              border: "var(--b, 3px) solid rgba(0,0,0,0.92)",
              filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.35))",
              background: "var(--panel, #FFF9F2)",
              height: "440px"
            }}>
              
              {/* Stage Header - matching right panels */}
              <div class="h-[58px] px-[22px] flex items-center shrink-0" style={{
                borderBottom: "var(--b, 3px) solid rgba(0,0,0,0.12)",
                borderRadius: "calc(var(--r, 22px) - var(--b, 3px)) calc(var(--r, 22px) - var(--b, 3px)) 0 0",
                background: "#F4E8FF"
              }}>
                <div class="flex items-center">
                  {/* Dot to match right panels */}
                  <span 
                    class="inline-block w-[6px] h-[6px] rounded-full mr-3"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      transform: "translateY(0.5px)",
                    }}
                  />
                  <span class="text-[19px] font-bold leading-none" style={{ color: "rgba(0,0,0,0.85)" }}>
                    Stage View
                  </span>
                </div>
              </div>

              {/* Stage Body with better padding */}
              <div class="flex-1 p-[24px] overflow-hidden flex flex-col">
                <div class="h-full flex items-center justify-center relative" style={{
                  borderRadius: "var(--r-inner, 18px)",
                  border: "var(--b, 3px) solid rgba(0,0,0,0.9)",
                  background: `radial-gradient(ellipse at top left, rgba(255,230,250,0.4) 0%, transparent 40%),
                              radial-gradient(ellipse at bottom right, rgba(230,240,255,0.4) 0%, transparent 40%),
                              radial-gradient(circle at center, rgba(255,248,230,0.3) 0%, transparent 60%),
                              linear-gradient(135deg, #FFF8F5 0%, #FFF5FA 50%, #F8F5FF 100%)`
                }}>
                  <div style={{ width: "240px" }}>
                    <VoiceButton
                      customization={customization.value}
                      onCustomizationChange={handleCustomizationChange}
                      voiceEnabled={!!apiKey.value}
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
                    class="absolute bottom-4 right-4 h-[56px] w-[56px] rounded-[20px] flex items-center justify-center text-[28px] font-black transition-all duration-200 active:scale-95"
                    style={{
                      border: "var(--b, 3px) solid rgba(0,0,0,0.88)",
                      background: "linear-gradient(135deg, #FFFFFF 0%, #FFF3B8 100%)",
                      filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.35))"
                    }}
                    title="Surprise Me!"
                  >
                    🎲
                  </button>
                </div>
                
                {/* JUICE Slider/Text Input - Narrower, more refined */}
                <div class="mt-5">
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
                    class="w-full h-14 bg-white font-black text-lg px-4 text-center hover:bg-gray-50 focus:bg-amber-50 focus:outline-none transition-colors active:translate-y-[1px]" 
                    style={{
                      borderRadius: "var(--r-inner, 18px)",
                      border: "var(--b, 3px) solid rgba(0,0,0,0.88)"
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar - Panels with proper shadow spacing */}
          <aside 
            class="w-full h-full overflow-y-auto pr-1 custom-scrollbar" 
            style={{ 
              maxHeight: "calc(100vh - 260px)",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "8px"
            }}>
            {/* All 6 panels now in CustomizationPanel */}
            <CustomizationPanel
              customization={customization.value}
              onChange={handleCustomizationChange}
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

      {/* Footer - Better balanced height */}
      <footer class="bg-white h-14 shrink-0" style={{
        borderTop: "2px solid rgba(0,0,0,0.08)",
        background: "linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)"
      }}>
        <div class="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between text-sm text-neutral-600">
          <span class="font-medium">Made with 🔥 by Pablo • v1.0.0</span>
          <nav class="space-x-6">
            <a href="https://github.com/pablojosalvarado" target="_blank" rel="noopener noreferrer" class="hover:text-neutral-900 transition-colors font-medium">GitHub</a>
            <a href="mailto:pablo@buttonstudio.app" class="hover:text-neutral-900 transition-colors font-medium">Feedback</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}