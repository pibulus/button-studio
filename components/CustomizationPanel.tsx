import { ButtonCustomization, sliderConfig, buttonThemes, ButtonTheme } from '../types/customization.ts'

interface CustomizationPanelProps {
  customization: ButtonCustomization
  onChange: (customization: ButtonCustomization) => void
  voiceEnabled?: boolean
  onVoiceToggle?: (enabled: boolean) => void
}

export default function CustomizationPanel({ customization, onChange, voiceEnabled = false, onVoiceToggle }: CustomizationPanelProps) {
  
  const updateAppearance = (key: keyof ButtonCustomization['appearance'], value: number | string) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        [key]: value
      }
    })
  }
  
  const updateEffect = (key: keyof ButtonCustomization['effects'], value: boolean) => {
    onChange({
      ...customization,
      effects: {
        ...customization.effects,
        [key]: value
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
  
  const updateContentType = (type: 'text' | 'emoji' | 'icon') => {
    onChange({
      ...customization,
      content: {
        ...customization.content,
        type
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
  
  // Succulent-inspired color palette
  const succulentColors = [
    '#ff9eb5',  // Pink succulent tip
    '#ffb3d1',  // Soft rose
    '#ffc4e1',  // Baby pink 
    '#e6a8d6',  // Lavender pink
    '#d1c4e0',  // Soft purple
    '#b8d8e0',  // Powder blue
    '#a8d8d1',  // Sage green
    '#c8e6c9',  // Mint green
    '#fff3b8',  // Cream yellow
    '#ffd4a3',  // Peach
    '#ffb08a',  // Coral
    '#ff9a8b'   // Warm coral
  ]
  
  // Surprise Me! Random combinations - FULLY WORKING
  const surpriseMe = () => {
    console.log('🎲 Surprise Me clicked!')
    
    const randomTexts = ['Boop me!', 'Zap!', 'Press here', 'Voice magic', 'Tap me', 'Hello!', 'Record me', 'Speak now', 'Pop!', 'Click!', 'Touch me', 'Go!']
    const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)]
    
    // Random everything with timeout to see changes
    setTimeout(() => {
      updateContent(randomText)
    }, 100)
    
    setTimeout(() => {
      updateAppearance('fillType', Math.random() > 0.5 ? 'gradient' : 'solid')
    }, 200)
    
    setTimeout(() => {
      updateAppearance('solidColor', succulentColors[Math.floor(Math.random() * succulentColors.length)])
    }, 300)
    
    setTimeout(() => {
      updateGradient('start', succulentColors[Math.floor(Math.random() * succulentColors.length)])
    }, 400)
    
    setTimeout(() => {
      updateGradient('end', succulentColors[Math.floor(Math.random() * succulentColors.length)])
    }, 500)
    
    setTimeout(() => {
      updateAppearance('shape', ['circle', 'rounded', 'square'][Math.floor(Math.random() * 3)] as any)
    }, 600)
    
    setTimeout(() => {
      updateAppearance('scale', 0.7 + Math.random() * 0.8)
    }, 700)
    
    setTimeout(() => {
      updateAppearance('roundness', Math.random() * 30)
    }, 800)
    
    setTimeout(() => {
      updateAppearance('glowIntensity', Math.random() * 15)
    }, 900)
    
    setTimeout(() => {
      updateAppearance('shadowType', Math.random() > 0.5 ? 'brutalist' : 'diffused')
    }, 1000)
    
    // Random effects
    setTimeout(() => {
      updateEffect('breathing', Math.random() > 0.5)
      updateEffect('bounce', Math.random() > 0.7)
      updateEffect('glow', Math.random() > 0.6)
      updateEffect('wiggle', Math.random() > 0.8)
    }, 1100)
  }
  
  return (
    <div class="space-y-8">
      
      {/* CONTENT SECTION */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <h3 class="text-2xl font-black text-black mb-6">
          Content
        </h3>
        
        <div class="space-y-6">
          {/* Content Type Selector */}
          <div class="flex gap-3">
            {[
              { type: 'text', label: 'Text' },
              { type: 'emoji', label: 'Emoji' },
              { type: 'icon', label: 'Icon' }
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => updateContentType(type as any)}
                class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all duration-200 ${
                  customization.content.type === type
                    ? 'bg-pink-300 text-black shadow-md scale-105'
                    : 'bg-white text-black hover:bg-pink-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Content Input */}
          <div class="flex items-center gap-6">
            <input
              type="text"
              value={customization.content.value}
              onInput={(e) => updateContent((e.target as HTMLInputElement).value)}
              placeholder="Boop me!"
              class="flex-1 px-6 py-4 text-2xl font-bold bg-white border-3 border-black rounded-2xl focus:bg-yellow-50 focus:outline-none transition-all text-center"
            />
            
            {/* Voice Toggle */}
            <button
              onClick={() => onVoiceToggle?.(!voiceEnabled)}
              class={`w-16 h-10 rounded-full border-3 border-black transition-all duration-200 flex items-center shadow-lg ${
                voiceEnabled 
                  ? 'bg-pink-300' 
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
      </div>
      
      {/* SHAPE & STYLE SECTION */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <h3 class="text-2xl font-black text-black mb-6">
          Shape & Style
        </h3>
        
        <div class="space-y-6">
          {/* Shape Selector */}
          <div class="flex gap-3">
            {[
              { shape: 'circle', label: 'Circle' },
              { shape: 'rounded', label: 'Rounded' },
              { shape: 'square', label: 'Square' }
            ].map(({ shape, label }) => (
              <button
                key={shape}
                onClick={() => updateAppearance('shape', shape)}
                class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all duration-200 ${
                  customization.appearance.shape === shape
                    ? 'bg-green-200 text-black shadow-md scale-105'
                    : 'bg-white text-black hover:bg-green-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* The Big 3 Sliders */}
          <div class="space-y-6">
            {sliderConfig.map((slider) => {
              const value = customization.appearance[slider.id]
              const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100
              
              return (
                <div key={slider.id} class="flex items-center gap-6">
                  <div class="w-12 h-12 flex items-center justify-center text-xl bg-white rounded-2xl border-3 border-black shadow-md font-black">
                    {slider.label.charAt(0)}
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
                        background: `linear-gradient(to right, #ff9eb5 0%, #ff9eb5 ${percentage}%, #ffffff ${percentage}%, #ffffff 100%)`,
                        border: '2px solid #000000'
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        height: 28px;
                        width: 28px;
                        border-radius: 14px;
                        background: #ff9eb5;
                        border: 3px solid #000000;
                        cursor: grab;
                        box-shadow: 0 4px 12px rgba(255, 158, 181, 0.4);
                        transition: all 0.2s ease;
                      }
                      
                      input[type="range"]::-webkit-slider-thumb:hover {
                        background: #ff8fab;
                        transform: scale(1.2);
                        box-shadow: 0 6px 20px rgba(255, 158, 181, 0.6);
                        cursor: grabbing;
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
      
      {/* COLOR SECTION */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <h3 class="text-2xl font-black text-black mb-6">
          Colors
        </h3>
        
        <div class="space-y-6">
          {/* Fill Type Toggle */}
          <div class="flex gap-3">
            <button
              onClick={() => updateAppearance('fillType', 'solid')}
              class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all duration-200 ${
                customization.appearance.fillType === 'solid'
                  ? 'bg-yellow-200 text-black shadow-md scale-105'
                  : 'bg-white text-black hover:bg-yellow-50'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => updateAppearance('fillType', 'gradient')}
              class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all duration-200 ${
                customization.appearance.fillType === 'gradient'
                  ? 'bg-yellow-200 text-black shadow-md scale-105'
                  : 'bg-white text-black hover:bg-yellow-50'
              }`}
            >
              Gradient
            </button>
          </div>
          
          {/* Succulent Color Swatches */}
          <div class="grid grid-cols-6 gap-3 mb-6">
            {succulentColors.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  if (customization.appearance.fillType === 'solid') {
                    updateAppearance('solidColor', color)
                  } else {
                    updateGradient('start', color)
                  }
                }}
                class="h-12 rounded-xl border-3 border-black hover:scale-110 transition-all duration-200 shadow-md"
                style={{ background: color }}
              />
            ))}
          </div>
          
          {/* Color Controls */}
          {customization.appearance.fillType === 'solid' ? (
            <div class="flex items-center gap-4">
              <input
                type="color"
                value={customization.appearance.solidColor}
                onInput={(e) => updateAppearance('solidColor', (e.target as HTMLInputElement).value)}
                class="w-16 h-16 rounded-2xl border-3 border-black cursor-pointer"
              />
              <div class="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-black font-mono text-black">
                {customization.appearance.solidColor}
              </div>
            </div>
          ) : (
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <input
                  type="color"
                  value={customization.appearance.gradient.start}
                  onInput={(e) => updateGradient('start', (e.target as HTMLInputElement).value)}
                  class="w-12 h-12 rounded-xl border-3 border-black cursor-pointer"
                />
                <div class="flex-1 px-3 py-2 bg-gray-50 rounded-lg border-2 border-black font-mono text-sm text-black">
                  {customization.appearance.gradient.start}
                </div>
                <span class="text-black font-black">→</span>
                <input
                  type="color"
                  value={customization.appearance.gradient.end}
                  onInput={(e) => updateGradient('end', (e.target as HTMLInputElement).value)}
                  class="w-12 h-12 rounded-xl border-3 border-black cursor-pointer"
                />
                <div class="flex-1 px-3 py-2 bg-gray-50 rounded-lg border-2 border-black font-mono text-sm text-black">
                  {customization.appearance.gradient.end}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* EFFECTS SECTION */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <h3 class="text-2xl font-black text-black mb-6">
          Effects
        </h3>
        
        <div class="space-y-6">
          {/* Animation Effects */}
          <div class="grid grid-cols-2 gap-4">
            {[
              { key: 'breathing', label: 'Breathe' },
              { key: 'bounce', label: 'Bounce' },
              { key: 'glow', label: 'Glow' },
              { key: 'wiggle', label: 'Wiggle' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateEffect(key as keyof ButtonCustomization['effects'], !customization.effects[key as keyof ButtonCustomization['effects']])}
                class={`p-4 rounded-2xl border-3 border-black transition-all duration-200 font-black text-lg ${
                  customization.effects[key as keyof ButtonCustomization['effects']]
                    ? 'bg-purple-200 shadow-md scale-105' 
                    : 'bg-white hover:bg-purple-50 shadow-sm'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Shadow Type */}
          <div class="flex gap-3">
            <button
              onClick={() => updateAppearance('shadowType', 'brutalist')}
              class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all duration-200 ${
                customization.appearance.shadowType === 'brutalist'
                  ? 'bg-orange-200 text-black shadow-md scale-105'
                  : 'bg-white text-black hover:bg-orange-50'
              }`}
            >
              Hard Shadow
            </button>
            <button
              onClick={() => updateAppearance('shadowType', 'diffused')}
              class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all duration-200 ${
                customization.appearance.shadowType === 'diffused'
                  ? 'bg-orange-200 text-black shadow-md scale-105'
                  : 'bg-white text-black hover:bg-orange-50'
              }`}
            >
              Soft Shadow
            </button>
          </div>
        </div>
      </div>
      
      {/* SURPRISE ME SECTION */}
      <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
        <button
          onClick={surpriseMe}
          class="w-full bg-gradient-to-r from-yellow-300 to-orange-400 border-4 border-black rounded-2xl px-6 py-4 text-lg font-black hover:from-yellow-400 hover:to-orange-500 active:scale-95 transition-all duration-150 shadow-lg hover:shadow-xl"
          style={{ 
            boxShadow: '6px 6px 0px #000000',
            transform: 'translateY(-2px)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)'
            e.currentTarget.style.boxShadow = '2px 2px 0px #000000'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '6px 6px 0px #000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '6px 6px 0px #000000'
          }}
        >
          Surprise Me!
        </button>
      </div>
      
    </div>
  )
}