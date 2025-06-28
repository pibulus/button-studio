import { ButtonCustomization, sliderConfig, buttonThemes, ButtonTheme } from '../types/customization.ts'
import { signal } from '@preact/signals'

interface CustomizationPanelProps {
  customization: ButtonCustomization
  onChange: (customization: ButtonCustomization) => void
  voiceEnabled?: boolean
  onVoiceToggle?: (enabled: boolean) => void
  mode: 'master' | 'advanced'
}

// Collapsible panel state
const expandedPanels = signal<Record<string, boolean>>({
  shape: true,
  effects: false,
  interactions: false,
  api: false,
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
  
  const updateInteraction = (key: keyof ButtonCustomization['interactions'], value: string) => {
    onChange({
      ...customization,
      interactions: {
        ...customization.interactions,
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
  
  // FIXED Surprise Me! - Actually randomizes the button
  const surpriseMe = () => {
    const randomTexts = ['Boop me!', 'Zap!', 'Press here', 'Voice magic', 'Tap me', 'Hello!', 'Record me', 'Speak now', 'Pop!', 'Click!', 'Touch me', 'Go!']
    const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)]
    
    // Create complete new customization object
    const newCustomization = {
      ...customization,
      content: {
        ...customization.content,
        value: randomText
      },
      appearance: {
        ...customization.appearance,
        fillType: Math.random() > 0.5 ? 'gradient' : 'solid' as 'gradient' | 'solid',
        solidColor: succulentColors[Math.floor(Math.random() * succulentColors.length)],
        shape: ['circle', 'rounded', 'square'][Math.floor(Math.random() * 3)] as 'circle' | 'rounded' | 'square',
        scale: 0.7 + Math.random() * 0.8,
        roundness: Math.random() * 30,
        glowIntensity: Math.random() * 15,
        shadowType: Math.random() > 0.5 ? 'brutalist' : 'diffused' as 'brutalist' | 'diffused',
        borderStyle: ['solid', 'dashed', 'dotted', 'double'][Math.floor(Math.random() * 4)] as 'solid' | 'dashed' | 'dotted' | 'double',
        gradient: {
          ...customization.appearance.gradient,
          start: succulentColors[Math.floor(Math.random() * succulentColors.length)],
          end: succulentColors[Math.floor(Math.random() * succulentColors.length)]
        }
      },
      interactions: {
        hoverEffect: ['none', 'lift', 'glow', 'pulse', 'rotate'][Math.floor(Math.random() * 5)] as any,
        clickAnimation: ['none', 'bounce', 'shrink', 'spin', 'flash'][Math.floor(Math.random() * 5)] as any,
        textTransform: ['none', 'uppercase', 'lowercase', 'capitalize'][Math.floor(Math.random() * 4)] as any,
        fontWeight: ['normal', 'bold', 'light'][Math.floor(Math.random() * 3)] as any
      },
      effects: {
        breathing: Math.random() > 0.5,
        bounce: Math.random() > 0.7,
        glow: Math.random() > 0.6,
        wiggle: Math.random() > 0.8
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
  
  // Listen for surprise me event from dice button
  if (typeof document !== 'undefined') {
    document.addEventListener('surpriseMe', surpriseMe)
  }
  
  // Collapsible Panel Component
  const CollapsiblePanel = ({ id, title, children, color = 'light' }: { id: string, title: string, children: any, color?: string }) => {
    const isExpanded = expandedPanels.value[id]
    
    // 🌈 LUSH PASTEL GRADIENT - Each panel gets distinct warm color (VISIBLE!)
    const getBackgroundColor = (colorKey: string) => {
      const colors = {
        lightest: 'bg-red-200 hover:bg-red-300',        // Visible pink
        light: 'bg-orange-200 hover:bg-orange-300',     // Visible peach  
        medium: 'bg-pink-200 hover:bg-pink-300',        // Visible coral
        warm: 'bg-yellow-200 hover:bg-yellow-300',      // Visible golden
        deep: 'bg-purple-200 hover:bg-purple-300',      // Visible lavender
        effects: 'bg-green-200 hover:bg-green-300'      // Special green for effects
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
          selected: 'bg-amber-200 hover:bg-amber-300 border-amber-400',
          unselected: 'bg-white hover:bg-amber-50 border-amber-200'
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
        
        {/* Content Input + Voice Toggle - CHONKY */}
        <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
          <div class="flex items-center gap-6">
            <input
              type="text"
              value={customization.content.value}
              onInput={(e) => updateContent((e.target as HTMLInputElement).value)}
              placeholder="Button text..."
              class="flex-1 px-6 py-4 text-xl font-bold bg-white border-3 border-black rounded-2xl focus:bg-yellow-50 focus:outline-none transition-all text-center"
            />
            <button
              onClick={() => onVoiceToggle?.(!voiceEnabled)}
              title="Toggle voice transcription"
              class={`w-16 h-10 rounded-full border-3 border-black transition-all duration-200 flex items-center shadow-md ${
                voiceEnabled ? 'bg-pink-300' : 'bg-white'
              }`}
            >
              <div class={`w-7 h-7 bg-white rounded-full border-2 border-black transition-all duration-200 ${
                voiceEnabled ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        
        {/* 🎨 Colors & Fill Style */}
        <div class="bg-white rounded-3xl p-8 shadow-lg border-4 border-black">
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
              <div class="grid grid-cols-6 gap-3">
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
                      input[type="range"]::-webkit-slider-thumb {
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
                      input[type="range"]::-webkit-slider-thumb:hover {
                        transform: scale(1.2) translateY(-2px);
                        cursor: grabbing;
                        box-shadow: 0 8px 25px rgba(255, 158, 181, 0.8), 0 4px 12px rgba(0, 0, 0, 0.3);
                        background: linear-gradient(135deg, #ff6b9d 0%, #ff3d71 100%);
                      }
                      input[type="range"]::-webkit-slider-thumb:active {
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
                class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                  customization.appearance.shape === shape
                    ? 'bg-rose-200 hover:bg-rose-300 text-black shadow-md scale-105'
                    : 'bg-white hover:bg-rose-50 text-black'
                }`}
                style={{
                  boxShadow: customization.appearance.shape === shape 
                    ? '3px 3px 0px #000000' 
                    : '2px 2px 0px #000000'
                }}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Border Style */}
          <div class="grid grid-cols-2 gap-3">
            {[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
              { value: 'double', label: 'Double' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateAppearance('borderStyle', value)}
                class={`px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                  customization.appearance.borderStyle === value
                    ? 'bg-rose-200 text-black shadow-md scale-105'
                    : 'bg-white text-black hover:bg-rose-50'
                }`}
                style={{
                  boxShadow: customization.appearance.borderStyle === value 
                    ? '3px 3px 0px #000000' 
                    : '2px 2px 0px #000000'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CollapsiblePanel>
      
      {/* Effects & Animations */}
      <CollapsiblePanel id="effects" title="Effects & Animations" color="effects">
        <div class="space-y-4">
          {/* Animation Effects */}
          <div class="grid grid-cols-2 gap-3">
            {[
              { key: 'breathing', label: 'Breathe' },
              { key: 'bounce', label: 'Bounce' },
              { key: 'glow', label: 'Glow' },
              { key: 'wiggle', label: 'Wiggle' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateEffect(key as keyof ButtonCustomization['effects'], !customization.effects[key as keyof ButtonCustomization['effects']])}
                class={`p-4 rounded-xl border-3 border-black transition-all font-black h-12 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 ${
                  customization.effects[key as keyof ButtonCustomization['effects']]
                    ? 'bg-orange-200 hover:bg-orange-300 text-black shadow-md scale-105' 
                    : 'bg-white hover:bg-orange-50 text-black'
                }`}
                style={{
                  boxShadow: customization.effects[key as keyof ButtonCustomization['effects']] 
                    ? '3px 3px 0px #000000' 
                    : '2px 2px 0px #000000'
                }}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Shadow Type */}
          <div class="flex gap-3">
            <button
              onClick={() => updateAppearance('shadowType', 'brutalist')}
              class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                customization.appearance.shadowType === 'brutalist'
                  ? 'bg-orange-200 hover:bg-orange-300 text-black shadow-md scale-105'
                  : 'bg-white hover:bg-orange-50 text-black'
              }`}
              style={{
                boxShadow: customization.appearance.shadowType === 'brutalist' 
                  ? '3px 3px 0px #000000' 
                  : '2px 2px 0px #000000'
              }}
            >
              Hard Shadow
            </button>
            <button
              onClick={() => updateAppearance('shadowType', 'diffused')}
              class={`flex-1 px-4 py-3 rounded-xl border-3 border-black font-black transition-all h-12 shadow-sm hover:shadow-md active:scale-95 ${
                customization.appearance.shadowType === 'diffused'
                  ? 'bg-orange-200 hover:bg-orange-300 text-black shadow-md scale-105'
                  : 'bg-white hover:bg-orange-50 text-black'
              }`}
              style={{
                boxShadow: customization.appearance.shadowType === 'diffused' 
                  ? '3px 3px 0px #000000' 
                  : '2px 2px 0px #000000'
              }}
            >
              Soft Shadow
            </button>
          </div>
        </div>
      </CollapsiblePanel>
      
      {/* Interactions */}
      <CollapsiblePanel id="interactions" title="Interactions" color="medium">
        <div class="space-y-4">
          {/* Hover Effects */}
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
                    ? 'bg-pink-200 hover:bg-pink-300 text-black shadow-md scale-105'
                    : 'bg-white hover:bg-pink-50 text-black'
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
          
          {/* Text Style */}
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
                    ? 'bg-pink-200 hover:bg-pink-300 text-black shadow-md scale-105'
                    : 'bg-white hover:bg-pink-50 text-black'
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
      </CollapsiblePanel>
      
      {/* Voice Magic */}
      <CollapsiblePanel id="api" title="Voice Magic" color="warm">
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