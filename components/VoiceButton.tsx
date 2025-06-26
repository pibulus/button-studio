import { signal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { AudioRecorder, AudioAnalyzer, copyToClipboard, triggerHapticFeedback, HapticPatterns } from '../utils/audio.ts'
import { ButtonState, VoiceButtonError, ThemeId, ButtonSize } from '../types/core.ts'
import { TranscriptionPlugin, OutputPlugin } from '../types/plugins.ts'
import { toast } from './Toast.tsx'

// Signals for global state management (like Pablo's reactive Svelte stores)
const buttonState = signal<ButtonState>('idle')
const transcript = signal<string>('')
const errorMessage = signal<string>('')
const isClipboardSuccess = signal<boolean>(false)
const recordingDuration = signal<number>(0)

interface VoiceButtonProps {
  // Core functionality
  transcriptionPlugin?: TranscriptionPlugin
  outputPlugin?: OutputPlugin
  
  // Appearance
  theme?: ThemeId
  size?: ButtonSize
  customCSS?: string
  
  // Studio customization props (legacy support)
  customSize?: string
  squishiness?: string
  chonkiness?: string
  glowIntensity?: number
  customText?: string
  buttonShape?: 'circle' | 'square' | 'rectangle'
  
  // New comprehensive config
  buttonConfig?: {
    content: { text: string, autoScale: boolean }
    size: { width: number, height: number, maintainRatio?: boolean }
    shape: { type: 'circle' | 'square' | 'rectangle', borderRadius: number }
    appearance: {
      fill: {
        type: 'solid' | 'gradient'
        solid: string
        gradient: {
          type: 'linear' | 'radial'
          colors: [string, string]
          direction: number
        }
      }
      border: { width: number, color: string, style: 'solid' | 'dashed' | 'dotted' }
      shadow: {
        type: 'none' | 'soft' | 'hard' | 'glow'
        color: string
        blur: number
        spread: number
        x: number
        y: number
      }
    }
  }
  
  // Behavior
  autoStart?: boolean
  maxDuration?: number
  enableHaptics?: boolean
  enableSounds?: boolean
  showTimer?: boolean
  showWaveform?: boolean
  
  // Event callbacks (like Pablo's onComplete pattern)
  onComplete?: (result: { text: string, confidence: number }) => void
  onError?: (error: VoiceButtonError) => void
  onStateChange?: (state: ButtonState) => void
}

export default function VoiceButton({
  theme = 'amber',
  size = 'large',
  customSize,
  squishiness,
  chonkiness, 
  customText,
  buttonShape = 'square',
  buttonConfig,
  enableHaptics = true,
  showTimer = true,
  showWaveform = true,
  maxDuration = 300, // 5 minutes like Pablo's setup
  onComplete,
  onError,
  onStateChange,
  ...props
}: VoiceButtonProps) {
  
  const recorderRef = useRef<AudioRecorder>()
  const analyzerRef = useRef<AudioAnalyzer>()
  const timerRef = useRef<number>()
  
  // Initialize audio recorder (like Pablo's mediaRecorder setup)
  useEffect(() => {
    recorderRef.current = new AudioRecorder()
    analyzerRef.current = new AudioAnalyzer()
    
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      analyzerRef.current?.disconnect()
    }
  }, [])

  // Watch state changes and trigger callbacks
  useEffect(() => {
    onStateChange?.(buttonState.value)
  }, [buttonState.value])

  // Auto-clipboard copy (Pablo's brilliant UX pattern)
  useEffect(() => {
    if (transcript.value) {
      copyToClipboard(transcript.value).then(success => {
        isClipboardSuccess.value = success
        if (success) {
          toast.success('Voice magic copied! 🎤✨')
        } else {
          toast.error('Oops, clipboard magic failed!')
        }
      })
    }
  }, [transcript.value])

  async function startRecording() {
    try {
      errorMessage.value = ''
      transcript.value = ''
      isClipboardSuccess.value = false
      recordingDuration.value = 0
      
      buttonState.value = 'requesting'
      
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStart)
      }
      
      const recorder = recorderRef.current!
      const analyzer = analyzerRef.current!
      
      // Start recording (using Pablo's proven MediaRecorder logic)
      await recorder.startRecording()
      
      buttonState.value = 'recording'
      
      // Connect audio analyzer for waveform
      if (showWaveform) {
        const stream = recorder.getStream()
        if (stream) {
          await analyzer.connectToStream(stream)
        }
      }
      
      // Start timer (like Pablo's countSec system)
      timerRef.current = setInterval(() => {
        recordingDuration.value += 1
        
        // Auto-stop at max duration
        if (recordingDuration.value >= maxDuration) {
          stopRecording()
        }
        
        // Haptic pulse every 5 seconds during long recordings
        if (enableHaptics && recordingDuration.value % 5 === 0) {
          triggerHapticFeedback([30])
        }
      }, 1000)
      
      console.log('✅ Recording started successfully')
      
    } catch (error) {
      console.error('❌ Recording start failed:', error)
      buttonState.value = 'error'
      
      if (error instanceof VoiceButtonError) {
        errorMessage.value = error.message
        onError?.(error)
      } else {
        const voiceError = new VoiceButtonError('Failed to start recording', 'RECORDING_FAILED' as any)
        errorMessage.value = voiceError.message
        onError?.(voiceError)
      }
      
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.error)
      }
    }
  }

  async function stopRecording() {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = undefined
      }
      
      analyzerRef.current?.disconnect()
      
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStop)
      }
      
      buttonState.value = 'processing'
      
      const recorder = recorderRef.current!
      const audioBlob = await recorder.stopRecording()
      
      console.log('🤖 Starting Gemini transcription...')
      
      // Use real Gemini transcription with hardcoded API key
      const { GeminiTranscriptionPlugin } = await import('../plugins/transcription/gemini.ts')
      const geminiPlugin = new GeminiTranscriptionPlugin()
      
      // Configure and transcribe
      await geminiPlugin.configure({ apiKey: 'hardcoded' }) // API key is hardcoded in plugin
      const result = await geminiPlugin.transcribe(audioBlob)
      transcript.value = result.text
      
      buttonState.value = 'success'
      
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.success)
      }
      
      // Trigger success callback (like Pablo's onComplete pattern)
      onComplete?.({ 
        text: transcript.value, 
        confidence: 0.95 
      })
      
      // Auto-return to idle after success celebration
      setTimeout(() => {
        if (buttonState.value === 'success') {
          buttonState.value = 'idle'
        }
      }, 2000)
      
      console.log('✅ Transcription completed')
      
    } catch (error) {
      console.error('❌ Recording stop/transcription failed:', error)
      buttonState.value = 'error'
      
      if (error instanceof VoiceButtonError) {
        errorMessage.value = error.message
        onError?.(error)
      } else {
        const voiceError = new VoiceButtonError('Failed to process recording', 'TRANSCRIPTION_FAILED' as any)
        errorMessage.value = voiceError.message
        onError?.(voiceError)
      }
      
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.error)
      }
    }
  }

  function toggleRecording() {
    if (buttonState.value === 'recording') {
      stopRecording()
    } else if (buttonState.value === 'idle' || buttonState.value === 'error') {
      startRecording()
    }
  }

  function resetToIdle() {
    if (buttonState.value === 'error' || buttonState.value === 'success') {
      buttonState.value = 'idle'
      errorMessage.value = ''
      transcript.value = ''
      recordingDuration.value = 0
    }
  }

  // Dynamic button text (like Pablo's computed buttonLabel)
  function getButtonText(): string {
    switch (buttonState.value) {
      case 'idle':
        return 'Ready'
      case 'requesting':
        return 'Requesting Permission...'
      case 'recording':
        return 'Recording'
      case 'processing':
        return 'Transcribing...'
      case 'success':
        return 'Success!'
      case 'error':
        return 'Try Again'
      default:
        return 'Ready'
    }
  }

  // Format timer (like Pablo's covertSecToMinAndHour)
  function formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const sec = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`
    return `${minutes}:${sec}`
  }

  // Enhanced Theme Classes with comprehensive customization!
  const getThemeClasses = () => {
    const baseClasses = 'relative overflow-hidden transition-all duration-300 ease-out focus:outline-none font-chunky tracking-chunky'
    
    // Use new config if available, otherwise fall back to legacy props
    const config = buttonConfig || {
      content: { text: customText || '🎤', autoScale: true },
      size: { width: customSize ? parseInt(customSize) : 120, height: customSize ? parseInt(customSize) : 120 },
      shape: { type: buttonShape, borderRadius: parseInt(squishiness || '12') },
      appearance: {
        fill: { type: 'solid' as const, solid: '#FF8FA3', gradient: { type: 'linear' as const, colors: ['#FF8FA3', '#FFB8CC'], direction: 45 }},
        border: { width: parseInt(chonkiness || '4'), color: '#4A4A4A', style: 'solid' as const },
        shadow: { type: 'glow' as const, color: '#FF6B9D', blur: 20, spread: 0, x: 0, y: 0 }
      }
    }
    
    // Dynamic sizing with auto-scaling text
    const sizeStyle = `width: ${config.size.width}px; height: ${config.size.height}px;`
    
    // Calculate font size based on button size (auto-scaling)
    const fontSize = config.content.autoScale ? Math.max(12, Math.min(48, config.size.width * 0.25)) : 20
    const fontSizeStyle = `font-size: ${fontSize}px;`
    
    // Shape and border radius
    let borderRadiusStyle = ''
    if (config.shape.type === 'circle') {
      borderRadiusStyle = 'border-radius: 50%;'
    } else {
      borderRadiusStyle = `border-radius: ${config.shape.borderRadius}px;`
    }
    
    // Background fill (solid or gradient)
    let backgroundStyle = ''
    if (config.appearance.fill.type === 'gradient') {
      const grad = config.appearance.fill.gradient
      if (grad.type === 'linear') {
        backgroundStyle = `background: linear-gradient(${grad.direction}deg, ${grad.colors[0]}, ${grad.colors[1]});`
      } else {
        backgroundStyle = `background: radial-gradient(circle, ${grad.colors[0]}, ${grad.colors[1]});`
      }
    } else {
      backgroundStyle = `background: ${config.appearance.fill.solid};`
    }
    
    // Border styling
    const borderStyle = `border: ${config.appearance.border.width}px ${config.appearance.border.style} ${config.appearance.border.color};`
    
    // Shadow/glow effects
    let shadowStyle = ''
    const shadow = config.appearance.shadow
    if (shadow.type !== 'none') {
      if (shadow.type === 'glow') {
        shadowStyle = `box-shadow: 0 0 ${shadow.blur}px ${shadow.spread}px ${shadow.color};`
      } else if (shadow.type === 'soft') {
        shadowStyle = `box-shadow: ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color};`
      } else if (shadow.type === 'hard') {
        shadowStyle = `box-shadow: ${shadow.x}px ${shadow.y}px 0px ${shadow.spread}px ${shadow.color};`
      }
    }
    
    // State-based animations (keep existing logic)
    const stateClasses = {
      idle: 'animate-sunset-pulse',
      requesting: 'animate-pulse scale-95',
      recording: 'animate-flamingo-glow scale-110',
      processing: 'animate-pulse opacity-75 scale-95',
      success: 'animate-success-pop scale-110',
      error: 'animate-error-shake'
    }

    const combinedStyle = `${sizeStyle} ${fontSizeStyle} ${borderRadiusStyle} ${backgroundStyle} ${borderStyle} ${shadowStyle}`

    return {
      className: `${baseClasses} ${stateClasses[buttonState.value]}`,
      style: combinedStyle,
      config: config
    }
  }

  return (
    <div class="flex flex-col items-center space-y-4 w-full max-w-sm mx-auto">
      
      {/* Waveform Visualizer (when recording) - Brutalist Enhanced */}
      {showWaveform && buttonState.value === 'recording' && (
        <div class={`w-full p-6 shadow-md ${
          theme === 'flamingo-brutalist' 
            ? 'flamingo-card border-3 border-flamingo-primary' 
            : 'rounded-2xl bg-white/30 backdrop-blur-voice'
        }`}>
          <WaveformVisualizer analyzer={analyzerRef.current} theme={theme} />
        </div>
      )}

      {/* Main Voice Button with Progress Ring */}
      <div class="relative inline-block">
        {/* Progress Ring for Recording */}
        {buttonState.value === 'recording' && (
          <svg 
            class="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#FF6B9D"
              strokeWidth="2"
              strokeDasharray={`${(recordingDuration.value / maxDuration) * 301.6} 301.6`}
              strokeLinecap="round"
              class="transition-all duration-1000"
            />
          </svg>
        )}
        
        <button
          class={getThemeClasses().className}
          style={getThemeClasses().style}
          onClick={toggleRecording}
          disabled={buttonState.value === 'processing' || buttonState.value === 'requesting'}
          aria-label={`Voice recording button - ${getButtonText()}`}
          title={getButtonText()}
        >
        {/* Show custom text, timer, or icon with auto-scaling */}
        {buttonState.value === 'recording' && showTimer ? (
          <div class="flex items-center justify-center">
            <span class="font-mono font-bold">
              {formatTimer(recordingDuration.value)}
            </span>
          </div>
        ) : getThemeClasses().config.content.text ? (
          <div class="flex items-center justify-center w-full h-full">
            <span class="font-bold leading-none">
              {getThemeClasses().config.content.text}
            </span>
          </div>
        ) : (
          <ButtonIcon state={buttonState.value} theme={theme} />
        )}
        </button>
      </div>

      {/* Button Label - Chunky Typography */}
      <div class="text-center">
        <p class={`text-xl font-chunky tracking-wide ${
          theme === 'flamingo-brutalist' 
            ? 'text-flamingo-charcoal' 
            : 'text-gray-800'
        }`}>
          {getButtonText()}
        </p>
        
        {showTimer && buttonState.value === 'recording' && (
          <p class={`text-base font-medium mt-2 ${
            theme === 'flamingo-brutalist' 
              ? 'text-flamingo-purple' 
              : 'text-gray-600'
          }`}>
            {formatTimer(recordingDuration.value)}
          </p>
        )}
      </div>

      {/* Processing Spinner - Theme Aware */}
      {buttonState.value === 'processing' && (
        <div class="flex justify-center">
          <div class={`w-10 h-10 border-4 ${
            theme === 'flamingo-brutalist' 
              ? 'border-flamingo-primary border-t-transparent' 
              : 'border-voice-primary border-t-transparent'
          } rounded-full animate-spin`} />
        </div>
      )}

      {/* Error Message - Brutalist Style */}
      {errorMessage.value && (
        <div class={`w-full text-center p-6 ${
          theme === 'flamingo-brutalist' 
            ? 'flamingo-card' 
            : 'bg-red-50 rounded-lg border border-red-200'
        }`}>
          <p class={`font-medium mb-4 ${
            theme === 'flamingo-brutalist' 
              ? 'text-flamingo-coral text-lg' 
              : 'text-red-500'
          }`}>
            {errorMessage.value}
          </p>
          <button
            class={`font-medium underline transition-colors ${
              theme === 'flamingo-brutalist' 
                ? 'text-flamingo-purple hover:text-flamingo-charcoal' 
                : 'text-red-600 hover:text-red-700'
            }`}
            onClick={resetToIdle}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transcript Display - Brutalist Enhanced */}
      {transcript.value && (
        <div class="w-full space-y-6">
          <div class={`w-full whitespace-pre-line p-8 font-mono text-base leading-relaxed shadow-lg ${
            theme === 'flamingo-brutalist' 
              ? 'flamingo-card text-flamingo-charcoal border-3 border-flamingo-purple' 
              : 'rounded-3xl border border-gray-100 bg-white text-gray-800'
          }`}>
            {transcript.value}
          </div>
          
        </div>
      )}
    </div>
  )
}

// Button Icon Component (chunky and theme-aware)
function ButtonIcon({ state, theme }: { state: ButtonState, theme?: string }) {
  // Bigger icons for brutalist theme
  const iconClasses = theme === 'flamingo-brutalist' 
    ? "w-12 h-12 mx-auto" 
    : "w-8 h-8 mx-auto"
  
  switch (state) {
    case 'idle':
      return (
        <svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeWidth="1.5"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V21H9v2h6v-2h-2v-.06A9 9 0 0 0 21 12v-2h-2z" strokeWidth="1.5"/>
        </svg>
      )
    case 'recording':
      return (
        <svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="6" strokeWidth="2"/>
        </svg>
      )
    case 'processing':
      return (
        <svg class={`${iconClasses} animate-spin`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2v2a8 8 0 0 1 8 8h2a10 10 0 0 0-10-10z" strokeWidth="2"/>
        </svg>
      )
    case 'success':
      return (
        <svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.2l-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" strokeWidth="2"/>
        </svg>
      )
    case 'error':
      return (
        <svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" strokeWidth="1.5"/>
        </svg>
      )
    default:
      return (
        <svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        </svg>
      )
  }
}

// Waveform Visualizer Component (like Pablo's AudioVisualizer.svelte)
function WaveformVisualizer({ analyzer, theme }: { analyzer?: AudioAnalyzer, theme?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!analyzer || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    function draw() {
      if (!analyzer || !canvas || !ctx) return
      
      const waveformData = analyzer.getWaveformData()
      const { width, height } = canvas
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw waveform bars
      const barWidth = width / waveformData.length
      const centerY = height / 2
      
      // Use theme-appropriate colors
      const color = theme === 'flamingo-brutalist' ? '#FF6B9D' : '#f59e0b'
      ctx.fillStyle = color
      
      waveformData.forEach((value, index) => {
        const barHeight = value * height * 0.8 // Scale to 80% of canvas height
        const x = index * barWidth
        const y = centerY - barHeight / 2
        
        ctx.fillRect(x, y, barWidth - 1, barHeight)
      })
      
      requestAnimationFrame(draw)
    }
    
    draw()
  }, [analyzer])
  
  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      class="w-full h-20 rounded-lg"
      style={{ background: 'transparent' }}
    />
  )
}