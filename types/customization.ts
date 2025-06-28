// ButtonStudio Customization Types
// Professional warm aesthetics with advanced Tailwind integration

export type ButtonTheme = 'minimal' | 'warm' | 'professional' | 'lush'

export interface ButtonCustomization {
  // Visual Properties
  appearance: {
    theme: ButtonTheme
    radius: number        // 0-50px (rounded-full = 9999)
    scale: number         // 0.5-2.0x multiplier
    elevation: number     // 0-32px shadow depth
    saturation: number    // 0-100% color intensity
    gradient: {
      start: string       // Hex color for gradient start
      end: string         // Hex color for gradient end
      direction: number   // 0-360 degrees
    }
  }
  
  // Content Properties  
  content: {
    type: 'emoji' | 'text' | 'icon'
    value: string
    label?: string        // Optional descriptive label
  }
  
  // Interaction Properties
  feedback: {
    haptic: boolean
    sound: boolean
    animation: 'subtle' | 'playful' | 'professional'
  }
  
  // Voice Properties (preserve existing)
  voice: {
    enabled: boolean
    autoTranscribe: boolean
    clipboardCopy: boolean
    showWaveform: boolean
  }
}

export interface ThemeDefinition {
  name: string
  icon: string
  description: string
  colors: {
    background: string
    text: string
    border: string
    shadow: string
  }
}

export interface SliderDefinition {
  id: keyof ButtonCustomization['appearance']
  label: string
  icon: string
  min: number
  max: number
  step?: number
  unit: string
  property: string
  preview: (value: number) => string
}

// Default customization (Satisfying rectangular button)
export const defaultCustomization: ButtonCustomization = {
  appearance: {
    theme: 'warm',
    radius: 16,
    scale: 1.0, 
    elevation: 8,
    saturation: 85,
    gradient: {
      start: '#fbb6ce',  // Softer pink
      end: '#f9ca9a',    // Softer peach
      direction: 135     // Diagonal
    }
  },
  content: {
    type: 'text',
    value: 'Push Me',
    label: 'Voice Button'
  },
  feedback: {
    haptic: true,
    sound: true,
    animation: 'playful'
  },
  voice: {
    enabled: true,
    autoTranscribe: true,
    clipboardCopy: true,
    showWaveform: true
  }
}

// Button themes (Pablo's style with gradients)
export const buttonThemes: Record<ButtonTheme, ThemeDefinition> = {
  minimal: {
    name: 'Clean',
    icon: '⚪',
    description: 'Simple & elegant',
    colors: {
      background: 'bg-gray-100 hover:bg-gray-200',
      text: 'text-gray-800',
      border: 'border-2 border-gray-300',
      shadow: 'shadow-lg hover:shadow-xl'
    }
  },
  
  warm: {
    name: 'Warm',
    icon: '🧡', 
    description: 'Cozy gradients',
    colors: {
      background: '',
      text: 'text-white',
      border: 'border-0',
      shadow: 'shadow-lg hover:shadow-xl'
    }
  },
  
  professional: {
    name: 'Pro',
    icon: '💼',
    description: 'Business ready', 
    colors: {
      background: '',
      text: 'text-white',
      border: 'border-0',
      shadow: 'shadow-lg hover:shadow-xl'
    }
  },
  
  lush: {
    name: 'Lush',
    icon: '✨',
    description: 'Rich & vibrant',
    colors: {
      background: '',
      text: 'text-white',
      border: 'border-0',
      shadow: 'shadow-xl hover:shadow-2xl'
    }
  }
}

// Slider configurations
export const sliderConfig: SliderDefinition[] = [
  {
    id: 'radius',
    label: 'Roundness',
    icon: '⬜',
    min: 0,
    max: 50,
    unit: 'px',
    property: '--button-radius',
    preview: (value) => `rounded-[${value}px]`
  },
  {
    id: 'scale', 
    label: 'Size',
    icon: '🔍',
    min: 0.5,
    max: 2.0,
    step: 0.1,
    unit: 'x',
    property: '--button-scale',
    preview: (value) => `scale-[${value}]`
  },
  {
    id: 'elevation',
    label: 'Shadow',
    icon: '🏔️',
    min: 0,
    max: 32,
    unit: 'px',
    property: '--button-elevation',
    preview: (value) => `shadow-[0_${value}px_${value*2}px_rgba(0,0,0,0.1)]`
  },
  {
    id: 'saturation',
    label: 'Vibrancy', 
    icon: '🎨',
    min: 0,
    max: 100,
    unit: '%',
    property: '--button-saturation',
    preview: (value) => `saturate-[${value}%]`
  }
]

// Utility functions
export function generateButtonStyles(customization: ButtonCustomization): Record<string, string> {
  const { gradient } = customization.appearance
  
  return {
    // CSS custom properties for real-time updates
    '--button-radius': `${customization.appearance.radius}px`,
    '--button-scale': customization.appearance.scale.toString(),
    '--button-elevation': `${customization.appearance.elevation}px`,
    '--button-saturation': `${customization.appearance.saturation}%`,
    
    // Computed values
    '--shadow-blur': `${customization.appearance.elevation * 2}px`,
    '--shadow-spread': `${customization.appearance.elevation * 0.5}px`,
    
    // Pablo's gradient background
    background: `linear-gradient(${gradient.direction}deg, ${gradient.start}, ${gradient.end})`,
    
    // Pablo's thick border
    borderColor: '#000000',
    borderWidth: '4px'
  }
}

export function generateButtonClasses(customization: ButtonCustomization): string {
  const theme = buttonThemes[customization.appearance.theme]
  
  const dynamicClasses = [
    'rounded-[var(--button-radius)]',
    'scale-[var(--button-scale)]',
    'saturate-[var(--button-saturation)]'
  ]
  
  return [
    // Base classes
    'inline-flex items-center justify-center font-black focus:outline-none',
    'transition-all duration-100 ease-out',
    'border-4 border-black',  // Brutalist thick borders
    
    // Typography - chonky and cute
    'text-2xl tracking-tight',
    
    // Theme classes
    'text-black',  // Always black text for contrast
    
    // Dynamic classes
    ...dynamicClasses
  ].join(' ')
}