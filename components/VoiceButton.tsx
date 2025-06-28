import { signal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { AudioRecorder, AudioAnalyzer, copyToClipboard, triggerHapticFeedback, HapticPatterns } from '../utils/audio.ts'
import { ButtonState, VoiceButtonError, ThemeId, ButtonSize } from '../types/core.ts'
import { TranscriptionPlugin, OutputPlugin } from '../types/plugins.ts'
import { ButtonCustomization, generateButtonStyles, generateButtonClasses, defaultCustomization } from '../types/customization.ts'
import { toast } from './Toast.tsx'

// Signals for global state management (like Pablo's reactive Svelte stores)
const buttonState = signal<ButtonState>('idle')
const transcript = signal<string>('')
const errorMessage = signal<string>('')
const isClipboardSuccess = signal<boolean>(false)
const recordingDuration = signal<number>(0)

interface VoiceButtonProps {
  // New customization system (primary)
  customization?: ButtonCustomization
  
  // Voice activation toggle
  voiceEnabled?: boolean
  onVoiceToggle?: (enabled: boolean) => void
  
  // Core functionality
  transcriptionPlugin?: TranscriptionPlugin
  outputPlugin?: OutputPlugin
  
  // Appearance (legacy support)
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
  
  // Legacy comprehensive config (preserved for compatibility)
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
  onCustomizationChange?: (customization: ButtonCustomization) => void
}

export default function VoiceButton({
  customization = defaultCustomization,
  voiceEnabled = false,
  onVoiceToggle,
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
  onCustomizationChange,
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

  // Simple click sound effect
  function playClickSound() {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Silently fail if audio context not available
      console.log('Audio context not available')
    }
  }

  function toggleRecording() {
    playClickSound()
    
    // ULTIMATE satisfying feedback (research-based)
    const button = document.querySelector('.voice-button') as HTMLElement
    if (button) {
      // Stage 1: Immediate deep press (50ms)
      button.style.transform = 'translate(8px, 8px) scale(0.96)'
      button.style.boxShadow = '1px 1px 0px #000000'
      button.style.filter = 'brightness(0.9)'
      
      // Stage 2: Slight bounce out (100ms)
      setTimeout(() => {
        button.style.transform = 'translate(-2px, -2px) scale(1.02)'
        button.style.boxShadow = '10px 10px 0px #000000'
        button.style.filter = 'brightness(1.1)'
      }, 50)
      
      // Stage 3: Settle back to normal (150ms)
      setTimeout(() => {
        button.style.transform = ''
        button.style.boxShadow = ''
        button.style.filter = ''
      }, 150)
    }
    
    // Check if voice is enabled before doing API calls
    if (!voiceEnabled) {
      // Just satisfying button press without API calls
      console.log('🎨 Design mode - Voice API disabled')
      return
    }
    
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

  // Enhanced button styling with customization system
  const getButtonStyles = () => {
    // Use buttonConfig if provided (studio mode), otherwise use customization system
    if (buttonConfig) {
      // Studio mode - use buttonConfig for live preview
      const config = buttonConfig
      
      // Add voice state-specific animations and styling
      let stateClasses = ''
      let stateAnimations = ''
      
      switch (buttonState.value) {
        case 'idle':
          stateAnimations = 'animate-[breathe_3s_ease-in-out_infinite]'
          break
        case 'requesting':
          stateClasses = 'ring-4 ring-orange-300'
          stateAnimations = 'animate-pulse'
          break
        case 'recording':
          stateClasses = 'ring-4 ring-red-300'
          stateAnimations = 'animate-[recording-pulse_1s_ease-in-out_infinite]'
          break
        case 'processing':
          stateClasses = 'ring-4 ring-blue-300'
          stateAnimations = 'animate-pulse'
          break
        case 'success':
          stateClasses = 'ring-4 ring-green-300'
          stateAnimations = 'animate-[success-pop_0.6s_ease-out]'
          break
        case 'error':
          stateClasses = 'ring-4 ring-red-300'
          stateAnimations = 'animate-[error-shake_0.5s_ease-in-out]'
          break
      }
      
      // Content size
      const contentSize = 'text-2xl'
      
      // Generate dynamic styles from buttonConfig
      const isPressed = buttonState.value === 'recording' || buttonState.value === 'processing'
      
      // Apply gradients or solid fills
      let backgroundStyle = ''
      if (config.appearance.fill.type === 'gradient') {
        const { colors, direction, type } = config.appearance.fill.gradient
        if (type === 'linear') {
          backgroundStyle = `linear-gradient(${direction}deg, ${colors[0]}, ${colors[1]})`
        } else {
          backgroundStyle = `radial-gradient(circle, ${colors[0]}, ${colors[1]})`
        }
      } else {
        backgroundStyle = config.appearance.fill.solid
      }
      
      // Calculate shadow - blend buttonConfig shadow with state-based effects
      let shadowStyle = ''
      if (config.appearance.shadow.type !== 'none') {
        const shadow = config.appearance.shadow
        const baseX = isPressed ? shadow.x + 6 : shadow.x
        const baseY = isPressed ? shadow.y + 6 : shadow.y
        const baseBlur = isPressed ? Math.max(2, shadow.blur - 6) : shadow.blur
        
        if (shadow.type === 'glow') {
          shadowStyle = `${baseX}px ${baseY}px ${baseBlur}px ${shadow.spread}px ${shadow.color}`
        } else {
          shadowStyle = `${baseX}px ${baseY}px ${baseBlur}px ${shadow.spread}px ${shadow.color}`
        }
      }
      
      return {
        className: `${stateClasses} ${stateAnimations} ${contentSize} relative cursor-pointer select-none transition-all duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]`,
        style: {
          width: `${config.size.width}px`,
          height: `${config.size.height}px`,
          borderRadius: config.shape.type === 'circle' ? '50%' : `${config.shape.borderRadius}px`,
          background: backgroundStyle,
          border: `${config.appearance.border.width}px ${config.appearance.border.style} ${config.appearance.border.color}`,
          boxShadow: shadowStyle,
          transform: isPressed ? 'scale(0.96)' : 'scale(1)',
          transition: 'all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: config.size.width > 150 ? '2rem' : '1.5rem',
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          willChange: 'transform, box-shadow, filter'
        }
      }
    } else {
      // Default mode - use customization system
      const customProperties = generateButtonStyles(customization)
      const baseClasses = generateButtonClasses(customization)
      
      // Add voice state-specific animations and styling
      let stateClasses = ''
      let stateAnimations = ''
      
      switch (buttonState.value) {
        case 'idle':
          stateAnimations = 'animate-[breathe_3s_ease-in-out_infinite]'
          break
        case 'requesting':
          stateClasses = 'ring-4 ring-orange-300'
          stateAnimations = 'animate-pulse'
          break
        case 'recording':
          stateClasses = 'ring-4 ring-red-300'
          stateAnimations = 'animate-[recording-pulse_1s_ease-in-out_infinite]'
          break
        case 'processing':
          stateClasses = 'ring-4 ring-blue-300'
          stateAnimations = 'animate-pulse'
          break
        case 'success':
          stateClasses = 'ring-4 ring-green-300'
          stateAnimations = 'animate-[success-pop_0.6s_ease-out]'
          break
        case 'error':
          stateClasses = 'ring-4 ring-red-300'
          stateAnimations = 'animate-[error-shake_0.5s_ease-in-out]'
          break
      }
      
      // Dynamic sizing based on content
      const contentSize = customization.content.type === 'emoji' ? 'text-5xl' : 'text-2xl'
      
      // Research-based SATISFYING button feedback
      const isPressed = buttonState.value === 'recording' || buttonState.value === 'processing'
      
      // 3D Push effect with proper physics
      const pushTransform = isPressed ? 'translate(6px, 6px)' : 'translate(0px, 0px)'
      const shadowDepth = isPressed ? '2px 2px 0px #000000' : '8px 8px 0px #000000'
      
      // Rainbow border (only when idle for modularity)
      const rainbowClasses = buttonState.value === 'idle' 
        ? 'before:content-[""] before:absolute before:inset-[-4px] before:bg-gradient-to-r before:from-red-400 before:via-yellow-400 before:via-green-400 before:via-blue-400 before:via-purple-400 before:to-red-400 before:rounded-[calc(var(--button-radius)+4px)] before:-z-10 before:animate-[rainbow-flow_3s_linear_infinite] before:bg-[length:400%_400%]'
        : ''
      
      return {
        className: `${baseClasses} ${stateClasses} ${stateAnimations} ${contentSize} ${rainbowClasses} relative min-w-[260px] max-w-[340px] h-[90px] px-10 py-6 cursor-pointer select-none transition-all duration-150 ease-out hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]`,
        style: {
          ...customProperties,
          // Enhanced 3D button physics
          transform: pushTransform,
          boxShadow: shadowDepth,
          // Buttery smooth transitions
          transition: 'all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: 'none',
          // Extra satisfying details
          willChange: 'transform, box-shadow, filter'
        }
      }
    }
  }

  return (
    <div class="flex flex-col items-center">
      
      {/* Just the Button - Clean */}
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
          class={`${getButtonStyles().className} voice-button`}
          style={getButtonStyles().style}
          onClick={toggleRecording}
          disabled={buttonState.value === 'processing' || buttonState.value === 'requesting'}
          aria-label={`Voice recording button - ${getButtonText()}`}
          title={getButtonText()}
        >
        {/* Show custom content, timer, or icon */}
        {buttonState.value === 'recording' && showTimer ? (
          <span class="font-mono font-bold">
            {formatTimer(recordingDuration.value)}
          </span>
        ) : buttonConfig ? (
          <span class="font-bold leading-none">
            {buttonConfig.content.text}
          </span>
        ) : customization.content.value ? (
          <span class="font-bold leading-none">
            {customization.content.value}
          </span>
        ) : (
          <ButtonIcon state={buttonState.value} theme={customization.appearance.theme} />
        )}
        </button>
      </div>

      {/* Processing Spinner Only When Needed */}
      {buttonState.value === 'processing' && (
        <div class="flex justify-center mt-4">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error Message Only When Needed */}
      {errorMessage.value && (
        <div class="mt-4 text-center p-4 bg-red-50 rounded-2xl border border-red-200 max-w-sm">
          <p class="text-red-800 font-medium mb-2">
            {errorMessage.value}
          </p>
          <button
            class="text-red-600 hover:text-red-700 font-medium underline"
            onClick={resetToIdle}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

// Button Icon Component (theme-aware and sophisticated)
function ButtonIcon({ state, theme }: { state: ButtonState, theme?: string }) {
  // Professional icon sizing
  const iconClasses = "w-8 h-8 mx-auto"
  
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