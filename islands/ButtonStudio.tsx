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
    <div class="min-h-screen" style={{ 
      background: 'radial-gradient(circle at top right, #fefbf3, #faf6ed)',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f5ead6" fill-opacity="0.3"%3E%3Ccircle cx="7" cy="7" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    }}>
      
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
            Beautiful, customizable button generator.
          </p>
        </div>
      </header>
      
      {/* Main Content - Reorganized Layout */}
      <section class="px-6 pb-16">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Button + Master Controls */}
            <div class="space-y-6">
              
              {/* Button Preview */}
              <div class="bg-white rounded-3xl p-12 shadow-lg border-4 border-black relative">
                <div class="flex justify-center items-center h-[240px]">
                  <VoiceButton 
                    customization={customization.value}
                    onCustomizationChange={handleCustomizationChange}
                    voiceEnabled={voiceEnabled.value}
                    showWaveform={false}
                    onComplete={(result) => {
                      transcriptResult.value = result.text
                      showTranscriptModal.value = true
                    }}
                  />
                </div>
                
                {/* Dice Shuffle Icon */}
                <button
                  onClick={() => {
                    // We'll call the surprise function from the master panel
                    const event = new CustomEvent('surpriseMe')
                    document.dispatchEvent(event)
                  }}
                  class="absolute top-4 right-4 w-12 h-12 bg-white border-3 border-black rounded-xl hover:bg-yellow-50 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-md hover:shadow-lg"
                  title="Surprise me! 🎲"
                  style={{
                    boxShadow: '3px 3px 0px #000000'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.9) translate(1px, 1px)'
                    e.currentTarget.style.boxShadow = '1px 1px 0px #000000'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '3px 3px 0px #000000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '3px 3px 0px #000000'
                  }}
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-6 8h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm6 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/>
                    <circle cx="7" cy="7" r="1"/>
                    <circle cx="13" cy="7" r="1"/>
                    <circle cx="13" cy="13" r="1"/>
                    <circle cx="17" cy="13" r="1"/>
                    <circle cx="7" cy="17" r="1"/>
                    <circle cx="13" cy="17" r="1"/>
                  </svg>
                </button>
              </div>
              
              {/* Master Controls */}
              <CustomizationPanel 
                customization={customization.value}
                onChange={handleCustomizationChange}
                voiceEnabled={voiceEnabled.value}
                onVoiceToggle={handleVoiceToggle}
                mode="master"
              />
              
            </div>
            
            {/* Right Column - Advanced Controls */}
            <div>
              <CustomizationPanel 
                customization={customization.value}
                onChange={handleCustomizationChange}
                voiceEnabled={voiceEnabled.value}
                onVoiceToggle={handleVoiceToggle}
                mode="advanced"
              />
            </div>
            
          </div>
        </div>
      </section>
      
      
    </div>
  )
}