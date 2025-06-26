import { signal } from '@preact/signals'
import VoiceButton from "../components/VoiceButton.tsx";
import ToastContainer, { toast } from "../components/Toast.tsx";
import EmojiPicker from "../components/EmojiPicker.tsx";

// Simple live design state - just the essentials!
// Complete button configuration state
const buttonConfig = signal({
  content: {
    text: '🎤',
    autoScale: true
  },
  size: {
    width: 120,
    height: 120,
    maintainRatio: true
  },
  shape: {
    type: 'square' as 'circle' | 'square' | 'rectangle',
    borderRadius: 12
  },
  appearance: {
    fill: {
      type: 'gradient' as 'solid' | 'gradient',
      solid: '#FF8FA3',
      gradient: {
        type: 'linear' as 'linear' | 'radial',
        colors: ['#FF8FA3', '#FFB8CC'],
        direction: 45
      }
    },
    border: {
      width: 4,
      color: '#4A4A4A',
      style: 'solid' as 'solid' | 'dashed' | 'dotted'
    },
    shadow: {
      type: 'glow' as 'none' | 'soft' | 'hard' | 'glow',
      color: '#FF6B9D',
      blur: 20,
      spread: 0,
      x: 0,
      y: 0
    }
  }
})

const showAdvanced = signal<boolean>(false) // progressive disclosure

// Color-rich randomization presets with millions of combinations
const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 40) // 60-100%
  const lightness = 45 + Math.floor(Math.random() * 20) // 45-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const generateRandomGradient = () => ({
  type: Math.random() > 0.7 ? 'radial' : 'linear' as 'linear' | 'radial',
  colors: [generateRandomColor(), generateRandomColor()],
  direction: Math.floor(Math.random() * 360)
})

const beautifulPresets = [
  // Playful Unicorn
  { 
    name: 'Playful Unicorn',
    content: { text: '🦄', autoScale: true },
    shape: { type: 'circle' as const, borderRadius: 50 },
    size: { width: 140, height: 140 },
    appearance: {
      fill: { type: 'gradient' as const, gradient: { type: 'radial' as const, colors: ['#FF6B9D', '#9D4EDD'], direction: 0 }},
      border: { width: 3, color: '#FFFFFF', style: 'solid' as const },
      shadow: { type: 'glow' as const, color: '#FF6B9D', blur: 25, spread: 0, x: 0, y: 0 }
    }
  },
  // Corporate Professional
  { 
    name: 'Corporate Pro',
    content: { text: 'REC', autoScale: true },
    shape: { type: 'rectangle' as const, borderRadius: 8 },
    size: { width: 120, height: 80 },
    appearance: {
      fill: { type: 'gradient' as const, gradient: { type: 'linear' as const, colors: ['#4A90E2', '#2C3E50'], direction: 135 }},
      border: { width: 2, color: '#34495E', style: 'solid' as const },
      shadow: { type: 'soft' as const, color: '#000000', blur: 15, spread: 0, x: 0, y: 4 }
    }
  },
  // Gaming Beast
  { 
    name: 'Gaming Beast',
    content: { text: '⚡', autoScale: true },
    shape: { type: 'square' as const, borderRadius: 15 },
    size: { width: 160, height: 160 },
    appearance: {
      fill: { type: 'gradient' as const, gradient: { type: 'linear' as const, colors: ['#00F5FF', '#8A2BE2'], direction: 45 }},
      border: { width: 6, color: '#FFD700', style: 'solid' as const },
      shadow: { type: 'glow' as const, color: '#00F5FF', blur: 30, spread: 5, x: 0, y: 0 }
    }
  },
  // Zen Minimal
  { 
    name: 'Zen Minimal',
    content: { text: '●', autoScale: true },
    shape: { type: 'circle' as const, borderRadius: 50 },
    size: { width: 100, height: 100 },
    appearance: {
      fill: { type: 'solid' as const, solid: '#2C3E50' },
      border: { width: 1, color: '#34495E', style: 'solid' as const },
      shadow: { type: 'soft' as const, color: '#000000', blur: 10, spread: 0, x: 0, y: 2 }
    }
  },
  // Retro Boom
  { 
    name: 'Retro Boom',
    content: { text: '📢', autoScale: true },
    shape: { type: 'rectangle' as const, borderRadius: 20 },
    size: { width: 150, height: 100 },
    appearance: {
      fill: { type: 'gradient' as const, gradient: { type: 'linear' as const, colors: ['#FF6B35', '#F7931E'], direction: 90 }},
      border: { width: 5, color: '#D2691E', style: 'solid' as const },
      shadow: { type: 'hard' as const, color: '#8B4513', blur: 0, spread: 0, x: 8, y: 8 }
    }
  },
  // Magic Sparkle
  { 
    name: 'Magic Sparkle',
    content: { text: '✨', autoScale: true },
    shape: { type: 'square' as const, borderRadius: 25 },
    size: { width: 130, height: 130 },
    appearance: {
      fill: { type: 'gradient' as const, gradient: { type: 'radial' as const, colors: ['#FFD700', '#DA70D6'], direction: 0 }},
      border: { width: 4, color: '#FFFFFF', style: 'solid' as const },
      shadow: { type: 'glow' as const, color: '#FFD700', blur: 35, spread: 0, x: 0, y: 0 }
    }
  }
]

