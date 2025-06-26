import { AudioBlob, VoiceButtonError, ErrorCode } from '../types/core.ts'

// Audio Recording Utilities (based on Pablo's working Svelte implementation)
export class AudioRecorder {
  private mediaRecorder?: MediaRecorder
  private audioChunks: Blob[] = []
  private stream?: MediaStream

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('❌ Microphone permission denied:', error)
      return false
    }
  }

  async startRecording(): Promise<void> {
    this.audioChunks = []
    
    try {
      console.log('🎤 Starting recording...')
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Good for speech recognition
        }
      })

      // Create MediaRecorder with optimal settings for speech
      const options = this.getSupportedMimeType()
      this.mediaRecorder = new MediaRecorder(this.stream, options)

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event)
        throw new VoiceButtonError(
          'Recording failed', 
          ErrorCode.RECORDING_FAILED,
          { event }
        )
      }

      // Start recording
      this.mediaRecorder.start(100) // Collect data every 100ms for smooth waveform
      console.log('✅ Recording started successfully')
      
    } catch (error) {
      this.cleanup()
      
      if (error instanceof VoiceButtonError) {
        throw error
      }
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new VoiceButtonError(
            'Microphone permission denied',
            ErrorCode.MICROPHONE_PERMISSION_DENIED
          )
        }
        if (error.name === 'NotFoundError') {
          throw new VoiceButtonError(
            'No microphone found',
            ErrorCode.MICROPHONE_NOT_AVAILABLE
          )
        }
      }
      
      throw new VoiceButtonError(
        'Failed to start recording',
        ErrorCode.RECORDING_FAILED,
        { originalError: error }
      )
    }
  }

  async stopRecording(): Promise<AudioBlob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        reject(new VoiceButtonError(
          'No active recording to stop',
          ErrorCode.RECORDING_FAILED
        ))
        return
      }

      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
          const audioBlob = new Blob(this.audioChunks, { type: mimeType })
          
          // Estimate duration (rough calculation)
          const duration = this.estimateDuration(audioBlob)
          
          // Validate recording
          if (audioBlob.size < 1000) { // Less than 1KB is probably too short
            throw new VoiceButtonError(
              'Recording too short',
              ErrorCode.RECORDING_TOO_SHORT
            )
          }

          const result: AudioBlob = {
            data: audioBlob,
            format: this.getFormatFromMimeType(mimeType),
            duration,
            sampleRate: 16000 // We requested 16kHz above
          }

          console.log('🎤 Recording stopped:', {
            size: `${(audioBlob.size / 1024).toFixed(1)}KB`,
            duration: `${duration.toFixed(1)}s`,
            format: result.format
          })

          this.cleanup()
          resolve(result)
          
        } catch (error) {
          this.cleanup()
          if (error instanceof VoiceButtonError) {
            reject(error)
          } else {
            reject(new VoiceButtonError(
              'Failed to process recording',
              ErrorCode.RECORDING_FAILED,
              { originalError: error }
            ))
          }
        }
      }

      this.mediaRecorder.stop()
    })
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  getStream(): MediaStream | undefined {
    return this.stream
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = undefined
    }
    this.mediaRecorder = undefined
    this.audioChunks = []
  }

  private getSupportedMimeType(): MediaRecorderOptions {
    // Try different formats in order of preference
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return { mimeType: type }
      }
    }

    // Fallback to no specific type
    return {}
  }

  private getFormatFromMimeType(mimeType: string): AudioBlob['format'] {
    if (mimeType.includes('webm')) return 'webm'
    if (mimeType.includes('mp4')) return 'mp4'
    if (mimeType.includes('wav')) return 'wav'
    if (mimeType.includes('mp3')) return 'mp3'
    return 'webm' // Default fallback
  }

  private estimateDuration(blob: Blob): number {
    // Very rough estimate: ~16KB per second for 16kHz mono audio
    // This is not accurate but gives us a ballpark
    return Math.max(0.1, blob.size / 16000)
  }
}

// Audio Analysis for Waveform (based on Pablo's AudioVisualizer needs)
export class AudioAnalyzer {
  private audioContext?: AudioContext
  private analyser?: AnalyserNode
  private dataArray?: Uint8Array
  private source?: MediaStreamAudioSourceNode

  async connectToStream(stream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext()
      this.analyser = this.audioContext.createAnalyser()
      
      // Configure for smooth waveform visualization
      this.analyser.fftSize = 64 // Smaller = less detailed but smoother
      this.analyser.smoothingTimeConstant = 0.8
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      
      this.source = this.audioContext.createMediaStreamSource(stream)
      this.source.connect(this.analyser)
      
    } catch (error) {
      console.error('❌ Failed to setup audio analysis:', error)
    }
  }

  getWaveformData(): number[] {
    if (!this.analyser || !this.dataArray) return []
    
    this.analyser.getByteFrequencyData(this.dataArray)
    
    // Convert to normalized values (0-1) for easier styling
    return Array.from(this.dataArray).map(value => value / 255)
  }

  getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0
    
    this.analyser.getByteFrequencyData(this.dataArray)
    
    // Calculate RMS volume
    const sum = this.dataArray.reduce((acc, value) => acc + (value * value), 0)
    const rms = Math.sqrt(sum / this.dataArray.length)
    
    return rms / 255 // Normalize to 0-1
  }

  disconnect(): void {
    if (this.source) {
      this.source.disconnect()
      this.source = undefined
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = undefined
    }
    this.analyser = undefined
    this.dataArray = undefined
  }
}

// Utility Functions
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    console.log('📋 Text copied to clipboard')
    return true
  } catch (error) {
    console.error('❌ Failed to copy to clipboard:', error)
    return false
  }
}

export function triggerHapticFeedback(pattern: number[] = [50]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Haptic patterns for different interactions
export const HapticPatterns = {
  tap: [50],              // Quick tap feedback
  longPress: [100],       // Firm press
  recordStart: [100, 50, 100], // Strong-weak-strong
  recordStop: [200],      // Long confirmation
  success: [50, 50, 50],  // Triple tap celebration
  error: [100, 100],      // Double warning buzz
} as const