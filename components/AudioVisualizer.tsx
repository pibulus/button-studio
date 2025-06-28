import { signal } from '@preact/signals'

// Access the existing button state from VoiceButton
declare global {
  interface Window {
    buttonState?: any
    transcript?: any
  }
}

export default function AudioVisualizer() {
  // We'll get the state from the global signals if available
  // or create our own indicators
  
  return (
    <div class="w-full">
      <h3 class="text-xl font-black text-black mb-4">
        Audio Status
      </h3>
      
      {/* Status Indicator */}
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-bold text-gray-600">Status</span>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium text-gray-700">Ready</span>
        </div>
      </div>
      
      {/* Waveform Placeholder */}
      <div class="w-full h-24 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
        <div class="flex items-end space-x-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              class="w-2 bg-gray-300 rounded-t animate-pulse"
              style={{ 
                height: `${Math.random() * 40 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Recording Info */}
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-bold text-gray-600">Duration</span>
          <div class="text-lg font-mono">0:00</div>
        </div>
        <div>
          <span class="font-bold text-gray-600">Quality</span>
          <div class="text-lg font-bold text-green-600">HD</div>
        </div>
      </div>
      
      {/* Transcript Area */}
      <div class="mt-6">
        <h4 class="text-sm font-bold text-gray-600 mb-2">Transcript</h4>
        <div class="w-full h-32 bg-gray-50 rounded-xl p-3 text-sm text-gray-500 font-mono">
          Press the button to start recording...
        </div>
      </div>
    </div>
  )
}