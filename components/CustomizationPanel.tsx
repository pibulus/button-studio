import { ButtonCustomization, sliderConfig, buttonThemes, ButtonTheme } from '../types/customization.ts'
import { signal } from '@preact/signals'
import { useEffect } from 'preact/hooks'

interface CustomizationPanelProps {
  customization: ButtonCustomization
  onChange: (customization: ButtonCustomization) => void
  voiceEnabled?: boolean
  onVoiceToggle?: (enabled: boolean) => void
  mode: 'master' | 'advanced'
}

// Collapsible panel state - Updated for consolidated panels (5 total)
const expandedPanels = signal<Record<string, boolean>>({
  shape: true,
  effects: false,
  buttonfeel: false,        // Merged: Interactions + Juice
  'voice-recording': false, // Merged: Voice Magic + Recording Behavior  
  export: false
})

export default function CustomizationPanel({ customization, onChange, voiceEnabled = false, onVoiceToggle, mode }: CustomizationPanelProps) {
  
  const updateAppearance = (key: keyof ButtonCustomization['appearance'], value: number | string) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        [key]: value
      }
    })
  }
  
  const updateInteraction = (key: keyof ButtonCustomization['interactions'], value: string | number) => {
    onChange({
      ...customization,
      interactions: {
        ...customization.interactions,
        [key]: value
      }
    })
  }
  
  const updateEffect = (key: keyof ButtonCustomization['effects'], value: boolean) => {
    let newEffects = { ...customization.effects }
    
    if (value && (key === 'breathing' || key === 'bounce' || key === 'wiggle')) {
      // Movement effects - turn off the others when enabling one
      newEffects.breathing = key === 'breathing'
      newEffects.bounce = key === 'bounce'
      newEffects.wiggle = key === 'wiggle'
    } else if (value && (key === 'glow' || key === 'rainbowGlow')) {
      // Visual border effects - turn off the other when enabling one
      newEffects.glow = key === 'glow'
      newEffects.rainbowGlow = key === 'rainbowGlow'
    } else {
      // Non-conflicting effects (pulse can work with anything)
      newEffects[key] = value
    }
    
    onChange({
      ...customization,
      effects: newEffects
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
  
  const updateRecording = (key: keyof ButtonCustomization['recording'], value: string | number | boolean) => {
    onChange({
      ...customization,
      recording: {
        ...customization.recording,
        [key]: value
      }
    })
  }
  
  const togglePanel = (panelId: string) => {
    expandedPanels.value = {
      ...expandedPanels.value,
      [panelId]: !expandedPanels.value[panelId]
    }
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
  
  // CURATED Surprise Me! - Only tasteful combinations
  const surpriseMe = () => {
    const funTexts = ['Boop me!', 'Press here', 'Tap me', 'Hello!', 'Pop!', 'Click!', 'Go!', 'Try me!']
    const randomText = funTexts[Math.floor(Math.random() * funTexts.length)]
    
    // Smart shape selection - prefer rounded for most cases
    const shapes = ['rounded', 'rounded', 'square', 'circle'] // Weighted toward rounded
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)] as 'circle' | 'rounded' | 'square'
    
    // Tasteful effects - avoid rainbow on circles, limit to one movement effect
    const movementEffects = ['breathing', 'bounce', 'wiggle']
    const randomMovement = movementEffects[Math.floor(Math.random() * movementEffects.length)]
    const shouldUseGlow = Math.random() > 0.7
    const shouldUseRainbow = Math.random() > 0.85 && randomShape !== 'circle'
    
    // Create tasteful customization
    const newCustomization = {
      ...customization,
      content: {
        ...customization.content,
        value: randomText
      },
      appearance: {
        ...customization.appearance,
        fillType: Math.random() > 0.3 ? 'gradient' : 'solid' as 'gradient' | 'solid', // Prefer gradients
        solidColor: succulentColors[Math.floor(Math.random() * succulentColors.length)],
        shape: randomShape,
        scale: 0.8 + Math.random() * 0.6, // Constrained size range (0.8-1.4x)
        roundness: Math.random() * 25, // Less extreme roundness
        borderWidth: Math.floor(Math.random() * 5) + 2, // 2-7px (avoid 0 and extreme)
        shadowType: Math.random() > 0.4 ? 'brutalist' : 'diffused' as 'brutalist' | 'diffused', // Prefer brutalist
        borderStyle: ['solid', 'solid', 'solid', 'dashed'][Math.floor(Math.random() * 4)] as any, // Mostly solid
        gradient: {
          ...customization.appearance.gradient,
          start: succulentColors[Math.floor(Math.random() * succulentColors.length)],
          end: succulentColors[Math.floor(Math.random() * succulentColors.length)]
        }
      },
      interactions: {
        hoverEffect: 'lift', // Always use lift - it's reliable
        clickAnimation: 'bounce', // Always use bounce - it's satisfying
        textTransform: ['none', 'none', 'uppercase'][Math.floor(Math.random() * 3)] as any, // Mostly none
        fontWeight: ['bold', 'bold', 'normal'][Math.floor(Math.random() * 3)] as any, // Prefer bold
        
        // Tasteful juice settings
        squishPower: Math.floor(Math.random() * 6) + 4,     // 4-10% (subtle)
        bounceFactor: Math.floor(Math.random() * 4) + 3,    // 3-7% (subtle)
        hoverLift: Math.floor(Math.random() * 3) + 1,       // 1-4px (subtle)
        animationSpeed: 0.8 + Math.random() * 0.4,         // 0.8x-1.2x (constrained)
        easingStyle: ['smooth', 'bouncy'][Math.floor(Math.random() * 2)] as any // No snappy
      },
      effects: {
        [randomMovement]: true, // Only one movement effect
        breathing: randomMovement === 'breathing',
        bounce: randomMovement === 'bounce',
        wiggle: randomMovement === 'wiggle',
        glow: shouldUseGlow && !shouldUseRainbow, // Don't mix glow and rainbow
        rainbowGlow: shouldUseRainbow,
        pulse: Math.random() > 0.8 // Rare
      }
    }
    
    // Apply all changes at once
    onChange(newCustomization)
  }
  
  // Generate button code
  const generateCode = () => {
    const config = customization
    return `<button class="button-custom" style="{
  background: ${config.appearance.fillType === 'solid' 
    ? config.appearance.solidColor 
    : `linear-gradient(${config.appearance.gradient.direction}deg, ${config.appearance.gradient.start}, ${config.appearance.gradient.end})`};
  border: 4px ${config.appearance.borderStyle} #000000;
  border-radius: ${config.appearance.shape === 'circle' ? '50%' : config.appearance.roundness + 'px'};
  transform: scale(${config.appearance.scale});
  box-shadow: ${config.appearance.shadowType === 'brutalist' ? '8px 8px 0px #000000' : '0 8px 25px rgba(0,0,0,0.15)'};
  font-weight: ${config.interactions.fontWeight};
  text-transform: ${config.interactions.textTransform};
  padding: 20px 32px;
  color: #000000;
  cursor: pointer;
  transition: all 0.12s ease;
}">${config.content.value}</button>`
  }
  
  // Listen for surprise me event from dice button (useEffect to avoid duplicate listeners)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('surpriseMe', surpriseMe)
      return () => {
        document.removeEventListener('surpriseMe', surpriseMe)
      }
    }
  }, [])
  
  // Collapsible Panel Component
  const CollapsiblePanel = ({ id, title, children, color = 'light' }: { id: string, title: string, children: any, color?: string }) => {
    const isExpanded = expandedPanels.value[id]
    
    // 🌈 LUSH PASTEL GRADIENT - Each panel gets distinct warm color (VISIBLE!)
    const getBackgroundColor = (colorKey: string) => {
      const colors = {
        lightest: 'bg-red-200 hover:bg-red-300',        // Shape & Fill
        light: 'bg-orange-200 hover:bg-orange-300',     // Not used
        medium: 'bg-pink-200 hover:bg-pink-300',        // Visible coral
        warm: 'bg-yellow-200 hover:bg-yellow-300',      // Voice & Recording (merged)
        cool: 'bg-blue-200 hover:bg-blue-300',          // Button Feel (merged interactions + juice)
        deep: 'bg-purple-200 hover:bg-purple-300',      // Export Code
        effects: 'bg-green-200 hover:bg-green-300',     // Effects
        recording: 'bg-blue-200 hover:bg-blue-300',     // Legacy - not used
        juice: 'bg-orange-300 hover:bg-orange-400'      // Legacy - not used
      }
      return colors[colorKey as keyof typeof colors] || colors.light
    }
    
    // 🎨 THEME BUTTON COLORS - Each panel's buttons match its theme
    const getButtonColors = (colorKey: string, isSelected: boolean) => {
      const themes = {
        lightest: {
          selected: 'bg-rose-200 hover:bg-rose-300 border-rose-400',
          unselected: 'bg-white hover:bg-rose-50 border-rose-200'
        },
        light: {
          selected: 'bg-orange-200 hover:bg-orange-300 border-orange-400', 
          unselected: 'bg-white hover:bg-orange-50 border-orange-200'
        },
        medium: {
          selected: 'bg-pink-200 hover:bg-pink-300 border-pink-400',
          unselected: 'bg-white hover:bg-pink-50 border-pink-200'  
        },
        warm: {
          selected: 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400',
          unselected: 'bg-white hover:bg-yellow-50 border-yellow-200'
        },
        cool: {
          selected: 'bg-blue-200 hover:bg-blue-300 border-blue-400',
          unselected: 'bg-white hover:bg-blue-50 border-blue-200'
        },
        effects: {
          selected: 'bg-green-200 hover:bg-green-300 border-green-400',
          unselected: 'bg-white hover:bg-green-50 border-green-200'
        },
        deep: {
          selected: 'bg-purple-200 hover:bg-purple-300 border-purple-400',
          unselected: 'bg-white hover:bg-purple-50 border-purple-200'
        }
      }
      const theme = themes[colorKey as keyof typeof themes] || themes.light
      return isSelected ? theme.selected : theme.unselected
    }
    
    return (
      <div class="bg-white rounded-3xl shadow-lg border-4 border-black overflow-hidden">
        <button
          onClick={() => togglePanel(id)}
          class={`w-full px-8 py-6 text-left font-black text-black transition-all duration-200 ${getBackgroundColor(color)} shadow-sm hover:shadow-md active:shadow-sm`}
        >
          <div class="flex items-center justify-between">
            <span class="text-xl">{title}</span>
            <span class={`text-2xl transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>
        {isExpanded && (
          <div class="p-8 border-t-4 border-black">
            {children}
          </div>
        )}
      </div>
    )
  }
  
  if (mode === 'master') {
    // MASTER PANEL - Essential controls below button
    return (
      <div class="space-y-6">
        
        {/* 🍊 LUSH JUICE ANIMATIONS + EFFECTS */}
        <style jsx>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes bounce-demo {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          
          @keyframes glow-demo {
            0%, 100% { 
              box-shadow: 2px 2px 0px #000000, 0 0 8px rgba(34, 197, 94, 0.3);
            }
            50% { 
              box-shadow: 2px 2px 0px #000000, 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4);
            }
          }
          
          @keyframes wiggle-demo {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-2deg); }
            75% { transform: rotate(2deg); }
          }
          
          @keyframes rainbow-rotate {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          
          .effect-breathe {
            animation: breathe 3s ease-in-out infinite;
          }
          
          .effect-bounce {
            animation: bounce-demo 1.5s ease-in-out infinite;
          }
          
          .effect-glow {
            animation: glow-demo 2s ease-in-out infinite;
          }
          
          .effect-wiggle {
            animation: wiggle-demo 2s ease-in-out infinite;
          }
          
          .rainbow-border {
            background: linear-gradient(
              90deg,
              #ff6b9d,
              #a855f7,
              #3b82f6,
              #10b981,
              #ff6b9d,
              #a855f7,
              #3b82f6,
              #10b981
            );
            background-size: 200% 100%;
            animation: rainbow-rotate 3s linear infinite;
            padding: 3px;
            border-radius: 1rem;
          }
          
          .rainbow-content {
            background: white;
            border-radius: calc(1rem - 3px);
            width: 100%;
            height: 100%;
          }
        `}</style>
        
        {/* Content Input + Voice Toggle - Enhanced UX */}
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-black">
          <div class="space-y-4">
            <div class="flex items-center gap-6">
              <div class="flex-1 relative">
                <input
                  type="text"
                  value={customization.content.value}
                  onInput={(e) => updateContent((e.target as HTMLInputElement).value)}
                  placeholder="Button text..."
                  maxLength={25}
                  class="w-full px-6 py-4 text-xl font-bold bg-white border-3 border-black rounded-2xl focus:bg-orange-50 focus:shadow-lg hover:bg-pink-50 hover:shadow-md hover:-translate-y-0.5 focus:outline-none transition-all duration-300 text-center"
                />
                {/* Character counter when approaching limit */}
                {customization.content.value.length > 18 && (
                  <div class="absolute -bottom-6 right-2 text-xs font-bold text-gray-500">
                    {customization.content.value.length}/25
                  </div>
                )}
              </div>
              <button
                onClick={() => onVoiceToggle?.(!voiceEnabled)}
                title="🎤 Enable voice transcription and AI processing - converts speech to text automatically"
                class={`w-16 h-10 sm:w-18 sm:h-12 rounded-full border-3 border-black transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:scale-105 touch-manipulation ${
                  voiceEnabled ? 'bg-pink-300 hover:bg-pink-400' : 'bg-orange-200 hover:bg-orange-300'
                }`}
              >
                <div class={`w-7 h-7 bg-white rounded-full border-2 border-black transition-all duration-300 shadow-sm ${
                  voiceEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* 🎨 Colors & Fill Style */}
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-black">
          <div class="space-y-6">
            {/* Fill Type Toggle - Redesigned */}
            <div>
              <h3 class="text-lg font-black text-gray-900 mb-4">Fill Style</h3>
              <div class="flex gap-4">
                <button
                  onClick={() => updateAppearance('fillType', 'solid')}
                  class={`flex-1 px-6 py-4 rounded-2xl border-3 border-black font-black transition-all h-14 shadow-sm hover:shadow-md active:scale-95 ${
                    customization.appearance.fillType === 'solid'
                      ? 'bg-orange-200 hover:bg-orange-300 text-black shadow-md scale-105'
                      : 'bg-white hover:bg-orange-50 text-black'
                  }`}
                  style={{
                    boxShadow: customization.appearance.fillType === 'solid' 
                      ? '3px 3px 0px #000000' 
                      : '2px 2px 0px #000000'
                  }}
                >
                  Solid Color
                </button>
                <button
                  onClick={() => updateAppearance('fillType', 'gradient')}
                  class={`flex-1 px-6 py-4 rounded-2xl border-3 border-black font-black transition-all h-14 shadow-sm hover:shadow-md active:scale-95 ${
                    customization.appearance.fillType === 'gradient'
                      ? 'bg-orange-200 hover:bg-orange-300 text-black shadow-md scale-105'
                      : 'bg-white hover:bg-orange-50 text-black'
                  }`}
                  style={{
                    boxShadow: customization.appearance.fillType === 'gradient' 
                      ? '3px 3px 0px #000000' 
                      : '2px 2px 0px #000000'
                  }}
                >
                  Gradient
                </button>
              </div>
            </div>
            
            {/* Color Palette - Redesigned */}
            <div>
              <h3 class="text-lg font-black text-gray-900 mb-4">Color Palette</h3>
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
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
                    class="h-12 w-12 rounded-2xl border-3 border-black hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    style={{ 
                      background: color,
                      boxShadow: '2px 2px 0px #000000'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 💪 The Big 3 Sliders - CHONKY & FRIENDLY */}
        <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
          <div class="space-y-10">
            {sliderConfig.map((slider) => {
              const rawValue = customization.appearance[slider.id]
              
              // 🧠 CLEAN VALUE FORMATTING (no more ugly decimals!)
              const formatValue = (val: number, unit: string) => {
                if (unit === 'x') return `${Math.round(val * 10) / 10}${unit}`
                return `${Math.round(val)}${unit}`
              }
              
              const cleanValue = formatValue(rawValue, slider.unit)
              const percentage = ((rawValue - slider.min) / (slider.max - slider.min)) * 100
              
              return (
                <div key={slider.id} class="space-y-4">
                  {/* Header with icon and label */}
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-black text-gray-900">{slider.label}</h3>
                      <p class="text-sm text-gray-600 font-bold">Drag to adjust</p>
                    </div>
                    
                    {/* 🌟 BIG CHONKY VALUE DISPLAY */}
                    <div class="bg-gradient-to-r from-rose-100 to-orange-100 border-4 border-black px-6 py-3 rounded-2xl shadow-lg">
                      <span class="text-2xl font-black text-gray-900 font-mono">{cleanValue}</span>
                    </div>
                  </div>
                  
                  {/* 🎯 MEGA CHONKY SLIDER */}
                  <div class="relative px-2">
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step || 1}
                      value={rawValue}
                      onInput={(e) => updateAppearance(slider.id, parseFloat((e.target as HTMLInputElement).value))}
                      title={`${slider.label}: ${cleanValue}`}
                      class="w-full h-8 bg-white border-4 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-md hover:shadow-lg"
                      style={{
                        background: `linear-gradient(to right, #ff9eb5 0%, #ff9eb5 ${percentage}%, #f8f9fa ${percentage}%, #f8f9fa 100%)`,
                        border: '4px solid #000000'
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]:not(.juice-slider)::-webkit-slider-thumb {
                        appearance: none;
                        height: 40px;
                        width: 40px;
                        border-radius: 20px;
                        background: linear-gradient(135deg, #ff9eb5 0%, #ff6b9d 100%);
                        border: 4px solid #000000;
                        cursor: grab;
                        box-shadow: 0 6px 20px rgba(255, 158, 181, 0.6), 0 2px 8px rgba(0, 0, 0, 0.2);
                        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                      }
                      input[type="range"]:not(.juice-slider)::-webkit-slider-thumb:hover {
                        transform: scale(1.2) translateY(-2px);
                        cursor: grabbing;
                        box-shadow: 0 8px 25px rgba(255, 158, 181, 0.8), 0 4px 12px rgba(0, 0, 0, 0.3);
                        background: linear-gradient(135deg, #ff6b9d 0%, #ff3d71 100%);
                      }
                      input[type="range"]:not(.juice-slider)::-webkit-slider-thumb:active {
                        transform: scale(1.1) translateY(0px);
                        box-shadow: 0 4px 15px rgba(255, 158, 181, 0.9), 0 2px 6px rgba(0, 0, 0, 0.4);
                      }
                    `}</style>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        
        
      </div>
    )
  }
  
  // ADVANCED PANEL - Collapsible sections
  return (
    <div class="space-y-4">
      
      {/* Shape & Style */}
      <CollapsiblePanel id="shape" title="Shape & Style" color="lightest">
        <div class="space-y-4">
          {/* 🔴 Button Shape - Clean Icons */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-red-200 rounded-full border-2 border-black"></span>
              Button Shape
            </h4>
            <div class="grid grid-cols-3 gap-4">
              {[
                { 
                  shape: 'circle', 
                  label: 'Circle',
                  icon: (
                    <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="12" fill="#fbbf24" stroke="#000" stroke-width="2"/>
                      <circle cx="16" cy="16" r="6" fill="#f59e0b" stroke="#000" stroke-width="1.5"/>
                    </svg>
                  )
                },
                { 
                  shape: 'rounded', 
                  label: 'Rounded',
                  icon: (
                    <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none">
                      <rect x="8" y="8" width="16" height="16" rx="6" fill="#fbbf24" stroke="#000" stroke-width="2"/>
                      <rect x="12" y="12" width="8" height="8" rx="2" fill="#f59e0b" stroke="#000" stroke-width="1.5"/>
                    </svg>
                  )
                },
                { 
                  shape: 'square', 
                  label: 'Square',
                  icon: (
                    <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none">
                      <rect x="8" y="8" width="16" height="16" fill="#fbbf24" stroke="#000" stroke-width="2"/>
                      <rect x="12" y="12" width="8" height="8" fill="#f59e0b" stroke="#000" stroke-width="1.5"/>
                    </svg>
                  )
                }
              ].map(({ shape, label, icon }) => (
                <button
                  key={shape}
                  onClick={() => updateAppearance('shape', shape)}
                  class={`px-6 py-6 rounded-2xl border-3 border-black font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1 flex flex-col items-center justify-center gap-2 ${
                    customization.appearance.shape === shape
                      ? 'bg-red-200 text-black shadow-xl scale-105 -translate-y-1'
                      : 'bg-white text-black hover:bg-red-50'
                  }`}
                  style={{
                    boxShadow: customization.appearance.shape === shape 
                      ? '4px 6px 0px #000000, 0 8px 25px rgba(239, 68, 68, 0.2)' 
                      : '2px 3px 0px #000000',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <div class="group-hover:scale-110 transition-transform duration-200">{icon}</div>
                  <span class="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 🎨 Border Style - Clean Minimal Icons */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-red-200 rounded-full border-2 border-black"></span>
              Border Style
            </h4>
            <div class="grid grid-cols-2 gap-4">
              {[
                { 
                  value: 'solid', 
                  label: 'Solid',
                  preview: (
                    <svg class="w-10 h-4" viewBox="0 0 40 16" fill="none">
                      <line x1="6" y1="8" x2="34" y2="8" stroke="#374151" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  )
                },
                { 
                  value: 'dashed', 
                  label: 'Dashed',
                  preview: (
                    <svg class="w-10 h-4" viewBox="0 0 40 16" fill="none">
                      <line x1="6" y1="8" x2="34" y2="8" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 2"/>
                    </svg>
                  )
                },
                { 
                  value: 'dotted', 
                  label: 'Dotted',
                  preview: (
                    <svg class="w-10 h-4" viewBox="0 0 40 16" fill="none">
                      <line x1="6" y1="8" x2="34" y2="8" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 3"/>
                    </svg>
                  )
                },
                { 
                  value: 'double', 
                  label: 'Double',
                  preview: (
                    <svg class="w-10 h-4" viewBox="0 0 40 16" fill="none">
                      <line x1="6" y1="6" x2="34" y2="6" stroke="#374151" stroke-width="1.5" stroke-linecap="round"/>
                      <line x1="6" y1="10" x2="34" y2="10" stroke="#374151" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  )
                }
              ].map(({ value, label, preview }) => (
                <button
                  key={value}
                  onClick={() => updateAppearance('borderStyle', value)}
                  class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1 flex flex-col items-center justify-center gap-3 ${
                    customization.appearance.borderStyle === value
                      ? 'bg-red-200 text-black shadow-xl scale-105 -translate-y-1'
                      : 'bg-white text-black hover:bg-red-50'
                  }`}
                  style={{
                    boxShadow: customization.appearance.borderStyle === value 
                      ? '4px 6px 0px #000000, 0 8px 25px rgba(239, 68, 68, 0.2)' 
                      : '2px 3px 0px #000000',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <div class="group-hover:scale-110 transition-transform duration-200">{preview}</div>
                  <span class="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsiblePanel>
      
      {/* Effects & Animations - SELF-DEMONSTRATING! ✨ */}
      <CollapsiblePanel id="effects" title="Effects" color="effects">
        <div class="space-y-6">
          
          {/* Effects - Clean grid */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-green-200 rounded-full border-2 border-black"></span>
              Effects
            </h4>
            <div class="grid grid-cols-3 gap-4">
              {[
                { key: 'breathing', label: 'Breathe', demoClass: 'effect-breathe' },
                { key: 'bounce', label: 'Bounce', demoClass: 'effect-bounce' },
                { key: 'wiggle', label: 'Wiggle', demoClass: 'effect-wiggle' },
                { key: 'glow', label: 'Glow', demoClass: '' },  // No demo class - handled via inline styles
                { key: 'pulse', label: 'Pulse', demoClass: 'effect-pulse' }
              ].map(({ key, label, demoClass }) => {
                const isActive = customization.effects[key as keyof ButtonCustomization['effects']]
                return (
                  <button
                    key={key}
                    onClick={() => updateEffect(key as keyof ButtonCustomization['effects'], !isActive)}
                    class={`px-6 py-4 rounded-2xl border-3 border-black font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center ${
                      isActive
                        ? 'bg-green-200 text-black shadow-xl scale-105 -translate-y-1'
                        : `bg-white text-black hover:bg-green-50 ${key === 'glow' ? 'hover:shadow-2xl' : demoClass}`
                    }`}
                    style={{
                      boxShadow: isActive 
                        ? '4px 6px 0px #000000, 0 8px 25px rgba(34, 197, 94, 0.2)' 
                        : '2px 3px 0px #000000',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <span class="text-sm">{label}</span>
                  </button>
                )
              })}
              
              {/* Rainbow Border - 6th effect */}
              {customization.effects.rainbowGlow ? (
                <button
                  onClick={() => updateEffect('rainbowGlow', false)}
                  class="px-6 py-4 rounded-2xl border-3 border-black font-black transition-all duration-300 ease-out shadow-xl scale-105 -translate-y-1 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 hover:from-pink-300 hover:via-purple-300 hover:to-blue-300 text-black flex items-center justify-center"
                  style={{
                    boxShadow: '4px 6px 0px #000000, 0 8px 25px rgba(168, 85, 247, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <span class="text-sm">Rainbow</span>
                </button>
              ) : (
                <div class="rainbow-border">
                  <button
                    onClick={() => updateEffect('rainbowGlow', true)}
                    class="rainbow-content px-6 py-4 border-3 border-black font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1 bg-white text-black hover:bg-green-50 flex items-center justify-center w-full h-full"
                    style={{
                      boxShadow: '2px 3px 0px #000000',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <span class="text-sm">Rainbow</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 🎭 Shadow Type */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-green-200 rounded-full border-2 border-black"></span>
              Shadow Style
            </h4>
            <div class="flex gap-4">
              <button
                onClick={() => updateAppearance('shadowType', 'brutalist')}
                class={`flex-1 px-6 py-4 rounded-2xl border-3 border-black font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1 ${
                  customization.appearance.shadowType === 'brutalist'
                    ? 'bg-green-200 text-black shadow-xl scale-105 -translate-y-1'
                    : 'bg-white text-black hover:bg-green-50'
                }`}
                style={{
                  boxShadow: customization.appearance.shadowType === 'brutalist' 
                    ? '4px 6px 0px #000000, 0 8px 25px rgba(34, 197, 94, 0.2)' 
                    : '2px 3px 0px #000000',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                Hard Shadow
              </button>
              <button
                onClick={() => updateAppearance('shadowType', 'diffused')}
                class={`flex-1 px-6 py-4 rounded-2xl border-3 border-black font-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 hover:-translate-y-1 ${
                  customization.appearance.shadowType === 'diffused'
                    ? 'bg-green-200 text-black shadow-xl scale-105 -translate-y-1'
                    : 'bg-white text-black hover:bg-green-50'
                }`}
                style={{
                  boxShadow: customization.appearance.shadowType === 'diffused' 
                    ? '4px 6px 0px #000000, 0 8px 25px rgba(34, 197, 94, 0.2)' 
                    : '2px 3px 0px #000000',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                Soft Shadow
              </button>
            </div>
          </div>
          
        </div>
      </CollapsiblePanel>
      
      {/* Button Feel - Merged Interactions + Juice */}
      <CollapsiblePanel id="buttonfeel" title="Button Feel" color="cool">
        <div class="space-y-6">
          
          {/* Hover Effects */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-200 rounded-full border-2 border-black"></span>
              Hover Effects
            </h4>
            <div class="grid grid-cols-2 gap-3">
              {[
                { value: 'none', label: 'None' },
                { value: 'lift', label: 'Lift' },
                { value: 'glow', label: 'Glow' },
                { value: 'pulse', label: 'Pulse' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateInteraction('hoverEffect', value)}
                  class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                    customization.interactions.hoverEffect === value
                      ? 'bg-blue-200 hover:bg-blue-300 text-black shadow-md scale-105'
                      : 'bg-white hover:bg-blue-50 text-black'
                  }`}
                  style={{
                    boxShadow: customization.interactions.hoverEffect === value 
                      ? '3px 3px 0px #000000' 
                      : '2px 2px 0px #000000'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Text Style */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-200 rounded-full border-2 border-black"></span>
              Text Style
            </h4>
            <div class="grid grid-cols-2 gap-3">
              {[
                { value: 'normal', label: 'Normal', type: 'weight' },
                { value: 'bold', label: 'Bold', type: 'weight' },
                { value: 'uppercase', label: 'CAPS', type: 'transform' },
                { value: 'lowercase', label: 'lower', type: 'transform' }
              ].map(({ value, label, type }) => (
                <button
                  key={value}
                  onClick={() => {
                    if (type === 'weight') {
                      updateInteraction('fontWeight', value)
                    } else {
                      updateInteraction('textTransform', value)
                    }
                  }}
                  class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                    (customization.interactions.fontWeight === value || customization.interactions.textTransform === value)
                      ? 'bg-blue-200 hover:bg-blue-300 text-black shadow-md scale-105'
                      : 'bg-white hover:bg-blue-50 text-black'
                  }`}
                  style={{
                    boxShadow: (customization.interactions.fontWeight === value || customization.interactions.textTransform === value) 
                      ? '3px 3px 0px #000000' 
                      : '2px 2px 0px #000000'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Animation Controls */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-blue-200 rounded-full border-2 border-black"></span>
              Animation Controls
            </h4>
            
            {/* Squish */}
            <div class="space-y-4 mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-black text-gray-900">Squish</h3>
                  <p class="text-xs text-gray-600 font-bold">Press compression</p>
                </div>
                <div class="bg-gradient-to-r from-blue-100 to-blue-200 border-3 border-black px-4 py-2 rounded-xl shadow-md">
                  <span class="text-lg font-black text-gray-900 font-mono">{customization.interactions.squishPower}%</span>
                </div>
              </div>
              <div class="relative px-2">
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={customization.interactions.squishPower}
                  onInput={(e) => updateInteraction('squishPower', parseInt((e.target as HTMLInputElement).value))}
                  title={`Squish: ${customization.interactions.squishPower}%`}
                  class="juice-slider w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #67e8f9 0%, #67e8f9 ${((customization.interactions.squishPower - 3) / (15 - 3)) * 100}%, #f8f9fa ${((customization.interactions.squishPower - 3) / (15 - 3)) * 100}%, #f8f9fa 100%)`,
                    border: '3px solid #000000'
                  }}
                />
              </div>
            </div>
            
            {/* Bounce */}
            <div class="space-y-4 mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-black text-gray-900">Bounce</h3>
                  <p class="text-xs text-gray-600 font-bold">Release overshoot</p>
                </div>
                <div class="bg-gradient-to-r from-blue-100 to-blue-200 border-3 border-black px-4 py-2 rounded-xl shadow-md">
                  <span class="text-lg font-black text-gray-900 font-mono">{customization.interactions.bounceFactor}%</span>
                </div>
              </div>
              <div class="relative px-2">
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={customization.interactions.bounceFactor}
                  onInput={(e) => updateInteraction('bounceFactor', parseInt((e.target as HTMLInputElement).value))}
                  title={`Bounce: ${customization.interactions.bounceFactor}%`}
                  class="juice-slider w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #67e8f9 0%, #67e8f9 ${((customization.interactions.bounceFactor - 2) / (10 - 2)) * 100}%, #f8f9fa ${((customization.interactions.bounceFactor - 2) / (10 - 2)) * 100}%, #f8f9fa 100%)`,
                    border: '3px solid #000000'
                  }}
                />
              </div>
            </div>
            
            {/* Speed */}
            <div class="space-y-4 mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-black text-gray-900">Speed</h3>
                  <p class="text-xs text-gray-600 font-bold">Animation timing</p>
                </div>
                <div class="bg-gradient-to-r from-blue-100 to-blue-200 border-3 border-black px-4 py-2 rounded-xl shadow-md">
                  <span class="text-lg font-black text-gray-900 font-mono">{customization.interactions.animationSpeed.toFixed(1)}x</span>
                </div>
              </div>
              <div class="relative px-2">
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={customization.interactions.animationSpeed}
                  onInput={(e) => updateInteraction('animationSpeed', parseFloat((e.target as HTMLInputElement).value))}
                  title={`Speed: ${customization.interactions.animationSpeed.toFixed(1)}x`}
                  class="juice-slider w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing transition-all shadow-sm hover:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #67e8f9 0%, #67e8f9 ${((customization.interactions.animationSpeed - 0.7) / (1.5 - 0.7)) * 100}%, #f8f9fa ${((customization.interactions.animationSpeed - 0.7) / (1.5 - 0.7)) * 100}%, #f8f9fa 100%)`,
                    border: '3px solid #000000'
                  }}
                />
              </div>
            </div>
            
            {/* Feel */}
            <div>
              <h4 class="text-md font-black text-gray-900 mb-3">Easing Style</h4>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { value: 'smooth', label: 'Smooth' },
                  { value: 'bouncy', label: 'Bouncy' },
                  { value: 'snappy', label: 'Snappy' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateInteraction('easingStyle', value)}
                    class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                      customization.interactions.easingStyle === value
                        ? 'bg-blue-200 hover:bg-blue-300 text-black shadow-md scale-105'
                        : 'bg-white hover:bg-blue-50 text-black'
                    }`}
                    style={{
                      boxShadow: customization.interactions.easingStyle === value 
                        ? '3px 3px 0px #000000'
                        : '2px 2px 0px #000000'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Juice slider specific styling */}
        <style jsx>{`
          .juice-slider::-webkit-slider-thumb {
            appearance: none;
            height: 32px;
            width: 32px;
            border-radius: 16px;
            background: linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%);
            border: 3px solid #000000;
            cursor: grab;
            box-shadow: 0 4px 12px rgba(103, 232, 249, 0.5), 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .juice-slider::-webkit-slider-thumb:hover {
            transform: scale(1.15) translateY(-1px);
            cursor: grabbing;
            box-shadow: 0 6px 16px rgba(103, 232, 249, 0.7), 0 3px 8px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          }
          .juice-slider::-webkit-slider-thumb:active {
            transform: scale(1.05) translateY(0px);
            box-shadow: 0 3px 10px rgba(103, 232, 249, 0.8), 0 2px 5px rgba(0, 0, 0, 0.4);
          }
        `}</style>
      </CollapsiblePanel>
      
      {/* Voice & Recording - Consolidated Panel */}
      <CollapsiblePanel id="voice-recording" title="Voice & Recording" color="warm">
        <div class="space-y-6">
          
          {/* API Configuration Section */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-yellow-200 rounded-full border-2 border-black"></span>
              Voice Magic Setup
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-black text-black mb-2">API Key</label>
                <input
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  class="w-full px-4 py-3 bg-white border-3 border-black rounded-xl focus:bg-yellow-50 focus:outline-none transition-all font-mono text-sm shadow-sm focus:shadow-md"
                />
              </div>
              <div>
                <label class="block text-sm font-black text-black mb-2">Custom Prompt</label>
                <textarea
                  placeholder="Custom instructions (e.g., 'Translate to Spanish', 'Format as bullets')"
                  class="w-full px-4 py-3 bg-white border-3 border-black rounded-xl focus:bg-yellow-50 focus:outline-none transition-all h-20 resize-none text-sm shadow-sm focus:shadow-md"
                />
              </div>
              
              {/* ✨ SURPRISE PROMPT EXAMPLES */}
              <div>
                <label class="block text-sm font-black text-black mb-3">✨ Quick Prompts</label>
                <div class="grid grid-cols-2 gap-2">
                  {[
                    { emoji: '🌐', text: 'Translate', prompt: 'Translate to Spanish' },
                    { emoji: '🔥', text: 'Spice Up', prompt: 'Make this sound more exciting and energetic' },
                    { emoji: '📝', text: 'Bullets', prompt: 'Format as bullet points' },
                    { emoji: '🎭', text: 'Dramatic', prompt: 'Rewrite in a dramatic, theatrical style' },
                    { emoji: '🤖', text: 'Tech', prompt: 'Convert to technical documentation' },
                    { emoji: '✨', text: 'Surprise!', prompt: 'surprise' }
                  ].map(({ emoji, text, prompt }) => (
                    <button
                      key={text}
                      onClick={() => {
                        const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                        if (textarea) {
                          if (prompt === 'surprise') {
                            const surprisePrompts = [
                              'Turn this into a pirate shanty',
                              'Explain like I\'m a golden retriever',
                              'Write as a noir detective story',
                              'Convert to emoji-only communication',
                              'Make it sound like a cooking recipe',
                              'Transform into a haiku'
                            ]
                            textarea.value = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]
                          } else {
                            textarea.value = prompt
                          }
                          textarea.focus()
                        }
                      }}
                      class="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-amber-50 transition-all text-xs font-black shadow-sm hover:shadow-md active:scale-95"
                      style={{
                        boxShadow: '1px 1px 0px #000000'
                      }}
                    >
                      <span>{emoji}</span>
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div class="text-xs text-gray-600">
                💡 Get your free key at <a href="https://aistudio.google.com/apikey" target="_blank" class="text-blue-600 underline">aistudio.google.com/apikey</a>
              </div>
            </div>
          </div>
          
          {/* Recording Behavior Section */}
          <div>
            <h4 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-yellow-200 rounded-full border-2 border-black"></span>
              Recording Behavior
            </h4>
            
            {/* Visual Feedback Style */}
            <div class="mb-6">
              <h5 class="text-md font-black text-gray-800 mb-3">Visual Feedback</h5>
              <div class="grid grid-cols-2 gap-3">
                {[
                  { value: 'timer', label: 'Timer', icon: '⏱️' },
                  { value: 'pulse', label: 'Pulse', icon: '💓' },
                  { value: 'glow', label: 'Glow', icon: '✨' },
                  { value: 'ring', label: 'Ring', icon: '⭕' }
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => updateRecording('visualFeedback', value)}
                    class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 ${
                      customization.recording.visualFeedback === value
                        ? 'bg-yellow-200 hover:bg-yellow-300 text-black shadow-md scale-105'
                        : 'bg-white hover:bg-yellow-50 text-black'
                    }`}
                    style={{
                      boxShadow: customization.recording.visualFeedback === value 
                        ? '3px 3px 0px #000000' 
                        : '2px 2px 0px #000000'
                    }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Keep Size Toggle */}
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 mb-6">
              <div>
                <h5 class="font-black text-gray-900">Prevent Layout Shift</h5>
                <p class="text-sm text-gray-600">Keep button size consistent during recording</p>
              </div>
              <button
                onClick={() => updateRecording('keepSize', !customization.recording.keepSize)}
                class={`w-14 h-8 rounded-full border-3 border-black transition-all ${
                  customization.recording.keepSize ? 'bg-green-400' : 'bg-gray-300'
                }`}
                style={{
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                <div
                  class={`w-6 h-6 bg-white border-2 border-black rounded-full transition-transform ${
                    customization.recording.keepSize ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            {/* Pulse Intensity (if pulse selected) */}
            {customization.recording.visualFeedback === 'pulse' && (
              <div>
                <h5 class="text-md font-black text-gray-800 mb-4">Pulse Intensity</h5>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-gray-700">Intensity</span>
                    <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-3 border-black px-4 py-2 rounded-xl">
                      <span class="text-lg font-black text-gray-900">{customization.recording.pulseIntensity}%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={customization.recording.pulseIntensity}
                    onInput={(e) => updateRecording('pulseIntensity', parseInt((e.target as HTMLInputElement).value))}
                    class="w-full h-6 bg-white border-3 border-black rounded-full appearance-none cursor-grab hover:cursor-grabbing"
                    style={{
                      background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${customization.recording.pulseIntensity}%, #f8f9fa ${customization.recording.pulseIntensity}%, #f8f9fa 100%)`
                    }}
                  />
                </div>
              </div>
            )}
            
          </div>
          
        </div>
      </CollapsiblePanel>
      
      {/* Export Code */}
      <CollapsiblePanel id="export" title="Export Code" color="deep">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-black text-black mb-2">Button HTML & CSS</label>
            <textarea
              value={generateCode()}
              readonly
              class="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-mono text-xs h-32 resize-none"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generateCode())
              // Could add a toast notification here
            }}
            class="w-full bg-white border-3 border-black rounded-xl px-4 py-3 font-black hover:bg-purple-50 transition-all h-12 shadow-sm hover:shadow-md active:scale-95"
            style={{
              boxShadow: '2px 2px 0px #000000'
            }}
          >
            📋 Copy Code
          </button>
        </div>
      </CollapsiblePanel>
      
    </div>
  )
}