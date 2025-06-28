import { VoiceButtonError, ErrorCode } from '../types/core.ts';
// Audio Recording Utilities (based on Pablo's working Svelte implementation)
export class AudioRecorder {
  mediaRecorder;
  audioChunks = [];
  stream;
  async requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      // Stop the test stream immediately
      stream.getTracks().forEach((track)=>track.stop());
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      return false;
    }
  }
  async startRecording() {
    this.audioChunks = [];
    try {
      console.log('🎤 Starting recording...');
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      // Create MediaRecorder with optimal settings for speech
      const options = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event)=>{
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.onerror = (event)=>{
        console.error('❌ MediaRecorder error:', event);
        throw new VoiceButtonError('Recording failed', ErrorCode.RECORDING_FAILED, {
          event
        });
      };
      // Start recording
      this.mediaRecorder.start(100) // Collect data every 100ms for smooth waveform
      ;
      console.log('✅ Recording started successfully');
    } catch (error) {
      this.cleanup();
      if (error instanceof VoiceButtonError) {
        throw error;
      }
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new VoiceButtonError('Microphone permission denied', ErrorCode.MICROPHONE_PERMISSION_DENIED);
        }
        if (error.name === 'NotFoundError') {
          throw new VoiceButtonError('No microphone found', ErrorCode.MICROPHONE_NOT_AVAILABLE);
        }
      }
      throw new VoiceButtonError('Failed to start recording', ErrorCode.RECORDING_FAILED, {
        originalError: error
      });
    }
  }
  async stopRecording() {
    return new Promise((resolve, reject)=>{
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        reject(new VoiceButtonError('No active recording to stop', ErrorCode.RECORDING_FAILED));
        return;
      }
      this.mediaRecorder.onstop = ()=>{
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, {
            type: mimeType
          });
          // Estimate duration (rough calculation)
          const duration = this.estimateDuration(audioBlob);
          // Validate recording
          if (audioBlob.size < 1000) {
            throw new VoiceButtonError('Recording too short', ErrorCode.RECORDING_TOO_SHORT);
          }
          const result = {
            data: audioBlob,
            format: this.getFormatFromMimeType(mimeType),
            duration,
            sampleRate: 16000 // We requested 16kHz above
          };
          console.log('🎤 Recording stopped:', {
            size: `${(audioBlob.size / 1024).toFixed(1)}KB`,
            duration: `${duration.toFixed(1)}s`,
            format: result.format
          });
          this.cleanup();
          resolve(result);
        } catch (error) {
          this.cleanup();
          if (error instanceof VoiceButtonError) {
            reject(error);
          } else {
            reject(new VoiceButtonError('Failed to process recording', ErrorCode.RECORDING_FAILED, {
              originalError: error
            }));
          }
        }
      };
      this.mediaRecorder.stop();
    });
  }
  isRecording() {
    return this.mediaRecorder?.state === 'recording';
  }
  getStream() {
    return this.stream;
  }
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track)=>track.stop());
      this.stream = undefined;
    }
    this.mediaRecorder = undefined;
    this.audioChunks = [];
  }
  getSupportedMimeType() {
    // Try different formats in order of preference
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];
    for (const type of types){
      if (MediaRecorder.isTypeSupported(type)) {
        return {
          mimeType: type
        };
      }
    }
    // Fallback to no specific type
    return {};
  }
  getFormatFromMimeType(mimeType) {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('wav')) return 'wav';
    if (mimeType.includes('mp3')) return 'mp3';
    return 'webm' // Default fallback
    ;
  }
  estimateDuration(blob) {
    // Very rough estimate: ~16KB per second for 16kHz mono audio
    // This is not accurate but gives us a ballpark
    return Math.max(0.1, blob.size / 16000);
  }
}
// Audio Analysis for Waveform (based on Pablo's AudioVisualizer needs)
export class AudioAnalyzer {
  audioContext;
  analyser;
  dataArray;
  source;
  async connectToStream(stream) {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      // Configure for smooth waveform visualization
      this.analyser.fftSize = 64 // Smaller = less detailed but smoother
      ;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
    } catch (error) {
      console.error('❌ Failed to setup audio analysis:', error);
    }
  }
  getWaveformData() {
    if (!this.analyser || !this.dataArray) return [];
    this.analyser.getByteFrequencyData(this.dataArray);
    // Convert to normalized values (0-1) for easier styling
    return Array.from(this.dataArray).map((value)=>value / 255);
  }
  getVolume() {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    // Calculate RMS volume
    const sum = this.dataArray.reduce((acc, value)=>acc + value * value, 0);
    const rms = Math.sqrt(sum / this.dataArray.length);
    return rms / 255 // Normalize to 0-1
    ;
  }
  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.source = undefined;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = undefined;
    }
    this.analyser = undefined;
    this.dataArray = undefined;
  }
}
// Utility Functions
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('📋 Text copied to clipboard');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy to clipboard:', error);
    return false;
  }
}
export function triggerHapticFeedback(pattern = [
  50
]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
// Haptic patterns for different interactions
export const HapticPatterns = {
  tap: [
    50
  ],
  longPress: [
    100
  ],
  recordStart: [
    100,
    50,
    100
  ],
  recordStop: [
    200
  ],
  success: [
    50,
    50,
    50
  ],
  error: [
    100,
    100
  ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby91dGlscy9hdWRpby50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdWRpb0Jsb2IsIFZvaWNlQnV0dG9uRXJyb3IsIEVycm9yQ29kZSB9IGZyb20gJy4uL3R5cGVzL2NvcmUudHMnXG5cbi8vIEF1ZGlvIFJlY29yZGluZyBVdGlsaXRpZXMgKGJhc2VkIG9uIFBhYmxvJ3Mgd29ya2luZyBTdmVsdGUgaW1wbGVtZW50YXRpb24pXG5leHBvcnQgY2xhc3MgQXVkaW9SZWNvcmRlciB7XG4gIHByaXZhdGUgbWVkaWFSZWNvcmRlcj86IE1lZGlhUmVjb3JkZXJcbiAgcHJpdmF0ZSBhdWRpb0NodW5rczogQmxvYltdID0gW11cbiAgcHJpdmF0ZSBzdHJlYW0/OiBNZWRpYVN0cmVhbVxuXG4gIGFzeW5jIHJlcXVlc3RQZXJtaXNzaW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0pXG4gICAgICAvLyBTdG9wIHRoZSB0ZXN0IHN0cmVhbSBpbW1lZGlhdGVseVxuICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godHJhY2sgPT4gdHJhY2suc3RvcCgpKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign4p2MIE1pY3JvcGhvbmUgcGVybWlzc2lvbiBkZW5pZWQ6JywgZXJyb3IpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGFydFJlY29yZGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmF1ZGlvQ2h1bmtzID0gW11cbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coJ/CfjqQgU3RhcnRpbmcgcmVjb3JkaW5nLi4uJylcbiAgICAgIFxuICAgICAgLy8gR2V0IG1pY3JvcGhvbmUgYWNjZXNzXG4gICAgICB0aGlzLnN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHsgXG4gICAgICAgIGF1ZGlvOiB7XG4gICAgICAgICAgZWNob0NhbmNlbGxhdGlvbjogdHJ1ZSxcbiAgICAgICAgICBub2lzZVN1cHByZXNzaW9uOiB0cnVlLFxuICAgICAgICAgIHNhbXBsZVJhdGU6IDE2MDAwLCAvLyBHb29kIGZvciBzcGVlY2ggcmVjb2duaXRpb25cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gQ3JlYXRlIE1lZGlhUmVjb3JkZXIgd2l0aCBvcHRpbWFsIHNldHRpbmdzIGZvciBzcGVlY2hcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmdldFN1cHBvcnRlZE1pbWVUeXBlKClcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlciA9IG5ldyBNZWRpYVJlY29yZGVyKHRoaXMuc3RyZWFtLCBvcHRpb25zKVxuXG4gICAgICAvLyBTZXQgdXAgZXZlbnQgaGFuZGxlcnNcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlci5vbmRhdGFhdmFpbGFibGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEuc2l6ZSA+IDApIHtcbiAgICAgICAgICB0aGlzLmF1ZGlvQ2h1bmtzLnB1c2goZXZlbnQuZGF0YSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLm1lZGlhUmVjb3JkZXIub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCfinYwgTWVkaWFSZWNvcmRlciBlcnJvcjonLCBldmVudClcbiAgICAgICAgdGhyb3cgbmV3IFZvaWNlQnV0dG9uRXJyb3IoXG4gICAgICAgICAgJ1JlY29yZGluZyBmYWlsZWQnLCBcbiAgICAgICAgICBFcnJvckNvZGUuUkVDT1JESU5HX0ZBSUxFRCxcbiAgICAgICAgICB7IGV2ZW50IH1cbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICAvLyBTdGFydCByZWNvcmRpbmdcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlci5zdGFydCgxMDApIC8vIENvbGxlY3QgZGF0YSBldmVyeSAxMDBtcyBmb3Igc21vb3RoIHdhdmVmb3JtXG4gICAgICBjb25zb2xlLmxvZygn4pyFIFJlY29yZGluZyBzdGFydGVkIHN1Y2Nlc3NmdWxseScpXG4gICAgICBcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5jbGVhbnVwKClcbiAgICAgIFxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVm9pY2VCdXR0b25FcnJvcikge1xuICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBET01FeGNlcHRpb24pIHtcbiAgICAgICAgaWYgKGVycm9yLm5hbWUgPT09ICdOb3RBbGxvd2VkRXJyb3InKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFZvaWNlQnV0dG9uRXJyb3IoXG4gICAgICAgICAgICAnTWljcm9waG9uZSBwZXJtaXNzaW9uIGRlbmllZCcsXG4gICAgICAgICAgICBFcnJvckNvZGUuTUlDUk9QSE9ORV9QRVJNSVNTSU9OX0RFTklFRFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyb3IubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFZvaWNlQnV0dG9uRXJyb3IoXG4gICAgICAgICAgICAnTm8gbWljcm9waG9uZSBmb3VuZCcsXG4gICAgICAgICAgICBFcnJvckNvZGUuTUlDUk9QSE9ORV9OT1RfQVZBSUxBQkxFXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRocm93IG5ldyBWb2ljZUJ1dHRvbkVycm9yKFxuICAgICAgICAnRmFpbGVkIHRvIHN0YXJ0IHJlY29yZGluZycsXG4gICAgICAgIEVycm9yQ29kZS5SRUNPUkRJTkdfRkFJTEVELFxuICAgICAgICB7IG9yaWdpbmFsRXJyb3I6IGVycm9yIH1cbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdG9wUmVjb3JkaW5nKCk6IFByb21pc2U8QXVkaW9CbG9iPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghdGhpcy5tZWRpYVJlY29yZGVyIHx8IHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSAhPT0gJ3JlY29yZGluZycpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBWb2ljZUJ1dHRvbkVycm9yKFxuICAgICAgICAgICdObyBhY3RpdmUgcmVjb3JkaW5nIHRvIHN0b3AnLFxuICAgICAgICAgIEVycm9yQ29kZS5SRUNPUkRJTkdfRkFJTEVEXG4gICAgICAgICkpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLm1lZGlhUmVjb3JkZXIub25zdG9wID0gKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG1pbWVUeXBlID0gdGhpcy5tZWRpYVJlY29yZGVyPy5taW1lVHlwZSB8fCAnYXVkaW8vd2VibSdcbiAgICAgICAgICBjb25zdCBhdWRpb0Jsb2IgPSBuZXcgQmxvYih0aGlzLmF1ZGlvQ2h1bmtzLCB7IHR5cGU6IG1pbWVUeXBlIH0pXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gRXN0aW1hdGUgZHVyYXRpb24gKHJvdWdoIGNhbGN1bGF0aW9uKVxuICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5lc3RpbWF0ZUR1cmF0aW9uKGF1ZGlvQmxvYilcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBWYWxpZGF0ZSByZWNvcmRpbmdcbiAgICAgICAgICBpZiAoYXVkaW9CbG9iLnNpemUgPCAxMDAwKSB7IC8vIExlc3MgdGhhbiAxS0IgaXMgcHJvYmFibHkgdG9vIHNob3J0XG4gICAgICAgICAgICB0aHJvdyBuZXcgVm9pY2VCdXR0b25FcnJvcihcbiAgICAgICAgICAgICAgJ1JlY29yZGluZyB0b28gc2hvcnQnLFxuICAgICAgICAgICAgICBFcnJvckNvZGUuUkVDT1JESU5HX1RPT19TSE9SVFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlc3VsdDogQXVkaW9CbG9iID0ge1xuICAgICAgICAgICAgZGF0YTogYXVkaW9CbG9iLFxuICAgICAgICAgICAgZm9ybWF0OiB0aGlzLmdldEZvcm1hdEZyb21NaW1lVHlwZShtaW1lVHlwZSksXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHNhbXBsZVJhdGU6IDE2MDAwIC8vIFdlIHJlcXVlc3RlZCAxNmtIeiBhYm92ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn46kIFJlY29yZGluZyBzdG9wcGVkOicsIHtcbiAgICAgICAgICAgIHNpemU6IGAkeyhhdWRpb0Jsb2Iuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMSl9S0JgLFxuICAgICAgICAgICAgZHVyYXRpb246IGAke2R1cmF0aW9uLnRvRml4ZWQoMSl9c2AsXG4gICAgICAgICAgICBmb3JtYXQ6IHJlc3VsdC5mb3JtYXRcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgdGhpcy5jbGVhbnVwKClcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICBcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmNsZWFudXAoKVxuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFZvaWNlQnV0dG9uRXJyb3IpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBWb2ljZUJ1dHRvbkVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIHByb2Nlc3MgcmVjb3JkaW5nJyxcbiAgICAgICAgICAgICAgRXJyb3JDb2RlLlJFQ09SRElOR19GQUlMRUQsXG4gICAgICAgICAgICAgIHsgb3JpZ2luYWxFcnJvcjogZXJyb3IgfVxuICAgICAgICAgICAgKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnN0b3AoKVxuICAgIH0pXG4gIH1cblxuICBpc1JlY29yZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tZWRpYVJlY29yZGVyPy5zdGF0ZSA9PT0gJ3JlY29yZGluZydcbiAgfVxuXG4gIGdldFN0cmVhbSgpOiBNZWRpYVN0cmVhbSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuc3RyZWFtXG4gIH1cblxuICBwcml2YXRlIGNsZWFudXAoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RyZWFtKSB7XG4gICAgICB0aGlzLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHRyYWNrLnN0b3AoKSlcbiAgICAgIHRoaXMuc3RyZWFtID0gdW5kZWZpbmVkXG4gICAgfVxuICAgIHRoaXMubWVkaWFSZWNvcmRlciA9IHVuZGVmaW5lZFxuICAgIHRoaXMuYXVkaW9DaHVua3MgPSBbXVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRTdXBwb3J0ZWRNaW1lVHlwZSgpOiBNZWRpYVJlY29yZGVyT3B0aW9ucyB7XG4gICAgLy8gVHJ5IGRpZmZlcmVudCBmb3JtYXRzIGluIG9yZGVyIG9mIHByZWZlcmVuY2VcbiAgICBjb25zdCB0eXBlcyA9IFtcbiAgICAgICdhdWRpby93ZWJtO2NvZGVjcz1vcHVzJyxcbiAgICAgICdhdWRpby93ZWJtJyxcbiAgICAgICdhdWRpby9tcDQnLFxuICAgICAgJ2F1ZGlvL3dhdidcbiAgICBdXG5cbiAgICBmb3IgKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcbiAgICAgIGlmIChNZWRpYVJlY29yZGVyLmlzVHlwZVN1cHBvcnRlZCh0eXBlKSkge1xuICAgICAgICByZXR1cm4geyBtaW1lVHlwZTogdHlwZSB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2sgdG8gbm8gc3BlY2lmaWMgdHlwZVxuICAgIHJldHVybiB7fVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRGb3JtYXRGcm9tTWltZVR5cGUobWltZVR5cGU6IHN0cmluZyk6IEF1ZGlvQmxvYlsnZm9ybWF0J10ge1xuICAgIGlmIChtaW1lVHlwZS5pbmNsdWRlcygnd2VibScpKSByZXR1cm4gJ3dlYm0nXG4gICAgaWYgKG1pbWVUeXBlLmluY2x1ZGVzKCdtcDQnKSkgcmV0dXJuICdtcDQnXG4gICAgaWYgKG1pbWVUeXBlLmluY2x1ZGVzKCd3YXYnKSkgcmV0dXJuICd3YXYnXG4gICAgaWYgKG1pbWVUeXBlLmluY2x1ZGVzKCdtcDMnKSkgcmV0dXJuICdtcDMnXG4gICAgcmV0dXJuICd3ZWJtJyAvLyBEZWZhdWx0IGZhbGxiYWNrXG4gIH1cblxuICBwcml2YXRlIGVzdGltYXRlRHVyYXRpb24oYmxvYjogQmxvYik6IG51bWJlciB7XG4gICAgLy8gVmVyeSByb3VnaCBlc3RpbWF0ZTogfjE2S0IgcGVyIHNlY29uZCBmb3IgMTZrSHogbW9ubyBhdWRpb1xuICAgIC8vIFRoaXMgaXMgbm90IGFjY3VyYXRlIGJ1dCBnaXZlcyB1cyBhIGJhbGxwYXJrXG4gICAgcmV0dXJuIE1hdGgubWF4KDAuMSwgYmxvYi5zaXplIC8gMTYwMDApXG4gIH1cbn1cblxuLy8gQXVkaW8gQW5hbHlzaXMgZm9yIFdhdmVmb3JtIChiYXNlZCBvbiBQYWJsbydzIEF1ZGlvVmlzdWFsaXplciBuZWVkcylcbmV4cG9ydCBjbGFzcyBBdWRpb0FuYWx5emVyIHtcbiAgcHJpdmF0ZSBhdWRpb0NvbnRleHQ/OiBBdWRpb0NvbnRleHRcbiAgcHJpdmF0ZSBhbmFseXNlcj86IEFuYWx5c2VyTm9kZVxuICBwcml2YXRlIGRhdGFBcnJheT86IFVpbnQ4QXJyYXlcbiAgcHJpdmF0ZSBzb3VyY2U/OiBNZWRpYVN0cmVhbUF1ZGlvU291cmNlTm9kZVxuXG4gIGFzeW5jIGNvbm5lY3RUb1N0cmVhbShzdHJlYW06IE1lZGlhU3RyZWFtKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpXG4gICAgICB0aGlzLmFuYWx5c2VyID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlQW5hbHlzZXIoKVxuICAgICAgXG4gICAgICAvLyBDb25maWd1cmUgZm9yIHNtb290aCB3YXZlZm9ybSB2aXN1YWxpemF0aW9uXG4gICAgICB0aGlzLmFuYWx5c2VyLmZmdFNpemUgPSA2NCAvLyBTbWFsbGVyID0gbGVzcyBkZXRhaWxlZCBidXQgc21vb3RoZXJcbiAgICAgIHRoaXMuYW5hbHlzZXIuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gMC44XG4gICAgICBcbiAgICAgIHRoaXMuZGF0YUFycmF5ID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5hbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudClcbiAgICAgIFxuICAgICAgdGhpcy5zb3VyY2UgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShzdHJlYW0pXG4gICAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMuYW5hbHlzZXIpXG4gICAgICBcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign4p2MIEZhaWxlZCB0byBzZXR1cCBhdWRpbyBhbmFseXNpczonLCBlcnJvcilcbiAgICB9XG4gIH1cblxuICBnZXRXYXZlZm9ybURhdGEoKTogbnVtYmVyW10ge1xuICAgIGlmICghdGhpcy5hbmFseXNlciB8fCAhdGhpcy5kYXRhQXJyYXkpIHJldHVybiBbXVxuICAgIFxuICAgIHRoaXMuYW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEodGhpcy5kYXRhQXJyYXkpXG4gICAgXG4gICAgLy8gQ29udmVydCB0byBub3JtYWxpemVkIHZhbHVlcyAoMC0xKSBmb3IgZWFzaWVyIHN0eWxpbmdcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmRhdGFBcnJheSkubWFwKHZhbHVlID0+IHZhbHVlIC8gMjU1KVxuICB9XG5cbiAgZ2V0Vm9sdW1lKCk6IG51bWJlciB7XG4gICAgaWYgKCF0aGlzLmFuYWx5c2VyIHx8ICF0aGlzLmRhdGFBcnJheSkgcmV0dXJuIDBcbiAgICBcbiAgICB0aGlzLmFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKHRoaXMuZGF0YUFycmF5KVxuICAgIFxuICAgIC8vIENhbGN1bGF0ZSBSTVMgdm9sdW1lXG4gICAgY29uc3Qgc3VtID0gdGhpcy5kYXRhQXJyYXkucmVkdWNlKChhY2MsIHZhbHVlKSA9PiBhY2MgKyAodmFsdWUgKiB2YWx1ZSksIDApXG4gICAgY29uc3Qgcm1zID0gTWF0aC5zcXJ0KHN1bSAvIHRoaXMuZGF0YUFycmF5Lmxlbmd0aClcbiAgICBcbiAgICByZXR1cm4gcm1zIC8gMjU1IC8vIE5vcm1hbGl6ZSB0byAwLTFcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZS5kaXNjb25uZWN0KClcbiAgICAgIHRoaXMuc291cmNlID0gdW5kZWZpbmVkXG4gICAgfVxuICAgIGlmICh0aGlzLmF1ZGlvQ29udGV4dCAmJiB0aGlzLmF1ZGlvQ29udGV4dC5zdGF0ZSAhPT0gJ2Nsb3NlZCcpIHtcbiAgICAgIHRoaXMuYXVkaW9Db250ZXh0LmNsb3NlKClcbiAgICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gdW5kZWZpbmVkXG4gICAgfVxuICAgIHRoaXMuYW5hbHlzZXIgPSB1bmRlZmluZWRcbiAgICB0aGlzLmRhdGFBcnJheSA9IHVuZGVmaW5lZFxuICB9XG59XG5cbi8vIFV0aWxpdHkgRnVuY3Rpb25zXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29weVRvQ2xpcGJvYXJkKHRleHQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gICAgY29uc29sZS5sb2coJ/Cfk4sgVGV4dCBjb3BpZWQgdG8gY2xpcGJvYXJkJylcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBGYWlsZWQgdG8gY29weSB0byBjbGlwYm9hcmQ6JywgZXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJIYXB0aWNGZWVkYmFjayhwYXR0ZXJuOiBudW1iZXJbXSA9IFs1MF0pOiB2b2lkIHtcbiAgaWYgKCd2aWJyYXRlJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICBuYXZpZ2F0b3IudmlicmF0ZShwYXR0ZXJuKVxuICB9XG59XG5cbi8vIEhhcHRpYyBwYXR0ZXJucyBmb3IgZGlmZmVyZW50IGludGVyYWN0aW9uc1xuZXhwb3J0IGNvbnN0IEhhcHRpY1BhdHRlcm5zID0ge1xuICB0YXA6IFs1MF0sICAgICAgICAgICAgICAvLyBRdWljayB0YXAgZmVlZGJhY2tcbiAgbG9uZ1ByZXNzOiBbMTAwXSwgICAgICAgLy8gRmlybSBwcmVzc1xuICByZWNvcmRTdGFydDogWzEwMCwgNTAsIDEwMF0sIC8vIFN0cm9uZy13ZWFrLXN0cm9uZ1xuICByZWNvcmRTdG9wOiBbMjAwXSwgICAgICAvLyBMb25nIGNvbmZpcm1hdGlvblxuICBzdWNjZXNzOiBbNTAsIDUwLCA1MF0sICAvLyBUcmlwbGUgdGFwIGNlbGVicmF0aW9uXG4gIGVycm9yOiBbMTAwLCAxMDBdLCAgICAgIC8vIERvdWJsZSB3YXJuaW5nIGJ1enpcbn0gYXMgY29uc3QiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBb0IsZ0JBQWdCLEVBQUUsU0FBUyxRQUFRLG1CQUFrQjtBQUV6RSw2RUFBNkU7QUFDN0UsT0FBTyxNQUFNO0VBQ0gsY0FBNkI7RUFDN0IsY0FBc0IsRUFBRSxDQUFBO0VBQ3hCLE9BQW9CO0VBRTVCLE1BQU0sb0JBQXNDO0lBQzFDLElBQUk7TUFDRixNQUFNLFNBQVMsTUFBTSxVQUFVLFlBQVksQ0FBQyxZ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
// denoCacheMetadata=2478297773956065742,15607817229306531785