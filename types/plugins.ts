import { AudioBlob, TranscriptionResult } from './core.ts'

// Plugin Base Interface
export interface Plugin {
  readonly id: string
  readonly name: string  
  readonly version: string
  readonly description: string
}

// Transcription Plugin Interface
export interface TranscriptionPlugin extends Plugin {
  configure(config: TranscriptionConfig): Promise<void>
  validateConfig(config: unknown): config is TranscriptionConfig
  transcribe(audio: AudioBlob): Promise<TranscriptionResult>
  
  // Optional capabilities
  getLanguages?(): Promise<Language[]>
  estimateCost?(audio: AudioBlob): Promise<number>
}

export interface TranscriptionConfig {
  apiKey?: string
  model?: string
  language?: string
  [key: string]: unknown
}

export interface Language {
  code: string
  name: string
  nativeName?: string
}

// Output Plugin Interface  
export interface OutputPlugin extends Plugin {
  configure(config: OutputConfig): Promise<void>
  validateConfig(config: unknown): config is OutputConfig
  send(data: OutputData): Promise<OutputResult>
  
  // Optional capabilities
  testConnection?(): Promise<boolean>
  formatPreview?(data: OutputData): Promise<string>
}

export interface OutputConfig {
  [key: string]: unknown
}

export interface OutputData {
  transcription: TranscriptionResult
  audio?: AudioBlob
  timestamp: Date
  sessionId: string
  metadata?: Record<string, unknown>
}

export interface OutputResult {
  success: boolean
  id?: string
  url?: string
  error?: string
  metadata?: Record<string, unknown>
}

// Theme Plugin Interface
export interface ThemePlugin extends Plugin {
  readonly styles: ThemeStyles
  readonly animations: AnimationConfig
  readonly customCSS?: string
  
  // Optional features
  getVariants?(): ThemeVariant[]
  customize?(overrides: Partial<ThemeStyles>): ThemePlugin
}

export interface ThemeStyles {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    error: string
    success: string
  }
  
  typography: {
    fontFamily: string
    fontSize: {
      small: string
      medium: string
      large: string
    }
    fontWeight: {
      normal: string
      medium: string
      bold: string
    }
  }
  
  layout: {
    borderRadius: string
    spacing: {
      small: string
      medium: string
      large: string
    }
    shadows: {
      small: string
      medium: string
      large: string
    }
  }
}

export interface AnimationConfig {
  duration: 'fast' | 'medium' | 'slow'
  easing: 'ease-in' | 'ease-out' | 'ease-in-out'
  hover: 'subtle' | 'glow' | 'breathe'
}

export interface ThemeVariant {
  id: string
  name: string
  preview: string
}