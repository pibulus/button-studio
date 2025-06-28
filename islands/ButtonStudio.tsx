import { signal } from '@preact/signals'
import VoiceButton from '../components/VoiceButton.tsx'
import CustomizationPanel from '../components/CustomizationPanel.tsx'
import { ButtonCustomization, defaultCustomization } from '../types/customization.ts'

// Global customization state
const customization = signal<ButtonCustomization>(defaultCustomization)
const voiceEnabled = signal<boolean>(false)
const transcriptResult = signal<string>('')
const showTranscriptModal = signal<boolean>(false)

export default function ButtonStudio() {
  
  const handleCustomizationChange = (newCustomization: ButtonCustomization) => {
    customization.value = newCustomization
  }
  
  const handleVoiceToggle = (enabled: boolean) => {
    voiceEnabled.value = enabled
  }
  
  return (
    <div class="min-h-screen" style={{ backgroundColor: '#f5f1eb' }}>
      
      {/* Transcript Modal */}
      {showTranscriptModal.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto border-4 border-black">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-black text-black">✨ Voice Magic Result</h2>
                <button
                  onClick={() => showTranscriptModal.value = false}
                  class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div class="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                <p class="text-gray-900 text-lg leading-relaxed font-medium">
                  {transcriptResult.value || 'No transcript available'}
                </p>
              </div>
              
              <div class="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcriptResult.value)
                  }}
                  class="flex-1 bg-orange-400 text-black px-4 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors border-2 border-black"
                  style={{ boxShadow: '4px 4px 0px #000000' }}
                >
                  📋 Copy Magic
                </button>
                <button
                  onClick={() => showTranscriptModal.value = false}
                  class="flex-1 bg-gray-200 text-black px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors border-2 border-black"
                  style={{ boxShadow: '4px 4px 0px #000000' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* BIGGER Header - Brutalist Style */}
      <header class="pt-20 pb-12 px-6">
        <div class="max-w-5xl mx-auto text-center">
          <h1 class="text-7xl md:text-8xl font-black text-black tracking-tight leading-none mb-4">
            ButtonStudio
            <span class="text-transparent bg-clip-text" style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              .app
            </span>
          </h1>
          <p class="text-xl text-black font-bold">
            Voice buttons that don't suck.
          </p>
        </div>
      </header>
      
      {/* Main Button Area - Breathing Room */}
      <section class="px-6 pb-16">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-3xl p-16 md:p-20 shadow-lg border-4 border-black">
            <div class="flex justify-center items-center">
              <VoiceButton 
                customization={customization.value}
                onCustomizationChange={handleCustomizationChange}
                voiceEnabled={voiceEnabled.value}
                showWaveform={false}  // No visualizer in button area
                onComplete={(result) => {
                  transcriptResult.value = result.text
                  showTranscriptModal.value = true
                }}
              />
            </div>
          </div>
        </div>
      </section>

      
      {/* Controls - More Space */}
      <section class="px-6 pb-16">
        <div class="max-w-3xl mx-auto">
          <CustomizationPanel 
            customization={customization.value}
            onChange={handleCustomizationChange}
            voiceEnabled={voiceEnabled.value}
            onVoiceToggle={handleVoiceToggle}
          />
        </div>
      </section>
      
      
    </div>
  )
}