export default function VoiceButtonStudio() {
  
  // Advanced randomization - millions of combinations!
  function surpriseMe() {
    const usePreset = Math.random() < 0.4 // 40% chance to use preset, 60% fully random
    
    if (usePreset) {
      // Use beautiful preset
      const randomPreset = beautifulPresets[Math.floor(Math.random() * beautifulPresets.length)]
      buttonConfig.value = { ...randomPreset }
      toast.success(`${randomPreset.name}! 🎲`)
    } else {
      // Generate completely random design
      const randomEmojis = ['🎤', '🎧', '🔊', '📢', '⚡', '✨', '🔥', '💎', '🌟', '🚀', '💖', '🦄', '🎵', '🎯', '💫']
      const randomShapes = ['circle', 'square', 'rectangle'] as const
      const randomShape = randomShapes[Math.floor(Math.random() * randomShapes.length)]
      
      buttonConfig.value = {
        content: {
          text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)],
          autoScale: true
        },
        size: {
          width: 80 + Math.floor(Math.random() * 120), // 80-200px
          height: 80 + Math.floor(Math.random() * 120),
          maintainRatio: randomShape === 'circle'
        },
        shape: {
          type: randomShape,
          borderRadius: randomShape === 'circle' ? 50 : Math.floor(Math.random() * 30)
        },
        appearance: {
          fill: {
            type: Math.random() > 0.3 ? 'gradient' : 'solid',
            solid: generateRandomColor(),
            gradient: generateRandomGradient()
          },
          border: {
            width: 1 + Math.floor(Math.random() * 8), // 1-8px
            color: generateRandomColor(),
            style: 'solid'
          },
          shadow: {
            type: ['none', 'soft', 'glow', 'hard'][Math.floor(Math.random() * 4)] as any,
            color: generateRandomColor(),
            blur: Math.floor(Math.random() * 40), // 0-40px
            spread: Math.floor(Math.random() * 10), // 0-10px
            x: -10 + Math.floor(Math.random() * 20), // -10 to 10px
            y: -10 + Math.floor(Math.random() * 20)
          }
        }
      }
      
      toast.success('Random Magic! ✨')
    }
  }

  // Copy button code to clipboard
  function copyButtonCode() {
    const code = `<VoiceButton 
  buttonConfig={${JSON.stringify(buttonConfig.value, null, 2)}}
  enableHaptics={true}
  showTimer={true}
  showWaveform={true}
  onComplete={(result) => {
    console.log('Transcription:', result.text)
  }}
/>`
    
    navigator.clipboard.writeText(code)
    toast.success('Magic copied to your spellbook! ✨')
  }

  return (
    <div class="w-full">
      <ToastContainer />
      
      {/* Preview Section - Hero Style */}
      <section class="mb-12">
        <div class="bg-soft-paper rounded-3xl shadow-soft-card p-12 text-center border border-soft-mist/30">
          <div class="inline-flex items-center gap-3 mb-6">
            <span class="text-2xl">👁️</span>
            <h2 class="text-3xl font-black text-soft-charcoal">
              Your Button
            </h2>
          </div>
          
          <p class="text-soft-slate font-medium mb-8 text-lg">
            Looking good! This is your voice button in all its glory ✨
          </p>
          
          {/* Hero Button Preview */}
          <div class="flex justify-center mb-12">
            <div class="relative">
              <VoiceButton 
                buttonConfig={buttonConfig.value}
                enableHaptics={true}
                showTimer={true}
                showWaveform={true}
                onComplete={(result) => {
                  console.log('🎉 Studio transcription:', result.text)
                }}
              />
              {/* Ambient glow behind button */}
              <div class="absolute inset-0 bg-gradient-to-r from-soft-peach/20 to-soft-coral/20 rounded-full blur-xl -z-10 scale-150"></div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button 
              onClick={surpriseMe}
              class="flex-1 bg-gradient-to-r from-soft-peach to-soft-coral text-white font-bold px-8 py-4 rounded-2xl shadow-button-surprise hover:shadow-chonky-hover hover:scale-[1.02] transition-all duration-200 text-lg"
            >
              🎲 Roll the vibe dice
            </button>
            
            <button 
              onClick={copyButtonCode}
              class="flex-1 bg-gradient-to-r from-soft-sunset to-soft-mint text-soft-charcoal font-bold px-8 py-4 rounded-2xl shadow-button-primary hover:shadow-chonky-hover hover:scale-[1.02] transition-all duration-200 text-lg"
            >
              📋 Copy that magic
            </button>
          </div>
        </div>
      </section>

      {/* Control Panels Section */}
      <section class="space-y-8">
        
        {/* Content Panel */}
        <div class="bg-soft-paper rounded-3xl shadow-soft-card p-8 border border-soft-mist/30">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-2xl">🎨</span>
            <div>
              <h3 class="text-2xl font-black text-soft-charcoal">Pick Your Vibe</h3>
              <p class="text-soft-slate font-medium">What's your button saying to the world?</p>
            </div>
          </div>
          
          <div class="max-w-sm">
            <EmojiPicker 
              value={buttonConfig.value.content.text}
              onChange={(value) => {
                buttonConfig.value = {
                  ...buttonConfig.value,
                  content: { ...buttonConfig.value.content, text: value }
                }
              }}
              placeholder="🎤"
            />
          </div>
        </div>

        {/* Shape & Size Panel */}
        <div class="bg-soft-paper rounded-3xl shadow-soft-card p-8 border border-soft-mist/30">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-2xl">🔘</span>
            <div>
              <h3 class="text-2xl font-black text-soft-charcoal">Shape & Size</h3>
              <p class="text-soft-slate font-medium">Give your button a cozy silhouette</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shape Selector */}
            <div>
              <h4 class="font-bold text-soft-charcoal mb-4 text-lg">Shape</h4>
              <div class="grid grid-cols-3 gap-3">
                {(['circle', 'square', 'rectangle'] as const).map(shape => (
                  <button
                    key={shape}
                    onClick={() => {
                      buttonConfig.value = {
                        ...buttonConfig.value,
                        shape: { 
                          ...buttonConfig.value.shape, 
                          type: shape,
                          borderRadius: shape === 'circle' ? 50 : (shape === 'rectangle' ? 8 : 12)
                        },
                        size: {
                          ...buttonConfig.value.size,
                          maintainRatio: shape === 'circle'
                        }
                      }
                    }}
                    class={`p-4 rounded-2xl font-bold capitalize text-lg transition-all border-2 hover:scale-[1.02] ${
                      buttonConfig.value.shape.type === shape 
                        ? 'border-soft-glow bg-soft-glow/10 text-soft-glow shadow-soft-glow' 
                        : 'border-soft-mist bg-white text-soft-slate hover:border-soft-peach'
                    }`}
                  >
                    {shape === 'circle' ? '●' : shape === 'square' ? '■' : '▬'} {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <h4 class="font-bold text-soft-charcoal mb-4 text-lg">Size</h4>
              <div class="grid grid-cols-2 gap-3">
                {[
                  { size: 100, label: 'Cute', emoji: '🐣' },
                  { size: 140, label: 'Perfect', emoji: '✨' },
                  { size: 180, label: 'Bold', emoji: '💪' },
                  { size: 220, label: 'Hero', emoji: '🦸' }
                ].map(({ size, label, emoji }) => (
                  <button
                    key={size}
                    onClick={() => {
                      buttonConfig.value = {
                        ...buttonConfig.value,
                        size: { ...buttonConfig.value.size, width: size, height: size }
                      }
                    }}
                    class={`p-4 rounded-2xl font-bold text-lg transition-all border-2 hover:scale-[1.02] ${
                      Math.abs(buttonConfig.value.size.width - size) < 20
                        ? 'border-soft-glow bg-soft-glow/10 text-soft-glow shadow-soft-glow' 
                        : 'border-soft-mist bg-white text-soft-slate hover:border-soft-peach'
                    }`}
                  >
                    {emoji} {label}
                    <div class="text-sm text-soft-quiet mt-1">{size}px</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Panel (Collapsible) */}
        <div class="bg-soft-paper rounded-3xl shadow-soft-card border border-soft-mist/30 overflow-hidden">
          <button
            onClick={() => showAdvanced.value = !showAdvanced.value}
            class="w-full p-8 text-left hover:bg-soft-mist/20 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">⚡</span>
                <div>
                  <h3 class="text-2xl font-black text-soft-charcoal">Fine Tuning</h3>
                  <p class="text-soft-slate font-medium">Get nerdy with the details</p>
                </div>
              </div>
              <span class={`text-2xl transition-transform ${showAdvanced.value ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          </button>

          {showAdvanced.value && (
            <div class="px-8 pb-8 border-t border-soft-mist/30 animate-slide-down">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                
                <div>
                  <SliderControl
                    label="Roundness"
                    value={buttonConfig.value.shape.borderRadius}
                    min={0}
                    max={50}
                    onChange={(value) => {
                      buttonConfig.value = {
                        ...buttonConfig.value,
                        shape: { ...buttonConfig.value.shape, borderRadius: value }
                      }
                    }}
                    unit="px"
                  />
                </div>
                
                <div>
                  <SliderControl
                    label="Border Width"
                    value={buttonConfig.value.appearance.border.width}
                    min={0}
                    max={12}
                    onChange={(value) => {
                      buttonConfig.value = {
                        ...buttonConfig.value,
                        appearance: { 
                          ...buttonConfig.value.appearance, 
                          border: { ...buttonConfig.value.appearance.border, width: value }
                        }
                      }
                    }}
                    unit="px"
                  />
                </div>

                <div>
                  <SliderControl
                    label="Glow Intensity"
                    value={buttonConfig.value.appearance.shadow.blur}
                    min={0}
                    max={50}
                    onChange={(value) => {
                      buttonConfig.value = {
                        ...buttonConfig.value,
                        appearance: { 
                          ...buttonConfig.value.appearance, 
                          shadow: { ...buttonConfig.value.appearance.shadow, blur: value }
                        }
                      }
                    }}
                    unit="px"
                  />
                </div>
                
              </div>
              
              <div class="text-center mt-8 p-4 bg-soft-mist/30 rounded-2xl">
                <p class="text-soft-quiet font-medium">
                  🚧 Color gradients, patterns & animations coming soon! 🚧
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


// Soft Stack Slider Control Component
function SliderControl({ label, value, min, max, step = 1, onChange, unit = '' }: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  unit?: string
}) {
  return (
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <label class="font-bold text-soft-charcoal text-lg">{label}</label>
        <span class="text-soft-glow font-black text-xl bg-soft-glow/10 px-3 py-1 rounded-xl">
          {value}{unit}
        </span>
      </div>
      <div class="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
          class="w-full h-4 bg-soft-mist rounded-xl appearance-none cursor-pointer slider-soft focus:outline-none"
          style="background: linear-gradient(to right, #ff6b9d 0%, #ff6b9d calc(var(--value) * 1%), #f8f4f0 calc(var(--value) * 1%), #f8f4f0 100%); --value: var(--value, 50);"
        />
      </div>
    </div>
  )
}