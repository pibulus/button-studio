import { ButtonCustomization, sliderConfig, buttonThemes, ButtonTheme } from '../types/customization.ts'

interface CustomizationPanelProps {
  customization: ButtonCustomization
  onChange: (customization: ButtonCustomization) => void
  voiceEnabled?: boolean
  onVoiceToggle?: (enabled: boolean) => void
}

export default function CustomizationPanel({ customization, onChange, voiceEnabled = false, onVoiceToggle }: CustomizationPanelProps) {
  
  const updateAppearance = (key: keyof ButtonCustomization['appearance'], value: number) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        [key]: value
      }
    })
  }
  
  const updateTheme = (theme: ButtonTheme) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        theme
      }
    })
  }
  
  const updateContent = (value: string) => {
    onChange({
      ...customization,
      content: {
        ...customization.content,
        value
      }
    })
  }
  
  const updateGradient = (key: 'start' | 'end' | 'direction', value: string | number) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        gradient: {
          ...customization.appearance.gradient,
          [key]: value
        }
      }
    })
  }
  
  // Soft, modern gradients with proper color theory
  const colorSwatches = [
    { start: '#fde2e7', end: '#fad2e1' }, // soft blush
    { start: '#ddd6fe', end: '#e0e7ff' }, // lavender dream  
    { start: '#fef3c7', end: '#fde68a' }, // warm cream
    { start: '#d1fae5', end: '#a7f3d0' }, // mint fresh
    { start: '#fed7d7', end: '#fecaca' }, // coral blush
    { start: '#bfdbfe', end: '#dbeafe' }, // sky blue
    { start: '#f3e8ff', end: '#e9d5ff' }, // violet mist
    { start: '#fef7cd', end: '#fef0b6' }  // golden hour
  ]
  
  return (
    <div class="space-y-8">
      
      {/* Content Input - Brutalist Black Borders */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <div class="flex items-center gap-6">
          <input
            type="text"
            value={customization.content.value}
            onInput={(e) => updateContent((e.target as HTMLInputElement).value)}
            placeholder="🎤"
            class="flex-1 px-6 py-4 text-2xl font-bold bg-white border-3 border-black rounded-2xl focus:bg-yellow-50 focus:outline-none transition-all text-center"
          />
          
          {/* Voice Toggle - Pink */}
          <button
            onClick={() => onVoiceToggle?.(!voiceEnabled)}
            class={`w-16 h-10 rounded-full border-3 border-black transition-all duration-200 flex items-center shadow-lg ${
              voiceEnabled 
                ? 'bg-pink-400' 
                : 'bg-white'
            }`}
          >
            <div 
              class={`w-7 h-7 bg-white rounded-full shadow-sm transition-all duration-200 border-2 border-black ${
                voiceEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      {/* Color Swatches - Black Borders */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <div class="grid grid-cols-4 gap-4">
          {colorSwatches.map((swatch, index) => (
            <button
              key={index}
              onClick={() => {
                updateGradient('start', swatch.start)
                updateGradient('end', swatch.end)
              }}
              class="h-16 rounded-2xl border-3 border-black hover:scale-105 transition-all duration-200 shadow-md"
              style={{
                background: `linear-gradient(135deg, ${swatch.start}, ${swatch.end})`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Pink Grabbable Sliders */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <div class="space-y-6">
          {sliderConfig.map((slider) => {
            const value = customization.appearance[slider.id]
            const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100
            
            return (
              <div key={slider.id} class="flex items-center gap-6">
                <div class="w-12 h-12 flex items-center justify-center text-xl bg-white rounded-2xl border-3 border-black shadow-md">
                  {slider.icon}
                </div>
                
                <div class="flex-1 relative">
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step || 1}
                    value={value}
                    onInput={(e) => updateAppearance(slider.id, parseFloat((e.target as HTMLInputElement).value))}
                    class="w-full h-4 bg-white border-2 border-black rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f472b6 0%, #f472b6 ${percentage}%, #ffffff ${percentage}%, #ffffff 100%)`,
                      border: '2px solid #000000'
                    }}
                  />
                  <style jsx>{`
                    input[type="range"]::-webkit-slider-thumb {
                      appearance: none;
                      height: 28px;
                      width: 28px;
                      border-radius: 14px;
                      background: #f472b6;
                      border: 3px solid #000000;
                      cursor: grab;
                      box-shadow: 0 4px 12px rgba(244, 114, 182, 0.4);
                      transition: all 0.2s ease;
                    }
                    
                    input[type="range"]::-webkit-slider-thumb:hover {
                      background: #ec4899;
                      transform: scale(1.2);
                      box-shadow: 0 6px 20px rgba(244, 114, 182, 0.6);
                      cursor: grabbing;
                    }
                    
                    input[type="range"]::-webkit-slider-thumb:active {
                      transform: scale(1.3);
                      cursor: grabbing;
                    }
                    
                    input[type="range"]::-moz-range-thumb {
                      height: 28px;
                      width: 28px;
                      border-radius: 14px;
                      background: #f472b6;
                      border: 3px solid #000000;
                      cursor: grab;
                      box-shadow: 0 4px 12px rgba(244, 114, 182, 0.4);
                    }
                  `}</style>
                </div>
                
                <div class="w-16 text-right text-sm font-black text-black bg-white border-2 border-black px-3 py-2 rounded-lg shadow-sm">
                  {value}{slider.unit}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
    </div>
  )
}