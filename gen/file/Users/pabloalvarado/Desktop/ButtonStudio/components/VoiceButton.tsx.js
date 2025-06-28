import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { AudioRecorder, AudioAnalyzer, copyToClipboard, triggerHapticFeedback, HapticPatterns } from '../utils/audio.ts';
import { VoiceButtonError } from '../types/core.ts';
import { toast } from './Toast.tsx';
// Signals for global state management (like Pablo's reactive Svelte stores)
const buttonState = signal('idle');
const transcript = signal('');
const errorMessage = signal('');
const isClipboardSuccess = signal(false);
const recordingDuration = signal(0);
export default function VoiceButton({ theme = 'amber', size = 'large', customSize, squishiness, chonkiness, customText, buttonShape = 'square', buttonConfig, enableHaptics = true, showTimer = true, showWaveform = true, maxDuration = 300, onComplete, onError, onStateChange, ...props }) {
  const recorderRef = useRef();
  const analyzerRef = useRef();
  const timerRef = useRef();
  // Initialize audio recorder (like Pablo's mediaRecorder setup)
  useEffect(()=>{
    recorderRef.current = new AudioRecorder();
    analyzerRef.current = new AudioAnalyzer();
    return ()=>{
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      analyzerRef.current?.disconnect();
    };
  }, []);
  // Watch state changes and trigger callbacks
  useEffect(()=>{
    onStateChange?.(buttonState.value);
  }, [
    buttonState.value
  ]);
  // Auto-clipboard copy (Pablo's brilliant UX pattern)
  useEffect(()=>{
    if (transcript.value) {
      copyToClipboard(transcript.value).then((success)=>{
        isClipboardSuccess.value = success;
        if (success) {
          toast.success('Voice magic copied! 🎤✨');
        } else {
          toast.error('Oops, clipboard magic failed!');
        }
      });
    }
  }, [
    transcript.value
  ]);
  async function startRecording() {
    try {
      errorMessage.value = '';
      transcript.value = '';
      isClipboardSuccess.value = false;
      recordingDuration.value = 0;
      buttonState.value = 'requesting';
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStart);
      }
      const recorder = recorderRef.current;
      const analyzer = analyzerRef.current;
      // Start recording (using Pablo's proven MediaRecorder logic)
      await recorder.startRecording();
      buttonState.value = 'recording';
      // Connect audio analyzer for waveform
      if (showWaveform) {
        const stream = recorder.getStream();
        if (stream) {
          await analyzer.connectToStream(stream);
        }
      }
      // Start timer (like Pablo's countSec system)
      timerRef.current = setInterval(()=>{
        recordingDuration.value += 1;
        // Auto-stop at max duration
        if (recordingDuration.value >= maxDuration) {
          stopRecording();
        }
        // Haptic pulse every 5 seconds during long recordings
        if (enableHaptics && recordingDuration.value % 5 === 0) {
          triggerHapticFeedback([
            30
          ]);
        }
      }, 1000);
      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('❌ Recording start failed:', error);
      buttonState.value = 'error';
      if (error instanceof VoiceButtonError) {
        errorMessage.value = error.message;
        onError?.(error);
      } else {
        const voiceError = new VoiceButtonError('Failed to start recording', 'RECORDING_FAILED');
        errorMessage.value = voiceError.message;
        onError?.(voiceError);
      }
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.error);
      }
    }
  }
  async function stopRecording() {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
      analyzerRef.current?.disconnect();
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStop);
      }
      buttonState.value = 'processing';
      const recorder = recorderRef.current;
      const audioBlob = await recorder.stopRecording();
      console.log('🤖 Starting Gemini transcription...');
      // Use real Gemini transcription with hardcoded API key
      const { GeminiTranscriptionPlugin } = await import('../plugins/transcription/gemini.ts');
      const geminiPlugin = new GeminiTranscriptionPlugin();
      // Configure and transcribe
      await geminiPlugin.configure({
        apiKey: 'hardcoded'
      }) // API key is hardcoded in plugin
      ;
      const result = await geminiPlugin.transcribe(audioBlob);
      transcript.value = result.text;
      buttonState.value = 'success';
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.success);
      }
      // Trigger success callback (like Pablo's onComplete pattern)
      onComplete?.({
        text: transcript.value,
        confidence: 0.95
      });
      // Auto-return to idle after success celebration
      setTimeout(()=>{
        if (buttonState.value === 'success') {
          buttonState.value = 'idle';
        }
      }, 2000);
      console.log('✅ Transcription completed');
    } catch (error) {
      console.error('❌ Recording stop/transcription failed:', error);
      buttonState.value = 'error';
      if (error instanceof VoiceButtonError) {
        errorMessage.value = error.message;
        onError?.(error);
      } else {
        const voiceError = new VoiceButtonError('Failed to process recording', 'TRANSCRIPTION_FAILED');
        errorMessage.value = voiceError.message;
        onError?.(voiceError);
      }
      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.error);
      }
    }
  }
  function toggleRecording() {
    if (buttonState.value === 'recording') {
      stopRecording();
    } else if (buttonState.value === 'idle' || buttonState.value === 'error') {
      startRecording();
    }
  }
  function resetToIdle() {
    if (buttonState.value === 'error' || buttonState.value === 'success') {
      buttonState.value = 'idle';
      errorMessage.value = '';
      transcript.value = '';
      recordingDuration.value = 0;
    }
  }
  // Dynamic button text (like Pablo's computed buttonLabel)
  function getButtonText() {
    switch(buttonState.value){
      case 'idle':
        return 'Ready';
      case 'requesting':
        return 'Requesting Permission...';
      case 'recording':
        return 'Recording';
      case 'processing':
        return 'Transcribing...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Try Again';
      default:
        return 'Ready';
    }
  }
  // Format timer (like Pablo's covertSecToMinAndHour)
  function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const sec = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
    return `${minutes}:${sec}`;
  }
  // Enhanced Theme Classes with comprehensive customization!
  const getThemeClasses = ()=>{
    const baseClasses = 'relative overflow-hidden transition-all duration-300 ease-out focus:outline-none font-chunky tracking-chunky';
    // Use new config if available, otherwise fall back to legacy props
    const config = buttonConfig || {
      content: {
        text: customText || '🎤',
        autoScale: true
      },
      size: {
        width: customSize ? parseInt(customSize) : 120,
        height: customSize ? parseInt(customSize) : 120
      },
      shape: {
        type: buttonShape,
        borderRadius: parseInt(squishiness || '12')
      },
      appearance: {
        fill: {
          type: 'solid',
          solid: '#FF8FA3',
          gradient: {
            type: 'linear',
            colors: [
              '#FF8FA3',
              '#FFB8CC'
            ],
            direction: 45
          }
        },
        border: {
          width: parseInt(chonkiness || '4'),
          color: '#4A4A4A',
          style: 'solid'
        },
        shadow: {
          type: 'glow',
          color: '#FF6B9D',
          blur: 20,
          spread: 0,
          x: 0,
          y: 0
        }
      }
    };
    // Dynamic sizing with auto-scaling text
    const sizeStyle = `width: ${config.size.width}px; height: ${config.size.height}px;`;
    // Calculate font size based on button size (auto-scaling)
    const fontSize = config.content.autoScale ? Math.max(12, Math.min(48, config.size.width * 0.25)) : 20;
    const fontSizeStyle = `font-size: ${fontSize}px;`;
    // Shape and border radius
    let borderRadiusStyle = '';
    if (config.shape.type === 'circle') {
      borderRadiusStyle = 'border-radius: 50%;';
    } else {
      borderRadiusStyle = `border-radius: ${config.shape.borderRadius}px;`;
    }
    // Background fill (solid or gradient)
    let backgroundStyle = '';
    if (config.appearance.fill.type === 'gradient') {
      const grad = config.appearance.fill.gradient;
      if (grad.type === 'linear') {
        backgroundStyle = `background: linear-gradient(${grad.direction}deg, ${grad.colors[0]}, ${grad.colors[1]});`;
      } else {
        backgroundStyle = `background: radial-gradient(circle, ${grad.colors[0]}, ${grad.colors[1]});`;
      }
    } else {
      backgroundStyle = `background: ${config.appearance.fill.solid};`;
    }
    // Border styling
    const borderStyle = `border: ${config.appearance.border.width}px ${config.appearance.border.style} ${config.appearance.border.color};`;
    // Shadow/glow effects
    let shadowStyle = '';
    const shadow = config.appearance.shadow;
    if (shadow.type !== 'none') {
      if (shadow.type === 'glow') {
        shadowStyle = `box-shadow: 0 0 ${shadow.blur}px ${shadow.spread}px ${shadow.color};`;
      } else if (shadow.type === 'soft') {
        shadowStyle = `box-shadow: ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color};`;
      } else if (shadow.type === 'hard') {
        shadowStyle = `box-shadow: ${shadow.x}px ${shadow.y}px 0px ${shadow.spread}px ${shadow.color};`;
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
    };
    const combinedStyle = `${sizeStyle} ${fontSizeStyle} ${borderRadiusStyle} ${backgroundStyle} ${borderStyle} ${shadowStyle}`;
    return {
      className: `${baseClasses} ${stateClasses[buttonState.value]}`,
      style: combinedStyle,
      config: config
    };
  };
  return /*#__PURE__*/ _jsxs("div", {
    class: "flex flex-col items-center space-y-4 w-full max-w-sm mx-auto",
    children: [
      showWaveform && buttonState.value === 'recording' && /*#__PURE__*/ _jsx("div", {
        class: `w-full p-6 shadow-md ${theme === 'flamingo-brutalist' ? 'flamingo-card border-3 border-flamingo-primary' : 'rounded-2xl bg-white/30 backdrop-blur-voice'}`,
        children: /*#__PURE__*/ _jsx(WaveformVisualizer, {
          analyzer: analyzerRef.current,
          theme: theme
        })
      }),
      /*#__PURE__*/ _jsxs("div", {
        class: "relative inline-block",
        children: [
          buttonState.value === 'recording' && /*#__PURE__*/ _jsx("svg", {
            class: "absolute inset-0 w-full h-full -rotate-90",
            viewBox: "0 0 100 100",
            children: /*#__PURE__*/ _jsx("circle", {
              cx: "50",
              cy: "50",
              r: "48",
              fill: "none",
              stroke: "#FF6B9D",
              strokeWidth: "2",
              strokeDasharray: `${recordingDuration.value / maxDuration * 301.6} 301.6`,
              strokeLinecap: "round",
              class: "transition-all duration-1000"
            })
          }),
          /*#__PURE__*/ _jsx("button", {
            class: getThemeClasses().className,
            style: getThemeClasses().style,
            onClick: toggleRecording,
            disabled: buttonState.value === 'processing' || buttonState.value === 'requesting',
            "aria-label": `Voice recording button - ${getButtonText()}`,
            title: getButtonText(),
            children: buttonState.value === 'recording' && showTimer ? /*#__PURE__*/ _jsx("div", {
              class: "flex items-center justify-center",
              children: /*#__PURE__*/ _jsx("span", {
                class: "font-mono font-bold",
                children: formatTimer(recordingDuration.value)
              })
            }) : getThemeClasses().config.content.text ? /*#__PURE__*/ _jsx("div", {
              class: "flex items-center justify-center w-full h-full",
              children: /*#__PURE__*/ _jsx("span", {
                class: "font-bold leading-none",
                children: getThemeClasses().config.content.text
              })
            }) : /*#__PURE__*/ _jsx(ButtonIcon, {
              state: buttonState.value,
              theme: theme
            })
          })
        ]
      }),
      /*#__PURE__*/ _jsxs("div", {
        class: "text-center",
        children: [
          /*#__PURE__*/ _jsx("p", {
            class: `text-xl font-chunky tracking-wide ${theme === 'flamingo-brutalist' ? 'text-flamingo-charcoal' : 'text-gray-800'}`,
            children: getButtonText()
          }),
          showTimer && buttonState.value === 'recording' && /*#__PURE__*/ _jsx("p", {
            class: `text-base font-medium mt-2 ${theme === 'flamingo-brutalist' ? 'text-flamingo-purple' : 'text-gray-600'}`,
            children: formatTimer(recordingDuration.value)
          })
        ]
      }),
      buttonState.value === 'processing' && /*#__PURE__*/ _jsx("div", {
        class: "flex justify-center",
        children: /*#__PURE__*/ _jsx("div", {
          class: `w-10 h-10 border-4 ${theme === 'flamingo-brutalist' ? 'border-flamingo-primary border-t-transparent' : 'border-voice-primary border-t-transparent'} rounded-full animate-spin`
        })
      }),
      errorMessage.value && /*#__PURE__*/ _jsxs("div", {
        class: `w-full text-center p-6 ${theme === 'flamingo-brutalist' ? 'flamingo-card' : 'bg-red-50 rounded-lg border border-red-200'}`,
        children: [
          /*#__PURE__*/ _jsx("p", {
            class: `font-medium mb-4 ${theme === 'flamingo-brutalist' ? 'text-flamingo-coral text-lg' : 'text-red-500'}`,
            children: errorMessage.value
          }),
          /*#__PURE__*/ _jsx("button", {
            class: `font-medium underline transition-colors ${theme === 'flamingo-brutalist' ? 'text-flamingo-purple hover:text-flamingo-charcoal' : 'text-red-600 hover:text-red-700'}`,
            onClick: resetToIdle,
            children: "Dismiss"
          })
        ]
      }),
      transcript.value && /*#__PURE__*/ _jsx("div", {
        class: "w-full space-y-6",
        children: /*#__PURE__*/ _jsx("div", {
          class: `w-full whitespace-pre-line p-8 font-mono text-base leading-relaxed shadow-lg ${theme === 'flamingo-brutalist' ? 'flamingo-card text-flamingo-charcoal border-3 border-flamingo-purple' : 'rounded-3xl border border-gray-100 bg-white text-gray-800'}`,
          children: transcript.value
        })
      })
    ]
  });
}
// Button Icon Component (chunky and theme-aware)
function ButtonIcon({ state, theme }) {
  // Bigger icons for brutalist theme
  const iconClasses = theme === 'flamingo-brutalist' ? "w-12 h-12 mx-auto" : "w-8 h-8 mx-auto";
  switch(state){
    case 'idle':
      return /*#__PURE__*/ _jsxs("svg", {
        class: iconClasses,
        fill: "currentColor",
        viewBox: "0 0 24 24",
        children: [
          /*#__PURE__*/ _jsx("path", {
            d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z",
            strokeWidth: "1.5"
          }),
          /*#__PURE__*/ _jsx("path", {
            d: "M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V21H9v2h6v-2h-2v-.06A9 9 0 0 0 21 12v-2h-2z",
            strokeWidth: "1.5"
          })
        ]
      });
    case 'recording':
      return /*#__PURE__*/ _jsx("svg", {
        class: iconClasses,
        fill: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ _jsx("circle", {
          cx: "12",
          cy: "12",
          r: "6",
          strokeWidth: "2"
        })
      });
    case 'processing':
      return /*#__PURE__*/ _jsx("svg", {
        class: `${iconClasses} animate-spin`,
        fill: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ _jsx("path", {
          d: "M12 2v2a8 8 0 0 1 8 8h2a10 10 0 0 0-10-10z",
          strokeWidth: "2"
        })
      });
    case 'success':
      return /*#__PURE__*/ _jsx("svg", {
        class: iconClasses,
        fill: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ _jsx("path", {
          d: "M9 16.2l-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
          strokeWidth: "2"
        })
      });
    case 'error':
      return /*#__PURE__*/ _jsx("svg", {
        class: iconClasses,
        fill: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ _jsx("path", {
          d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
          strokeWidth: "1.5"
        })
      });
    default:
      return /*#__PURE__*/ _jsx("svg", {
        class: iconClasses,
        fill: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ _jsx("path", {
          d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        })
      });
  }
}
// Waveform Visualizer Component (like Pablo's AudioVisualizer.svelte)
function WaveformVisualizer({ analyzer, theme }) {
  const canvasRef = useRef(null);
  useEffect(()=>{
    if (!analyzer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    function draw() {
      if (!analyzer || !canvas || !ctx) return;
      const waveformData = analyzer.getWaveformData();
      const { width, height } = canvas;
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      // Draw waveform bars
      const barWidth = width / waveformData.length;
      const centerY = height / 2;
      // Use theme-appropriate colors
      const color = theme === 'flamingo-brutalist' ? '#FF6B9D' : '#f59e0b';
      ctx.fillStyle = color;
      waveformData.forEach((value, index)=>{
        const barHeight = value * height * 0.8 // Scale to 80% of canvas height
        ;
        const x = index * barWidth;
        const y = centerY - barHeight / 2;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
      requestAnimationFrame(draw);
    }
    draw();
  }, [
    analyzer
  ]);
  return /*#__PURE__*/ _jsx("canvas", {
    ref: canvasRef,
    width: 400,
    height: 80,
    class: "w-full h-20 rounded-lg",
    style: {
      background: 'transparent'
    }
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby9jb21wb25lbnRzL1ZvaWNlQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaWduYWwgfSBmcm9tICdAcHJlYWN0L3NpZ25hbHMnXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3ByZWFjdC9ob29rcydcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIsIEF1ZGlvQW5hbHl6ZXIsIGNvcHlUb0NsaXBib2FyZCwgdHJpZ2dlckhhcHRpY0ZlZWRiYWNrLCBIYXB0aWNQYXR0ZXJucyB9IGZyb20gJy4uL3V0aWxzL2F1ZGlvLnRzJ1xuaW1wb3J0IHsgQnV0dG9uU3RhdGUsIFZvaWNlQnV0dG9uRXJyb3IsIFRoZW1lSWQsIEJ1dHRvblNpemUgfSBmcm9tICcuLi90eXBlcy9jb3JlLnRzJ1xuaW1wb3J0IHsgVHJhbnNjcmlwdGlvblBsdWdpbiwgT3V0cHV0UGx1Z2luIH0gZnJvbSAnLi4vdHlwZXMvcGx1Z2lucy50cydcbmltcG9ydCB7IHRvYXN0IH0gZnJvbSAnLi9Ub2FzdC50c3gnXG5cbi8vIFNpZ25hbHMgZm9yIGdsb2JhbCBzdGF0ZSBtYW5hZ2VtZW50IChsaWtlIFBhYmxvJ3MgcmVhY3RpdmUgU3ZlbHRlIHN0b3JlcylcbmNvbnN0IGJ1dHRvblN0YXRlID0gc2lnbmFsPEJ1dHRvblN0YXRlPignaWRsZScpXG5jb25zdCB0cmFuc2NyaXB0ID0gc2lnbmFsPHN0cmluZz4oJycpXG5jb25zdCBlcnJvck1lc3NhZ2UgPSBzaWduYWw8c3RyaW5nPignJylcbmNvbnN0IGlzQ2xpcGJvYXJkU3VjY2VzcyA9IHNpZ25hbDxib29sZWFuPihmYWxzZSlcbmNvbnN0IHJlY29yZGluZ0R1cmF0aW9uID0gc2lnbmFsPG51bWJlcj4oMClcblxuaW50ZXJmYWNlIFZvaWNlQnV0dG9uUHJvcHMge1xuICAvLyBDb3JlIGZ1bmN0aW9uYWxpdHlcbiAgdHJhbnNjcmlwdGlvblBsdWdpbj86IFRyYW5zY3JpcHRpb25QbHVnaW5cbiAgb3V0cHV0UGx1Z2luPzogT3V0cHV0UGx1Z2luXG4gIFxuICAvLyBBcHBlYXJhbmNlXG4gIHRoZW1lPzogVGhlbWVJZFxuICBzaXplPzogQnV0dG9uU2l6ZVxuICBjdXN0b21DU1M/OiBzdHJpbmdcbiAgXG4gIC8vIFN0dWRpbyBjdXN0b21pemF0aW9uIHByb3BzIChsZWdhY3kgc3VwcG9ydClcbiAgY3VzdG9tU2l6ZT86IHN0cmluZ1xuICBzcXVpc2hpbmVzcz86IHN0cmluZ1xuICBjaG9ua2luZXNzPzogc3RyaW5nXG4gIGdsb3dJbnRlbnNpdHk/OiBudW1iZXJcbiAgY3VzdG9tVGV4dD86IHN0cmluZ1xuICBidXR0b25TaGFwZT86ICdjaXJjbGUnIHwgJ3NxdWFyZScgfCAncmVjdGFuZ2xlJ1xuICBcbiAgLy8gTmV3IGNvbXByZWhlbnNpdmUgY29uZmlnXG4gIGJ1dHRvbkNvbmZpZz86IHtcbiAgICBjb250ZW50OiB7IHRleHQ6IHN0cmluZywgYXV0b1NjYWxlOiBib29sZWFuIH1cbiAgICBzaXplOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtYWludGFpblJhdGlvPzogYm9vbGVhbiB9XG4gICAgc2hhcGU6IHsgdHlwZTogJ2NpcmNsZScgfCAnc3F1YXJlJyB8ICdyZWN0YW5nbGUnLCBib3JkZXJSYWRpdXM6IG51bWJlciB9XG4gICAgYXBwZWFyYW5jZToge1xuICAgICAgZmlsbDoge1xuICAgICAgICB0eXBlOiAnc29saWQnIHwgJ2dyYWRpZW50J1xuICAgICAgICBzb2xpZDogc3RyaW5nXG4gICAgICAgIGdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogJ2xpbmVhcicgfCAncmFkaWFsJ1xuICAgICAgICAgIGNvbG9yczogW3N0cmluZywgc3RyaW5nXVxuICAgICAgICAgIGRpcmVjdGlvbjogbnVtYmVyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJvcmRlcjogeyB3aWR0aDogbnVtYmVyLCBjb2xvcjogc3RyaW5nLCBzdHlsZTogJ3NvbGlkJyB8ICdkYXNoZWQnIHwgJ2RvdHRlZCcgfVxuICAgICAgc2hhZG93OiB7XG4gICAgICAgIHR5cGU6ICdub25lJyB8ICdzb2Z0JyB8ICdoYXJkJyB8ICdnbG93J1xuICAgICAgICBjb2xvcjogc3RyaW5nXG4gICAgICAgIGJsdXI6IG51bWJlclxuICAgICAgICBzcHJlYWQ6IG51bWJlclxuICAgICAgICB4OiBudW1iZXJcbiAgICAgICAgeTogbnVtYmVyXG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICAvLyBCZWhhdmlvclxuICBhdXRvU3RhcnQ/OiBib29sZWFuXG4gIG1heER1cmF0aW9uPzogbnVtYmVyXG4gIGVuYWJsZUhhcHRpY3M/OiBib29sZWFuXG4gIGVuYWJsZVNvdW5kcz86IGJvb2xlYW5cbiAgc2hvd1RpbWVyPzogYm9vbGVhblxuICBzaG93V2F2ZWZvcm0/OiBib29sZWFuXG4gIFxuICAvLyBFdmVudCBjYWxsYmFja3MgKGxpa2UgUGFibG8ncyBvbkNvbXBsZXRlIHBhdHRlcm4pXG4gIG9uQ29tcGxldGU/OiAocmVzdWx0OiB7IHRleHQ6IHN0cmluZywgY29uZmlkZW5jZTogbnVtYmVyIH0pID0+IHZvaWRcbiAgb25FcnJvcj86IChlcnJvcjogVm9pY2VCdXR0b25FcnJvcikgPT4gdm9pZFxuICBvblN0YXRlQ2hhbmdlPzogKHN0YXRlOiBCdXR0b25TdGF0ZSkgPT4gdm9pZFxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBWb2ljZUJ1dHRvbih7XG4gIHRoZW1lID0gJ2FtYmVyJyxcbiAgc2l6ZSA9ICdsYXJnZScsXG4gIGN1c3RvbVNpemUsXG4gIHNxdWlzaGluZXNzLFxuICBjaG9ua2luZXNzLCBcbiAgY3VzdG9tVGV4dCxcbiAgYnV0dG9uU2hhcGUgPSAnc3F1YXJlJyxcbiAgYnV0dG9uQ29uZmlnLFxuICBlbmFibGVIYXB0aWNzID0gdHJ1ZSxcbiAgc2hvd1RpbWVyID0gdHJ1ZSxcbiAgc2hvd1dhdmVmb3JtID0gdHJ1ZSxcbiAgbWF4RHVyYXRpb24gPSAzMDAsIC8vIDUgbWludXRlcyBsaWtlIFBhYmxvJ3Mgc2V0dXBcbiAgb25Db21wbGV0ZSxcbiAgb25FcnJvcixcbiAgb25TdGF0ZUNoYW5nZSxcbiAgLi4ucHJvcHNcbn06IFZvaWNlQnV0dG9uUHJvcHMpIHtcbiAgXG4gIGNvbnN0IHJlY29yZGVyUmVmID0gdXNlUmVmPEF1ZGlvUmVjb3JkZXI+KClcbiAgY29uc3QgYW5hbHl6ZXJSZWYgPSB1c2VSZWY8QXVkaW9BbmFseXplcj4oKVxuICBjb25zdCB0aW1lclJlZiA9IHVzZVJlZjxudW1iZXI+KClcbiAgXG4gIC8vIEluaXRpYWxpemUgYXVkaW8gcmVjb3JkZXIgKGxpa2UgUGFibG8ncyBtZWRpYVJlY29yZGVyIHNldHVwKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJlY29yZGVyUmVmLmN1cnJlbnQgPSBuZXcgQXVkaW9SZWNvcmRlcigpXG4gICAgYW5hbHl6ZXJSZWYuY3VycmVudCA9IG5ldyBBdWRpb0FuYWx5emVyKClcbiAgICBcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gQ2xlYW51cCBvbiB1bm1vdW50XG4gICAgICBpZiAodGltZXJSZWYuY3VycmVudCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyUmVmLmN1cnJlbnQpXG4gICAgICB9XG4gICAgICBhbmFseXplclJlZi5jdXJyZW50Py5kaXNjb25uZWN0KClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIC8vIFdhdGNoIHN0YXRlIGNoYW5nZXMgYW5kIHRyaWdnZXIgY2FsbGJhY2tzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgb25TdGF0ZUNoYW5nZT8uKGJ1dHRvblN0YXRlLnZhbHVlKVxuICB9LCBbYnV0dG9uU3RhdGUudmFsdWVdKVxuXG4gIC8vIEF1dG8tY2xpcGJvYXJkIGNvcHkgKFBhYmxvJ3MgYnJpbGxpYW50IFVYIHBhdHRlcm4pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHRyYW5zY3JpcHQudmFsdWUpIHtcbiAgICAgIGNvcHlUb0NsaXBib2FyZCh0cmFuc2NyaXB0LnZhbHVlKS50aGVuKHN1Y2Nlc3MgPT4ge1xuICAgICAgICBpc0NsaXBib2FyZFN1Y2Nlc3MudmFsdWUgPSBzdWNjZXNzXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgdG9hc3Quc3VjY2VzcygnVm9pY2UgbWFnaWMgY29waWVkISDwn46k4pyoJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcignT29wcywgY2xpcGJvYXJkIG1hZ2ljIGZhaWxlZCEnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSwgW3RyYW5zY3JpcHQudmFsdWVdKVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHN0YXJ0UmVjb3JkaW5nKCkge1xuICAgIHRyeSB7XG4gICAgICBlcnJvck1lc3NhZ2UudmFsdWUgPSAnJ1xuICAgICAgdHJhbnNjcmlwdC52YWx1ZSA9ICcnXG4gICAgICBpc0NsaXBib2FyZFN1Y2Nlc3MudmFsdWUgPSBmYWxzZVxuICAgICAgcmVjb3JkaW5nRHVyYXRpb24udmFsdWUgPSAwXG4gICAgICBcbiAgICAgIGJ1dHRvblN0YXRlLnZhbHVlID0gJ3JlcXVlc3RpbmcnXG4gICAgICBcbiAgICAgIGlmIChlbmFibGVIYXB0aWNzKSB7XG4gICAgICAgIHRyaWdnZXJIYXB0aWNGZWVkYmFjayhIYXB0aWNQYXR0ZXJucy5yZWNvcmRTdGFydClcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgcmVjb3JkZXIgPSByZWNvcmRlclJlZi5jdXJyZW50IVxuICAgICAgY29uc3QgYW5hbHl6ZXIgPSBhbmFseXplclJlZi5jdXJyZW50IVxuICAgICAgXG4gICAgICAvLyBTdGFydCByZWNvcmRpbmcgKHVzaW5nIFBhYmxvJ3MgcHJvdmVuIE1lZGlhUmVjb3JkZXIgbG9naWMpXG4gICAgICBhd2FpdCByZWNvcmRlci5zdGFydFJlY29yZGluZygpXG4gICAgICBcbiAgICAgIGJ1dHRvblN0YXRlLnZhbHVlID0gJ3JlY29yZGluZydcbiAgICAgIFxuICAgICAgLy8gQ29ubmVjdCBhdWRpbyBhbmFseXplciBmb3Igd2F2ZWZvcm1cbiAgICAgIGlmIChzaG93V2F2ZWZvcm0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gcmVjb3JkZXIuZ2V0U3RyZWFtKClcbiAgICAgICAgaWYgKHN0cmVhbSkge1xuICAgICAgICAgIGF3YWl0IGFuYWx5emVyLmNvbm5lY3RUb1N0cmVhbShzdHJlYW0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU3RhcnQgdGltZXIgKGxpa2UgUGFibG8ncyBjb3VudFNlYyBzeXN0ZW0pXG4gICAgICB0aW1lclJlZi5jdXJyZW50ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICByZWNvcmRpbmdEdXJhdGlvbi52YWx1ZSArPSAxXG4gICAgICAgIFxuICAgICAgICAvLyBBdXRvLXN0b3AgYXQgbWF4IGR1cmF0aW9uXG4gICAgICAgIGlmIChyZWNvcmRpbmdEdXJhdGlvbi52YWx1ZSA+PSBtYXhEdXJhdGlvbikge1xuICAgICAgICAgIHN0b3BSZWNvcmRpbmcoKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBIYXB0aWMgcHVsc2UgZXZlcnkgNSBzZWNvbmRzIGR1cmluZyBsb25nIHJlY29yZGluZ3NcbiAgICAgICAgaWYgKGVuYWJsZUhhcHRpY3MgJiYgcmVjb3JkaW5nRHVyYXRpb24udmFsdWUgJSA1ID09PSAwKSB7XG4gICAgICAgICAgdHJpZ2dlckhhcHRpY0ZlZWRiYWNrKFszMF0pXG4gICAgICAgIH1cbiAgICAgIH0sIDEwMDApXG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgUmVjb3JkaW5nIHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5JylcbiAgICAgIFxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgUmVjb3JkaW5nIHN0YXJ0IGZhaWxlZDonLCBlcnJvcilcbiAgICAgIGJ1dHRvblN0YXRlLnZhbHVlID0gJ2Vycm9yJ1xuICAgICAgXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBWb2ljZUJ1dHRvbkVycm9yKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZS52YWx1ZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgb25FcnJvcj8uKGVycm9yKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgdm9pY2VFcnJvciA9IG5ldyBWb2ljZUJ1dHRvbkVycm9yKCdGYWlsZWQgdG8gc3RhcnQgcmVjb3JkaW5nJywgJ1JFQ09SRElOR19GQUlMRUQnIGFzIGFueSlcbiAgICAgICAgZXJyb3JNZXNzYWdlLnZhbHVlID0gdm9pY2VFcnJvci5tZXNzYWdlXG4gICAgICAgIG9uRXJyb3I/Lih2b2ljZUVycm9yKVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZW5hYmxlSGFwdGljcykge1xuICAgICAgICB0cmlnZ2VySGFwdGljRmVlZGJhY2soSGFwdGljUGF0dGVybnMuZXJyb3IpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gc3RvcFJlY29yZGluZygpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHRpbWVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lclJlZi5jdXJyZW50KVxuICAgICAgICB0aW1lclJlZi5jdXJyZW50ID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICBcbiAgICAgIGFuYWx5emVyUmVmLmN1cnJlbnQ/LmRpc2Nvbm5lY3QoKVxuICAgICAgXG4gICAgICBpZiAoZW5hYmxlSGFwdGljcykge1xuICAgICAgICB0cmlnZ2VySGFwdGljRmVlZGJhY2soSGFwdGljUGF0dGVybnMucmVjb3JkU3RvcClcbiAgICAgIH1cbiAgICAgIFxuICAgICAgYnV0dG9uU3RhdGUudmFsdWUgPSAncHJvY2Vzc2luZydcbiAgICAgIFxuICAgICAgY29uc3QgcmVjb3JkZXIgPSByZWNvcmRlclJlZi5jdXJyZW50IVxuICAgICAgY29uc3QgYXVkaW9CbG9iID0gYXdhaXQgcmVjb3JkZXIuc3RvcFJlY29yZGluZygpXG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCfwn6SWIFN0YXJ0aW5nIEdlbWluaSB0cmFuc2NyaXB0aW9uLi4uJylcbiAgICAgIFxuICAgICAgLy8gVXNlIHJlYWwgR2VtaW5pIHRyYW5zY3JpcHRpb24gd2l0aCBoYXJkY29kZWQgQVBJIGtleVxuICAgICAgY29uc3QgeyBHZW1pbmlUcmFuc2NyaXB0aW9uUGx1Z2luIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3BsdWdpbnMvdHJhbnNjcmlwdGlvbi9nZW1pbmkudHMnKVxuICAgICAgY29uc3QgZ2VtaW5pUGx1Z2luID0gbmV3IEdlbWluaVRyYW5zY3JpcHRpb25QbHVnaW4oKVxuICAgICAgXG4gICAgICAvLyBDb25maWd1cmUgYW5kIHRyYW5zY3JpYmVcbiAgICAgIGF3YWl0IGdlbWluaVBsdWdpbi5jb25maWd1cmUoeyBhcGlLZXk6ICdoYXJkY29kZWQnIH0pIC8vIEFQSSBrZXkgaXMgaGFyZGNvZGVkIGluIHBsdWdpblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2VtaW5pUGx1Z2luLnRyYW5zY3JpYmUoYXVkaW9CbG9iKVxuICAgICAgdHJhbnNjcmlwdC52YWx1ZSA9IHJlc3VsdC50ZXh0XG4gICAgICBcbiAgICAgIGJ1dHRvblN0YXRlLnZhbHVlID0gJ3N1Y2Nlc3MnXG4gICAgICBcbiAgICAgIGlmIChlbmFibGVIYXB0aWNzKSB7XG4gICAgICAgIHRyaWdnZXJIYXB0aWNGZWVkYmFjayhIYXB0aWNQYXR0ZXJucy5zdWNjZXNzKVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUcmlnZ2VyIHN1Y2Nlc3MgY2FsbGJhY2sgKGxpa2UgUGFibG8ncyBvbkNvbXBsZXRlIHBhdHRlcm4pXG4gICAgICBvbkNvbXBsZXRlPy4oeyBcbiAgICAgICAgdGV4dDogdHJhbnNjcmlwdC52YWx1ZSwgXG4gICAgICAgIGNvbmZpZGVuY2U6IDAuOTUgXG4gICAgICB9KVxuICAgICAgXG4gICAgICAvLyBBdXRvLXJldHVybiB0byBpZGxlIGFmdGVyIHN1Y2Nlc3MgY2VsZWJyYXRpb25cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoYnV0dG9uU3RhdGUudmFsdWUgPT09ICdzdWNjZXNzJykge1xuICAgICAgICAgIGJ1dHRvblN0YXRlLnZhbHVlID0gJ2lkbGUnXG4gICAgICAgIH1cbiAgICAgIH0sIDIwMDApXG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgVHJhbnNjcmlwdGlvbiBjb21wbGV0ZWQnKVxuICAgICAgXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBSZWNvcmRpbmcgc3RvcC90cmFuc2NyaXB0aW9uIGZhaWxlZDonLCBlcnJvcilcbiAgICAgIGJ1dHRvblN0YXRlLnZhbHVlID0gJ2Vycm9yJ1xuICAgICAgXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBWb2ljZUJ1dHRvbkVycm9yKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZS52YWx1ZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgb25FcnJvcj8uKGVycm9yKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgdm9pY2VFcnJvciA9IG5ldyBWb2ljZUJ1dHRvbkVycm9yKCdGYWlsZWQgdG8gcHJvY2VzcyByZWNvcmRpbmcnLCAnVFJBTlNDUklQVElPTl9GQUlMRUQnIGFzIGFueSlcbiAgICAgICAgZXJyb3JNZXNzYWdlLnZhbHVlID0gdm9pY2VFcnJvci5tZXNzYWdlXG4gICAgICAgIG9uRXJyb3I/Lih2b2ljZUVycm9yKVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZW5hYmxlSGFwdGljcykge1xuICAgICAgICB0cmlnZ2VySGFwdGljRmVlZGJhY2soSGFwdGljUGF0dGVybnMuZXJyb3IpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlUmVjb3JkaW5nKCkge1xuICAgIGlmIChidXR0b25TdGF0ZS52YWx1ZSA9PT0gJ3JlY29yZGluZycpIHtcbiAgICAgIHN0b3BSZWNvcmRpbmcoKVxuICAgIH0gZWxzZSBpZiAoYnV0dG9uU3RhdGUudmFsdWUgPT09ICdpZGxlJyB8fCBidXR0b25TdGF0ZS52YWx1ZSA9PT0gJ2Vycm9yJykge1xuICAgICAgc3RhcnRSZWNvcmRpbmcoKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VG9JZGxlKCkge1xuICAgIGlmIChidXR0b25TdGF0ZS52YWx1ZSA9PT0gJ2Vycm9yJyB8fCBidXR0b25TdGF0ZS52YWx1ZSA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICBidXR0b25TdGF0ZS52YWx1ZSA9ICdpZGxlJ1xuICAgICAgZXJyb3JNZXNzYWdlLnZhbHVlID0gJydcbiAgICAgIHRyYW5zY3JpcHQudmFsdWUgPSAnJ1xuICAgICAgcmVjb3JkaW5nRHVyYXRpb24udmFsdWUgPSAwXG4gICAgfVxuICB9XG5cbiAgLy8gRHluYW1pYyBidXR0b24gdGV4dCAobGlrZSBQYWJsbydzIGNvbXB1dGVkIGJ1dHRvbkxhYmVsKVxuICBmdW5jdGlvbiBnZXRCdXR0b25UZXh0KCk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChidXR0b25TdGF0ZS52YWx1ZSkge1xuICAgICAgY2FzZSAnaWRsZSc6XG4gICAgICAgIHJldHVybiAnUmVhZHknXG4gICAgICBjYXNlICdyZXF1ZXN0aW5nJzpcbiAgICAgICAgcmV0dXJuICdSZXF1ZXN0aW5nIFBlcm1pc3Npb24uLi4nXG4gICAgICBjYXNlICdyZWNvcmRpbmcnOlxuICAgICAgICByZXR1cm4gJ1JlY29yZGluZydcbiAgICAgIGNhc2UgJ3Byb2Nlc3NpbmcnOlxuICAgICAgICByZXR1cm4gJ1RyYW5zY3JpYmluZy4uLidcbiAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICByZXR1cm4gJ1N1Y2Nlc3MhJ1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICByZXR1cm4gJ1RyeSBBZ2FpbidcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnUmVhZHknXG4gICAgfVxuICB9XG5cbiAgLy8gRm9ybWF0IHRpbWVyIChsaWtlIFBhYmxvJ3MgY292ZXJ0U2VjVG9NaW5BbmRIb3VyKVxuICBmdW5jdGlvbiBmb3JtYXRUaW1lcihzZWNvbmRzOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyA2MClcbiAgICBjb25zdCByZW1haW5pbmdTZWNvbmRzID0gc2Vjb25kcyAlIDYwXG4gICAgY29uc3Qgc2VjID0gcmVtYWluaW5nU2Vjb25kcyA8IDEwID8gYDAke3JlbWFpbmluZ1NlY29uZHN9YCA6IGAke3JlbWFpbmluZ1NlY29uZHN9YFxuICAgIHJldHVybiBgJHttaW51dGVzfToke3NlY31gXG4gIH1cblxuICAvLyBFbmhhbmNlZCBUaGVtZSBDbGFzc2VzIHdpdGggY29tcHJlaGVuc2l2ZSBjdXN0b21pemF0aW9uIVxuICBjb25zdCBnZXRUaGVtZUNsYXNzZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgYmFzZUNsYXNzZXMgPSAncmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCBlYXNlLW91dCBmb2N1czpvdXRsaW5lLW5vbmUgZm9udC1jaHVua3kgdHJhY2tpbmctY2h1bmt5J1xuICAgIFxuICAgIC8vIFVzZSBuZXcgY29uZmlnIGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGwgYmFjayB0byBsZWdhY3kgcHJvcHNcbiAgICBjb25zdCBjb25maWcgPSBidXR0b25Db25maWcgfHwge1xuICAgICAgY29udGVudDogeyB0ZXh0OiBjdXN0b21UZXh0IHx8ICfwn46kJywgYXV0b1NjYWxlOiB0cnVlIH0sXG4gICAgICBzaXplOiB7IHdpZHRoOiBjdXN0b21TaXplID8gcGFyc2VJbnQoY3VzdG9tU2l6ZSkgOiAxMjAsIGhlaWdodDogY3VzdG9tU2l6ZSA/IHBhcnNlSW50KGN1c3RvbVNpemUpIDogMTIwIH0sXG4gICAgICBzaGFwZTogeyB0eXBlOiBidXR0b25TaGFwZSwgYm9yZGVyUmFkaXVzOiBwYXJzZUludChzcXVpc2hpbmVzcyB8fCAnMTInKSB9LFxuICAgICAgYXBwZWFyYW5jZToge1xuICAgICAgICBmaWxsOiB7IHR5cGU6ICdzb2xpZCcgYXMgY29uc3QsIHNvbGlkOiAnI0ZGOEZBMycsIGdyYWRpZW50OiB7IHR5cGU6ICdsaW5lYXInIGFzIGNvbnN0LCBjb2xvcnM6IFsnI0ZGOEZBMycsICcjRkZCOENDJ10sIGRpcmVjdGlvbjogNDUgfX0sXG4gICAgICAgIGJvcmRlcjogeyB3aWR0aDogcGFyc2VJbnQoY2hvbmtpbmVzcyB8fCAnNCcpLCBjb2xvcjogJyM0QTRBNEEnLCBzdHlsZTogJ3NvbGlkJyBhcyBjb25zdCB9LFxuICAgICAgICBzaGFkb3c6IHsgdHlwZTogJ2dsb3cnIGFzIGNvbnN0LCBjb2xvcjogJyNGRjZCOUQnLCBibHVyOiAyMCwgc3ByZWFkOiAwLCB4OiAwLCB5OiAwIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gRHluYW1pYyBzaXppbmcgd2l0aCBhdXRvLXNjYWxpbmcgdGV4dFxuICAgIGNvbnN0IHNpemVTdHlsZSA9IGB3aWR0aDogJHtjb25maWcuc2l6ZS53aWR0aH1weDsgaGVpZ2h0OiAke2NvbmZpZy5zaXplLmhlaWdodH1weDtgXG4gICAgXG4gICAgLy8gQ2FsY3VsYXRlIGZvbnQgc2l6ZSBiYXNlZCBvbiBidXR0b24gc2l6ZSAoYXV0by1zY2FsaW5nKVxuICAgIGNvbnN0IGZvbnRTaXplID0gY29uZmlnLmNvbnRlbnQuYXV0b1NjYWxlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKDQ4LCBjb25maWcuc2l6ZS53aWR0aCAqIDAuMjUpKSA6IDIwXG4gICAgY29uc3QgZm9udFNpemVTdHlsZSA9IGBmb250LXNpemU6ICR7Zm9udFNpemV9cHg7YFxuICAgIFxuICAgIC8vIFNoYXBlIGFuZCBib3JkZXIgcmFkaXVzXG4gICAgbGV0IGJvcmRlclJhZGl1c1N0eWxlID0gJydcbiAgICBpZiAoY29uZmlnLnNoYXBlLnR5cGUgPT09ICdjaXJjbGUnKSB7XG4gICAgICBib3JkZXJSYWRpdXNTdHlsZSA9ICdib3JkZXItcmFkaXVzOiA1MCU7J1xuICAgIH0gZWxzZSB7XG4gICAgICBib3JkZXJSYWRpdXNTdHlsZSA9IGBib3JkZXItcmFkaXVzOiAke2NvbmZpZy5zaGFwZS5ib3JkZXJSYWRpdXN9cHg7YFxuICAgIH1cbiAgICBcbiAgICAvLyBCYWNrZ3JvdW5kIGZpbGwgKHNvbGlkIG9yIGdyYWRpZW50KVxuICAgIGxldCBiYWNrZ3JvdW5kU3R5bGUgPSAnJ1xuICAgIGlmIChjb25maWcuYXBwZWFyYW5jZS5maWxsLnR5cGUgPT09ICdncmFkaWVudCcpIHtcbiAgICAgIGNvbnN0IGdyYWQgPSBjb25maWcuYXBwZWFyYW5jZS5maWxsLmdyYWRpZW50XG4gICAgICBpZiAoZ3JhZC50eXBlID09PSAnbGluZWFyJykge1xuICAgICAgICBiYWNrZ3JvdW5kU3R5bGUgPSBgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KCR7Z3JhZC5kaXJlY3Rpb259ZGVnLCAke2dyYWQuY29sb3JzWzBdfSwgJHtncmFkLmNvbG9yc1sxXX0pO2BcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJhY2tncm91bmRTdHlsZSA9IGBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlLCAke2dyYWQuY29sb3JzWzBdfSwgJHtncmFkLmNvbG9yc1sxXX0pO2BcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYmFja2dyb3VuZFN0eWxlID0gYGJhY2tncm91bmQ6ICR7Y29uZmlnLmFwcGVhcmFuY2UuZmlsbC5zb2xpZH07YFxuICAgIH1cbiAgICBcbiAgICAvLyBCb3JkZXIgc3R5bGluZ1xuICAgIGNvbnN0IGJvcmRlclN0eWxlID0gYGJvcmRlcjogJHtjb25maWcuYXBwZWFyYW5jZS5ib3JkZXIud2lkdGh9cHggJHtjb25maWcuYXBwZWFyYW5jZS5ib3JkZXIuc3R5bGV9ICR7Y29uZmlnLmFwcGVhcmFuY2UuYm9yZGVyLmNvbG9yfTtgXG4gICAgXG4gICAgLy8gU2hhZG93L2dsb3cgZWZmZWN0c1xuICAgIGxldCBzaGFkb3dTdHlsZSA9ICcnXG4gICAgY29uc3Qgc2hhZG93ID0gY29uZmlnLmFwcGVhcmFuY2Uuc2hhZG93XG4gICAgaWYgKHNoYWRvdy50eXBlICE9PSAnbm9uZScpIHtcbiAgICAgIGlmIChzaGFkb3cudHlwZSA9PT0gJ2dsb3cnKSB7XG4gICAgICAgIHNoYWRvd1N0eWxlID0gYGJveC1zaGFkb3c6IDAgMCAke3NoYWRvdy5ibHVyfXB4ICR7c2hhZG93LnNwcmVhZH1weCAke3NoYWRvdy5jb2xvcn07YFxuICAgICAgfSBlbHNlIGlmIChzaGFkb3cudHlwZSA9PT0gJ3NvZnQnKSB7XG4gICAgICAgIHNoYWRvd1N0eWxlID0gYGJveC1zaGFkb3c6ICR7c2hhZG93Lnh9cHggJHtzaGFkb3cueX1weCAke3NoYWRvdy5ibHVyfXB4ICR7c2hhZG93LnNwcmVhZH1weCAke3NoYWRvdy5jb2xvcn07YFxuICAgICAgfSBlbHNlIGlmIChzaGFkb3cudHlwZSA9PT0gJ2hhcmQnKSB7XG4gICAgICAgIHNoYWRvd1N0eWxlID0gYGJveC1zaGFkb3c6ICR7c2hhZG93Lnh9cHggJHtzaGFkb3cueX1weCAwcHggJHtzaGFkb3cuc3ByZWFkfXB4ICR7c2hhZG93LmNvbG9yfTtgXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFN0YXRlLWJhc2VkIGFuaW1hdGlvbnMgKGtlZXAgZXhpc3RpbmcgbG9naWMpXG4gICAgY29uc3Qgc3RhdGVDbGFzc2VzID0ge1xuICAgICAgaWRsZTogJ2FuaW1hdGUtc3Vuc2V0LXB1bHNlJyxcbiAgICAgIHJlcXVlc3Rpbmc6ICdhbmltYXRlLXB1bHNlIHNjYWxlLTk1JyxcbiAgICAgIHJlY29yZGluZzogJ2FuaW1hdGUtZmxhbWluZ28tZ2xvdyBzY2FsZS0xMTAnLFxuICAgICAgcHJvY2Vzc2luZzogJ2FuaW1hdGUtcHVsc2Ugb3BhY2l0eS03NSBzY2FsZS05NScsXG4gICAgICBzdWNjZXNzOiAnYW5pbWF0ZS1zdWNjZXNzLXBvcCBzY2FsZS0xMTAnLFxuICAgICAgZXJyb3I6ICdhbmltYXRlLWVycm9yLXNoYWtlJ1xuICAgIH1cblxuICAgIGNvbnN0IGNvbWJpbmVkU3R5bGUgPSBgJHtzaXplU3R5bGV9ICR7Zm9udFNpemVTdHlsZX0gJHtib3JkZXJSYWRpdXNTdHlsZX0gJHtiYWNrZ3JvdW5kU3R5bGV9ICR7Ym9yZGVyU3R5bGV9ICR7c2hhZG93U3R5bGV9YFxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogYCR7YmFzZUNsYXNzZXN9ICR7c3RhdGVDbGFzc2VzW2J1dHRvblN0YXRlLnZhbHVlXX1gLFxuICAgICAgc3R5bGU6IGNvbWJpbmVkU3R5bGUsXG4gICAgICBjb25maWc6IGNvbmZpZ1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIHNwYWNlLXktNCB3LWZ1bGwgbWF4LXctc20gbXgtYXV0b1wiPlxuICAgICAgXG4gICAgICB7LyogV2F2ZWZvcm0gVmlzdWFsaXplciAod2hlbiByZWNvcmRpbmcpIC0gQnJ1dGFsaXN0IEVuaGFuY2VkICovfVxuICAgICAge3Nob3dXYXZlZm9ybSAmJiBidXR0b25TdGF0ZS52YWx1ZSA9PT0gJ3JlY29yZGluZycgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzPXtgdy1mdWxsIHAtNiBzaGFkb3ctbWQgJHtcbiAgICAgICAgICB0aGVtZSA9PT0gJ2ZsYW1pbmdvLWJydXRhbGlzdCcgXG4gICAgICAgICAgICA/ICdmbGFtaW5nby1jYXJkIGJvcmRlci0zIGJvcmRlci1mbGFtaW5nby1wcmltYXJ5JyBcbiAgICAgICAgICAgIDogJ3JvdW5kZWQtMnhsIGJnLXdoaXRlLzMwIGJhY2tkcm9wLWJsdXItdm9pY2UnXG4gICAgICAgIH1gfT5cbiAgICAgICAgICA8V2F2ZWZvcm1WaXN1YWxpemVyIGFuYWx5emVyPXthbmFseXplclJlZi5jdXJyZW50fSB0aGVtZT17dGhlbWV9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAgey8qIE1haW4gVm9pY2UgQnV0dG9uIHdpdGggUHJvZ3Jlc3MgUmluZyAqL31cbiAgICAgIDxkaXYgY2xhc3M9XCJyZWxhdGl2ZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgey8qIFByb2dyZXNzIFJpbmcgZm9yIFJlY29yZGluZyAqL31cbiAgICAgICAge2J1dHRvblN0YXRlLnZhbHVlID09PSAncmVjb3JkaW5nJyAmJiAoXG4gICAgICAgICAgPHN2ZyBcbiAgICAgICAgICAgIGNsYXNzPVwiYWJzb2x1dGUgaW5zZXQtMCB3LWZ1bGwgaC1mdWxsIC1yb3RhdGUtOTBcIlxuICAgICAgICAgICAgdmlld0JveD1cIjAgMCAxMDAgMTAwXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICAgIGN4PVwiNTBcIlxuICAgICAgICAgICAgICBjeT1cIjUwXCJcbiAgICAgICAgICAgICAgcj1cIjQ4XCJcbiAgICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgICBzdHJva2U9XCIjRkY2QjlEXCJcbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9XCIyXCJcbiAgICAgICAgICAgICAgc3Ryb2tlRGFzaGFycmF5PXtgJHsocmVjb3JkaW5nRHVyYXRpb24udmFsdWUgLyBtYXhEdXJhdGlvbikgKiAzMDEuNn0gMzAxLjZgfVxuICAgICAgICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICAgICAgICBjbGFzcz1cInRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTEwMDBcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKX1cbiAgICAgICAgXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz17Z2V0VGhlbWVDbGFzc2VzKCkuY2xhc3NOYW1lfVxuICAgICAgICAgIHN0eWxlPXtnZXRUaGVtZUNsYXNzZXMoKS5zdHlsZX1cbiAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVSZWNvcmRpbmd9XG4gICAgICAgICAgZGlzYWJsZWQ9e2J1dHRvblN0YXRlLnZhbHVlID09PSAncHJvY2Vzc2luZycgfHwgYnV0dG9uU3RhdGUudmFsdWUgPT09ICdyZXF1ZXN0aW5nJ31cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgVm9pY2UgcmVjb3JkaW5nIGJ1dHRvbiAtICR7Z2V0QnV0dG9uVGV4dCgpfWB9XG4gICAgICAgICAgdGl0bGU9e2dldEJ1dHRvblRleHQoKX1cbiAgICAgICAgPlxuICAgICAgICB7LyogU2hvdyBjdXN0b20gdGV4dCwgdGltZXIsIG9yIGljb24gd2l0aCBhdXRvLXNjYWxpbmcgKi99XG4gICAgICAgIHtidXR0b25TdGF0ZS52YWx1ZSA9PT0gJ3JlY29yZGluZycgJiYgc2hvd1RpbWVyID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LW1vbm8gZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgIHtmb3JtYXRUaW1lcihyZWNvcmRpbmdEdXJhdGlvbi52YWx1ZSl9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBnZXRUaGVtZUNsYXNzZXMoKS5jb25maWcuY29udGVudC50ZXh0ID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtYm9sZCBsZWFkaW5nLW5vbmVcIj5cbiAgICAgICAgICAgICAge2dldFRoZW1lQ2xhc3NlcygpLmNvbmZpZy5jb250ZW50LnRleHR9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPEJ1dHRvbkljb24gc3RhdGU9e2J1dHRvblN0YXRlLnZhbHVlfSB0aGVtZT17dGhlbWV9IC8+XG4gICAgICAgICl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBCdXR0b24gTGFiZWwgLSBDaHVua3kgVHlwb2dyYXBoeSAqL31cbiAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICA8cCBjbGFzcz17YHRleHQteGwgZm9udC1jaHVua3kgdHJhY2tpbmctd2lkZSAke1xuICAgICAgICAgIHRoZW1lID09PSAnZmxhbWluZ28tYnJ1dGFsaXN0JyBcbiAgICAgICAgICAgID8gJ3RleHQtZmxhbWluZ28tY2hhcmNvYWwnIFxuICAgICAgICAgICAgOiAndGV4dC1ncmF5LTgwMCdcbiAgICAgICAgfWB9PlxuICAgICAgICAgIHtnZXRCdXR0b25UZXh0KCl9XG4gICAgICAgIDwvcD5cbiAgICAgICAgXG4gICAgICAgIHtzaG93VGltZXIgJiYgYnV0dG9uU3RhdGUudmFsdWUgPT09ICdyZWNvcmRpbmcnICYmIChcbiAgICAgICAgICA8cCBjbGFzcz17YHRleHQtYmFzZSBmb250LW1lZGl1bSBtdC0yICR7XG4gICAgICAgICAgICB0aGVtZSA9PT0gJ2ZsYW1pbmdvLWJydXRhbGlzdCcgXG4gICAgICAgICAgICAgID8gJ3RleHQtZmxhbWluZ28tcHVycGxlJyBcbiAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTYwMCdcbiAgICAgICAgICB9YH0+XG4gICAgICAgICAgICB7Zm9ybWF0VGltZXIocmVjb3JkaW5nRHVyYXRpb24udmFsdWUpfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7LyogUHJvY2Vzc2luZyBTcGlubmVyIC0gVGhlbWUgQXdhcmUgKi99XG4gICAgICB7YnV0dG9uU3RhdGUudmFsdWUgPT09ICdwcm9jZXNzaW5nJyAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz17YHctMTAgaC0xMCBib3JkZXItNCAke1xuICAgICAgICAgICAgdGhlbWUgPT09ICdmbGFtaW5nby1icnV0YWxpc3QnIFxuICAgICAgICAgICAgICA/ICdib3JkZXItZmxhbWluZ28tcHJpbWFyeSBib3JkZXItdC10cmFuc3BhcmVudCcgXG4gICAgICAgICAgICAgIDogJ2JvcmRlci12b2ljZS1wcmltYXJ5IGJvcmRlci10LXRyYW5zcGFyZW50J1xuICAgICAgICAgIH0gcm91bmRlZC1mdWxsIGFuaW1hdGUtc3BpbmB9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cblxuICAgICAgey8qIEVycm9yIE1lc3NhZ2UgLSBCcnV0YWxpc3QgU3R5bGUgKi99XG4gICAgICB7ZXJyb3JNZXNzYWdlLnZhbHVlICYmIChcbiAgICAgICAgPGRpdiBjbGFzcz17YHctZnVsbCB0ZXh0LWNlbnRlciBwLTYgJHtcbiAgICAgICAgICB0aGVtZSA9PT0gJ2ZsYW1pbmdvLWJydXRhbGlzdCcgXG4gICAgICAgICAgICA/ICdmbGFtaW5nby1jYXJkJyBcbiAgICAgICAgICAgIDogJ2JnLXJlZC01MCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItcmVkLTIwMCdcbiAgICAgICAgfWB9PlxuICAgICAgICAgIDxwIGNsYXNzPXtgZm9udC1tZWRpdW0gbWItNCAke1xuICAgICAgICAgICAgdGhlbWUgPT09ICdmbGFtaW5nby1icnV0YWxpc3QnIFxuICAgICAgICAgICAgICA/ICd0ZXh0LWZsYW1pbmdvLWNvcmFsIHRleHQtbGcnIFxuICAgICAgICAgICAgICA6ICd0ZXh0LXJlZC01MDAnXG4gICAgICAgICAgfWB9PlxuICAgICAgICAgICAge2Vycm9yTWVzc2FnZS52YWx1ZX1cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3M9e2Bmb250LW1lZGl1bSB1bmRlcmxpbmUgdHJhbnNpdGlvbi1jb2xvcnMgJHtcbiAgICAgICAgICAgICAgdGhlbWUgPT09ICdmbGFtaW5nby1icnV0YWxpc3QnIFxuICAgICAgICAgICAgICAgID8gJ3RleHQtZmxhbWluZ28tcHVycGxlIGhvdmVyOnRleHQtZmxhbWluZ28tY2hhcmNvYWwnIFxuICAgICAgICAgICAgICAgIDogJ3RleHQtcmVkLTYwMCBob3Zlcjp0ZXh0LXJlZC03MDAnXG4gICAgICAgICAgICB9YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3Jlc2V0VG9JZGxlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIERpc21pc3NcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7LyogVHJhbnNjcmlwdCBEaXNwbGF5IC0gQnJ1dGFsaXN0IEVuaGFuY2VkICovfVxuICAgICAge3RyYW5zY3JpcHQudmFsdWUgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzPVwidy1mdWxsIHNwYWNlLXktNlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9e2B3LWZ1bGwgd2hpdGVzcGFjZS1wcmUtbGluZSBwLTggZm9udC1tb25vIHRleHQtYmFzZSBsZWFkaW5nLXJlbGF4ZWQgc2hhZG93LWxnICR7XG4gICAgICAgICAgICB0aGVtZSA9PT0gJ2ZsYW1pbmdvLWJydXRhbGlzdCcgXG4gICAgICAgICAgICAgID8gJ2ZsYW1pbmdvLWNhcmQgdGV4dC1mbGFtaW5nby1jaGFyY29hbCBib3JkZXItMyBib3JkZXItZmxhbWluZ28tcHVycGxlJyBcbiAgICAgICAgICAgICAgOiAncm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci1ncmF5LTEwMCBiZy13aGl0ZSB0ZXh0LWdyYXktODAwJ1xuICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgIHt0cmFuc2NyaXB0LnZhbHVlfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLy8gQnV0dG9uIEljb24gQ29tcG9uZW50IChjaHVua3kgYW5kIHRoZW1lLWF3YXJlKVxuZnVuY3Rpb24gQnV0dG9uSWNvbih7IHN0YXRlLCB0aGVtZSB9OiB7IHN0YXRlOiBCdXR0b25TdGF0ZSwgdGhlbWU/OiBzdHJpbmcgfSkge1xuICAvLyBCaWdnZXIgaWNvbnMgZm9yIGJydXRhbGlzdCB0aGVtZVxuICBjb25zdCBpY29uQ2xhc3NlcyA9IHRoZW1lID09PSAnZmxhbWluZ28tYnJ1dGFsaXN0JyBcbiAgICA/IFwidy0xMiBoLTEyIG14LWF1dG9cIiBcbiAgICA6IFwidy04IGgtOCBteC1hdXRvXCJcbiAgXG4gIHN3aXRjaCAoc3RhdGUpIHtcbiAgICBjYXNlICdpZGxlJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxzdmcgY2xhc3M9e2ljb25DbGFzc2VzfSBmaWxsPVwiY3VycmVudENvbG9yXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgMWEzIDMgMCAwIDAtMyAzdjhhMyAzIDAgMCAwIDYgMFY0YTMgMyAwIDAgMC0zLTN6XCIgc3Ryb2tlV2lkdGg9XCIxLjVcIi8+XG4gICAgICAgICAgPHBhdGggZD1cIk0xOSAxMHYyYTcgNyAwIDAgMS0xNCAwdi0ySDN2MmE5IDkgMCAwIDAgOCA4Ljk0VjIxSDl2Mmg2di0yaC0ydi0uMDZBOSA5IDAgMCAwIDIxIDEydi0yaC0yelwiIHN0cm9rZVdpZHRoPVwiMS41XCIvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIClcbiAgICBjYXNlICdyZWNvcmRpbmcnOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHN2ZyBjbGFzcz17aWNvbkNsYXNzZXN9IGZpbGw9XCJjdXJyZW50Q29sb3JcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCI2XCIgc3Ryb2tlV2lkdGg9XCIyXCIvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIClcbiAgICBjYXNlICdwcm9jZXNzaW5nJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxzdmcgY2xhc3M9e2Ake2ljb25DbGFzc2VzfSBhbmltYXRlLXNwaW5gfSBmaWxsPVwiY3VycmVudENvbG9yXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgMnYyYTggOCAwIDAgMSA4IDhoMmExMCAxMCAwIDAgMC0xMC0xMHpcIiBzdHJva2VXaWR0aD1cIjJcIi8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgKVxuICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHN2ZyBjbGFzcz17aWNvbkNsYXNzZXN9IGZpbGw9XCJjdXJyZW50Q29sb3JcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgPHBhdGggZD1cIk05IDE2LjJsLTQuMi00LjItMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yelwiIHN0cm9rZVdpZHRoPVwiMlwiLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICApXG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHN2ZyBjbGFzcz17aWNvbkNsYXNzZXN9IGZpbGw9XCJjdXJyZW50Q29sb3JcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgPHBhdGggZD1cIk0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0xIDE1aC0ydi0yaDJ2MnptMC00aC0yVjdoMnY2elwiIHN0cm9rZVdpZHRoPVwiMS41XCIvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIClcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHN2ZyBjbGFzcz17aWNvbkNsYXNzZXN9IGZpbGw9XCJjdXJyZW50Q29sb3JcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgPHBhdGggZD1cIk0xMiAxYTMgMyAwIDAgMC0zIDN2OGEzIDMgMCAwIDAgNiAwVjRhMyAzIDAgMCAwLTMtM3pcIi8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgKVxuICB9XG59XG5cbi8vIFdhdmVmb3JtIFZpc3VhbGl6ZXIgQ29tcG9uZW50IChsaWtlIFBhYmxvJ3MgQXVkaW9WaXN1YWxpemVyLnN2ZWx0ZSlcbmZ1bmN0aW9uIFdhdmVmb3JtVmlzdWFsaXplcih7IGFuYWx5emVyLCB0aGVtZSB9OiB7IGFuYWx5emVyPzogQXVkaW9BbmFseXplciwgdGhlbWU/OiBzdHJpbmcgfSkge1xuICBjb25zdCBjYW52YXNSZWYgPSB1c2VSZWY8SFRNTENhbnZhc0VsZW1lbnQ+KG51bGwpXG4gIFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghYW5hbHl6ZXIgfHwgIWNhbnZhc1JlZi5jdXJyZW50KSByZXR1cm5cbiAgICBcbiAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudFxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIVxuICAgIFxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICBpZiAoIWFuYWx5emVyIHx8ICFjYW52YXMgfHwgIWN0eCkgcmV0dXJuXG4gICAgICBcbiAgICAgIGNvbnN0IHdhdmVmb3JtRGF0YSA9IGFuYWx5emVyLmdldFdhdmVmb3JtRGF0YSgpXG4gICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IGNhbnZhc1xuICAgICAgXG4gICAgICAvLyBDbGVhciBjYW52YXNcbiAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodClcbiAgICAgIFxuICAgICAgLy8gRHJhdyB3YXZlZm9ybSBiYXJzXG4gICAgICBjb25zdCBiYXJXaWR0aCA9IHdpZHRoIC8gd2F2ZWZvcm1EYXRhLmxlbmd0aFxuICAgICAgY29uc3QgY2VudGVyWSA9IGhlaWdodCAvIDJcbiAgICAgIFxuICAgICAgLy8gVXNlIHRoZW1lLWFwcHJvcHJpYXRlIGNvbG9yc1xuICAgICAgY29uc3QgY29sb3IgPSB0aGVtZSA9PT0gJ2ZsYW1pbmdvLWJydXRhbGlzdCcgPyAnI0ZGNkI5RCcgOiAnI2Y1OWUwYidcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvclxuICAgICAgXG4gICAgICB3YXZlZm9ybURhdGEuZm9yRWFjaCgodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IGJhckhlaWdodCA9IHZhbHVlICogaGVpZ2h0ICogMC44IC8vIFNjYWxlIHRvIDgwJSBvZiBjYW52YXMgaGVpZ2h0XG4gICAgICAgIGNvbnN0IHggPSBpbmRleCAqIGJhcldpZHRoXG4gICAgICAgIGNvbnN0IHkgPSBjZW50ZXJZIC0gYmFySGVpZ2h0IC8gMlxuICAgICAgICBcbiAgICAgICAgY3R4LmZpbGxSZWN0KHgsIHksIGJhcldpZHRoIC0gMSwgYmFySGVpZ2h0KVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpXG4gICAgfVxuICAgIFxuICAgIGRyYXcoKVxuICB9LCBbYW5hbHl6ZXJdKVxuICBcbiAgcmV0dXJuIChcbiAgICA8Y2FudmFzXG4gICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgIHdpZHRoPXs0MDB9XG4gICAgICBoZWlnaHQ9ezgwfVxuICAgICAgY2xhc3M9XCJ3LWZ1bGwgaC0yMCByb3VuZGVkLWxnXCJcbiAgICAgIHN0eWxlPXt7IGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcgfX1cbiAgICAvPlxuICApXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTLE1BQU0sUUFBUSxrQkFBaUI7QUFDeEMsU0FBUyxTQUFTLEVBQUUsTUFBTSxRQUFRLGVBQWM7QUFDaEQsU0FBUyxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxjQUFjLFFBQVEsb0JBQW1CO0FBQ3hILFNBQXNCLGdCQUFnQixRQUE2QixtQkFBa0I7QUFFckYsU0FBUyxLQUFLLFFBQVEsY0FBYTtBQUVuQyw0RUFBNEU7QUFDNUUsTUFBTSxjQUFjLE9BQW9CO0FBQ3hDLE1BQU0sYUFBYSxPQUFlO0FBQ2xDLE1BQU0sZUFBZSxPQUFlO0FBQ3BDLE1BQU0scUJBQXFCLE9BQWdCO0FB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
// denoCacheMetadata=15990911588159836493,14977756936466025356