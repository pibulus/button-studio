import { signal } from "@preact/signals";
import { useEffect, useMemo, useRef } from "preact/hooks";
import {
  AudioAnalyzer,
  AudioRecorder,
  copyToClipboard,
  HapticPatterns,
  triggerHapticFeedback,
} from "../utils/audio.ts";
import {
  ButtonSize,
  ButtonState,
  ThemeId,
  VoiceButtonError,
} from "../types/core.ts";
import { OutputPlugin, TranscriptionPlugin } from "../types/plugins.ts";
import {
  ButtonCustomization,
  defaultCustomization,
  generateButtonClasses,
  generateButtonStyles,
} from "../types/customization.ts";
import { SOUND_PRESETS, synthEngine } from "../utils/audio/synthEngine.ts";
import { toast } from "./Toast.tsx";

// Signals for global state management (like Pablo's reactive Svelte stores)
const buttonState = signal<ButtonState>("idle");
const transcript = signal<string>("");
const errorMessage = signal<string>("");
const isClipboardSuccess = signal<boolean>(false);
const recordingDuration = signal<number>(0);

// ===================================================================
// VOICE BUTTON PROPS - Supports both new and legacy customization
// ===================================================================

interface VoiceButtonProps {
  // New customization system (primary)
  customization?: ButtonCustomization;

  // Voice activation toggle
  voiceEnabled?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;

  // Core functionality
  transcriptionPlugin?: TranscriptionPlugin;
  outputPlugin?: OutputPlugin;

  // Appearance (legacy support)
  theme?: ThemeId;
  size?: ButtonSize;
  customCSS?: string;

  // Studio customization props (legacy support)
  customSize?: string;
  squishiness?: string;
  chonkiness?: string;
  glowIntensity?: number;
  customText?: string;
  buttonShape?: "circle" | "square" | "rectangle";

  // Legacy comprehensive config (preserved for compatibility)
  buttonConfig?: {
    content: { text: string; autoScale: boolean };
    size: { width: number; height: number; maintainRatio?: boolean };
    shape: { type: "circle" | "square" | "rectangle"; borderRadius: number };
    appearance: {
      fill: {
        type: "solid" | "gradient";
        solid: string;
        gradient: {
          type: "linear" | "radial";
          colors: [string, string];
          direction: number;
        };
      };
      border: {
        width: number;
        color: string;
        style: "solid" | "dashed" | "dotted";
      };
      shadow: {
        type: "none" | "soft" | "hard" | "glow";
        color: string;
        blur: number;
        spread: number;
        x: number;
        y: number;
      };
    };
  };

  // Behavior
  autoStart?: boolean;
  maxDuration?: number;
  enableHaptics?: boolean;
  enableSounds?: boolean;
  showTimer?: boolean;
  showWaveform?: boolean;

  // Event callbacks (like Pablo's onComplete pattern)
  onComplete?: (result: { text: string; confidence: number }) => void;
  onError?: (error: VoiceButtonError) => void;
  onStateChange?: (state: ButtonState) => void;
  onCustomizationChange?: (customization: ButtonCustomization) => void;
}

export default function VoiceButton({
  customization = defaultCustomization,
  voiceEnabled = false,
  onVoiceToggle,
  theme = "amber",
  size = "large",
  customSize,
  squishiness,
  chonkiness,
  customText,
  buttonShape = "square",
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
  const recorderRef = useRef<AudioRecorder>();
  const analyzerRef = useRef<AudioAnalyzer>();
  const timerRef = useRef<number>();

  // Initialize audio recorder (like Pablo's mediaRecorder setup)
  useEffect(() => {
    recorderRef.current = new AudioRecorder();
    analyzerRef.current = new AudioAnalyzer();

    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      analyzerRef.current?.disconnect();
    };
  }, []);

  // Watch state changes and trigger callbacks
  useEffect(() => {
    onStateChange?.(buttonState.value);
  }, [buttonState.value]);

  // Auto-clipboard copy (Pablo's brilliant UX pattern)
  useEffect(() => {
    if (transcript.value) {
      copyToClipboard(transcript.value).then((success) => {
        isClipboardSuccess.value = success;
        if (success) {
          toast.success("Voice magic copied! 🎤✨");
        } else {
          toast.error("Oops, clipboard magic failed!");
        }
      });
    }
  }, [transcript.value]);

  async function startRecording() {
    try {
      errorMessage.value = "";
      transcript.value = "";
      isClipboardSuccess.value = false;
      recordingDuration.value = 0;

      buttonState.value = "requesting";

      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.recordStart);
      }

      const recorder = recorderRef.current!;
      const analyzer = analyzerRef.current!;

      // Start recording (using Pablo's proven MediaRecorder logic)
      await recorder.startRecording();

      buttonState.value = "recording";

      // Connect audio analyzer for waveform
      if (showWaveform) {
        const stream = recorder.getStream();
        if (stream) {
          await analyzer.connectToStream(stream);
        }
      }

      // Start timer (like Pablo's countSec system)
      timerRef.current = setInterval(() => {
        recordingDuration.value += 1;

        // Auto-stop at max duration
        if (recordingDuration.value >= maxDuration) {
          stopRecording();
        }

        // Haptic pulse every 5 seconds during long recordings
        if (enableHaptics && recordingDuration.value % 5 === 0) {
          triggerHapticFeedback([30]);
        }
      }, 1000);

    } catch (error) {
      buttonState.value = "error";

      if (error instanceof VoiceButtonError) {
        errorMessage.value = error.message;
        onError?.(error);
      } else {
        const voiceError = new VoiceButtonError(
          "Failed to start recording",
          "RECORDING_FAILED" as any,
        );
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

      buttonState.value = "processing";

      const recorder = recorderRef.current!;
      const audioBlob = await recorder.stopRecording();


      // Use real Gemini transcription with hardcoded API key
      const { GeminiTranscriptionPlugin } = await import(
        "../plugins/transcription/gemini.ts"
      );
      const geminiPlugin = new GeminiTranscriptionPlugin();

      // Configure and transcribe
      await geminiPlugin.configure({ apiKey: "hardcoded" }); // API key is hardcoded in plugin
      const result = await geminiPlugin.transcribe(audioBlob);
      transcript.value = result.text;

      buttonState.value = "success";

      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.success);
      }

      // Trigger success callback (like Pablo's onComplete pattern)
      onComplete?.({
        text: transcript.value,
        confidence: 0.95,
      });

      // Auto-return to idle after success celebration
      setTimeout(() => {
        if (buttonState.value === "success") {
          buttonState.value = "idle";
        }
      }, 2000);

    } catch (error) {
      buttonState.value = "error";

      if (error instanceof VoiceButtonError) {
        errorMessage.value = error.message;
        onError?.(error);
      } else {
        const voiceError = new VoiceButtonError(
          "Failed to process recording",
          "TRANSCRIPTION_FAILED" as any,
        );
        errorMessage.value = voiceError.message;
        onError?.(voiceError);
      }

      if (enableHaptics) {
        triggerHapticFeedback(HapticPatterns.error);
      }
    }
  }

  // ===================================================================
  // AUDIO & INTERACTION HANDLERS
  // ===================================================================

  // Play button sound using the configured sound type
  async function playClickSound() {
    if (!voiceEnabled || !customization.sound.enabled) return; // No sound in design mode or if disabled

    try {
      const soundConfig = SOUND_PRESETS[customization.sound.type];
      if (soundConfig) {
        await synthEngine.playSound(soundConfig);
      }
    } catch (error) {
      // Silently fail if audio context not available
      // Silently fail if audio context not available
    }
  }

  async function toggleRecording() {
    await playClickSound();

    // Check if voice is enabled before doing API calls
    if (!voiceEnabled) {
      // Design mode - no recording, just visual feedback
      return;
    }

    if (buttonState.value === "recording") {
      stopRecording();
    } else if (buttonState.value === "idle" || buttonState.value === "error") {
      startRecording();
    }
  }

  function resetToIdle() {
    if (buttonState.value === "error" || buttonState.value === "success") {
      buttonState.value = "idle";
      errorMessage.value = "";
      transcript.value = "";
      recordingDuration.value = 0;
    }
  }

  // ===================================================================
  // UI HELPERS & COMPUTED VALUES
  // ===================================================================

  // Dynamic button text (like Pablo's computed buttonLabel)
  function getButtonText(): string {
    switch (buttonState.value) {
      case "idle":
        return "Ready";
      case "requesting":
        return "Requesting Permission...";
      case "recording":
        return "Recording";
      case "processing":
        return "Transcribing...";
      case "success":
        return "Success!";
      case "error":
        return "Try Again";
      default:
        return "Ready";
    }
  }

  // Format timer (like Pablo's covertSecToMinAndHour)
  function formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const sec = remainingSeconds < 10
      ? `0${remainingSeconds}`
      : `${remainingSeconds}`;
    return `${minutes}:${sec}`;
  }

  // ===================================================================
  // PERFORMANCE OPTIMIZATIONS - Memoized calculations
  // ===================================================================

  // Memoize expensive calculations for performance
  const hasRainbowEffect = useMemo(() => customization.effects.rainbowGlow, [
    customization.effects.rainbowGlow,
  ]);

  // Memoize button color extraction to avoid recalculation
  const buttonColor = useMemo(() => {
    return customization.appearance.fillType === "solid"
      ? customization.appearance.solidColor
      : customization.appearance.gradient.start;
  }, [
    customization.appearance.fillType,
    customization.appearance.solidColor,
    customization.appearance.gradient.start,
  ]);

  // Memoize hex to rgba conversion for consistent colors
  const hexToRgba = useMemo(() => {
    return (hex: string, alpha: number) => {
      const cleanHex = hex.replace("#", "");
      const r = parseInt(cleanHex.substr(0, 2), 16);
      const g = parseInt(cleanHex.substr(2, 2), 16);
      const b = parseInt(cleanHex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
  }, []);

  // Memoize shape dimensions calculation for performance - NOW WITH SCALE!
  const shapeDimensions = useMemo(() => {
    const shape = customization.appearance.shape;
    const scale = customization.appearance.scale;

    if (shape === "circle") {
      const baseSize = 120;
      const scaledSize = `${baseSize * scale}px`;
      return {
        width: scaledSize,
        height: scaledSize,
        minWidth: scaledSize,
        minHeight: scaledSize,
        maxWidth: scaledSize,
        maxHeight: scaledSize,
        padding: "0",
        boxSizing: "border-box" as const,
      };
    }

    // Rectangle/square buttons - SCALED SIZE
    const baseWidth = 160;
    const baseHeight = 80;
    const scaledWidth = `${baseWidth * scale}px`;
    const scaledHeight = `${baseHeight * scale}px`;

    return {
      width: scaledWidth,
      height: scaledHeight,
      minWidth: scaledWidth,
      minHeight: scaledHeight,
      maxWidth: scaledWidth,
      maxHeight: scaledHeight,
      padding: "0",
      boxSizing: "border-box" as const,
    };
  }, [customization.appearance.shape, customization.appearance.scale]);

  // Memoize easing curve calculation
  const easingCurve = useMemo(() => {
    switch (customization.interactions.easingStyle) {
      case "bouncy":
        return "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      case "smooth":
        return "cubic-bezier(0.4, 0, 0.2, 1)";
      case "snappy":
        return "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      default:
        return "cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
  }, [customization.interactions.easingStyle]);

  // Enhanced button styling with customization system
  const getButtonStyles = () => {
    // Use customization system for live slider updates
    const config = customization;

    // Add voice state-specific animations and styling
    let stateClasses = "";
    let stateAnimations = "";

    // Effect-based animations (MODULAR!) - Using CSS classes instead of Tailwind animate syntax
    let effectClasses = [];
    let hasRainbow = config.effects.rainbowGlow;

    // Transform effects (these conflict with each other - only apply the first one)
    if (
      config.effects.breathing && !config.effects.bounce &&
      !config.effects.wiggle
    ) {
      effectClasses.push("effect-breathe");
    } else if (config.effects.bounce && !config.effects.wiggle) {
      effectClasses.push("effect-bounce");
    } else if (config.effects.wiggle) {
      effectClasses.push("effect-wiggle");
    }

    // Non-transform effects (these can work together)
    // NOTE: glow effect handled via inline styles now, not CSS class
    if (config.effects.pulse) effectClasses.push("effect-pulse");

    const effectAnimations = effectClasses.join(" ");

    // Effects applied based on configuration

    switch (buttonState.value) {
      case "idle":
        // Use effect animations when idle
        stateAnimations = effectAnimations;
        break;
      case "requesting":
        stateClasses = "ring-4 ring-orange-300";
        stateAnimations = "animate-pulse";
        break;
      case "recording":
        stateClasses = "ring-4 ring-red-300";
        stateAnimations = "animate-[recording-pulse_1s_ease-in-out_infinite]";
        break;
      case "processing":
        stateClasses = "ring-4 ring-blue-300";
        stateAnimations = "animate-pulse";
        break;
      case "success":
        stateClasses = "ring-4 ring-green-300";
        stateAnimations = "animate-[success-pop_0.6s_ease-out]";
        break;
      case "error":
        stateClasses = "ring-4 ring-red-300";
        stateAnimations = "animate-[error-shake_0.5s_ease-in-out]";
        break;
    }

    // Dynamic content size
    const contentSize = "text-3xl";

    // Generate dynamic styles from customization
    const isPressed = buttonState.value === "recording" ||
      buttonState.value === "processing";

    // Apply background based on fill type
    const backgroundStyle = config.appearance.fillType === "solid"
      ? config.appearance.solidColor
      : `linear-gradient(${config.appearance.gradient.direction}deg, ${config.appearance.gradient.start}, ${config.appearance.gradient.end})`;

    // Calculate dynamic size and styling with sliders
    const dynamicScale = config.appearance.scale;
    const dynamicRoundness = config.appearance.roundness;
    const shadowType = config.appearance.shadowType;
    const borderWidth = config.appearance.borderWidth;
    const shape = config.appearance.shape;
    const borderStyle = config.appearance.borderStyle;
    const hoverEffect = config.interactions.hoverEffect;
    const clickAnimation = config.interactions.clickAnimation;
    const textTransform = config.interactions.textTransform;
    const fontWeight = config.interactions.fontWeight;

    // Calculate shadow and glow based on type
    const baseShadow = shadowType === "brutalist"
      ? "8px 8px 0px #000000" // Hard brutalist shadow
      : "0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)"; // Soft diffused shadow

    // SIMPLE GLOW SYSTEM - just the base shadow for now
    const shadowStyle = baseShadow;

    // Shape-specific border radius
    const getBorderRadius = () => {
      switch (shape) {
        case "circle":
          return "50%";
        case "square":
          return `${Math.min(dynamicRoundness, 20)}px`; // Allow roundness on squares too, max 20px
        case "rounded":
          return `${dynamicRoundness}px`;
        default:
          return `${dynamicRoundness}px`;
      }
    };

    // Shape dimensions now memoized above for performance

    // 🎮 JUICE CONTROLS - Dynamic interaction effects!
    const juiceSettings = config.interactions;
    const squishScale = 1 - (juiceSettings.squishPower / 100);
    const bounceScale = 1 + (juiceSettings.bounceFactor / 100);
    const hoverLift = juiceSettings.hoverLift;
    const animSpeed = juiceSettings.animationSpeed;

    // Use memoized easing curve for performance

    // Dynamic hover effects with juice controls - Using CSS custom properties for dynamic values
    let hoverClasses = "";
    let hoverStyles = {};

    switch (hoverEffect) {
      case "lift":
        hoverClasses = "hover-lift";
        hoverStyles = {
          "--hover-scale": bounceScale,
          "--hover-lift": `${hoverLift}px`,
        };
        break;
      case "glow":
        hoverClasses = "hover-glow";
        hoverStyles = {
          "--glow-color": hexToRgba(buttonColor, 0.6),
        };
        break;
      case "pulse":
        hoverClasses = "hover:animate-pulse";
        break;
      case "rotate":
        hoverClasses = "hover:rotate-3";
        break;
      default:
        hoverClasses = "hover-default";
        hoverStyles = {
          "--hover-scale": 1 + juiceSettings.bounceFactor / 200,
        };
    }

    return {
      className:
        `${stateClasses} ${stateAnimations} ${contentSize} relative cursor-pointer select-none transition-all ease-out ${hoverClasses} border-black`,
      style: {
        background: backgroundStyle,
        transform: `scale(${isPressed ? squishScale : 1})`,
        borderRadius: getBorderRadius(),
        borderStyle: borderStyle,
        borderWidth: `${borderWidth}px`,
        textTransform: textTransform as any,
        fontWeight: fontWeight === "bold"
          ? "bold"
          : fontWeight === "light"
          ? "300"
          : "normal",
        transition: `all ${150 / animSpeed}ms ${easingCurve}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        willChange: "transform, box-shadow, filter",
        // FORCE glow effect via direct style override
        boxShadow: config.effects.glow
          ? (isPressed
            ? `2px 2px 0px #000000, 0 0 15px ${hexToRgba(buttonColor, 0.6)}`
            : `8px 8px 0px #000000, 0 0 25px ${
              hexToRgba(buttonColor, 0.6)
            }, 0 0 50px ${hexToRgba(buttonColor, 0.3)}`)
          : (isPressed
            ? (shadowType === "brutalist"
              ? "2px 2px 0px #000000"
              : "0 2px 4px rgba(0,0,0,0.2)")
            : shadowStyle),
        ...shapeDimensions,
        ...hoverStyles,
      } as any,
    };
  };

  return (
    <div class="flex flex-col items-center">
      {/* LUSH Animation Styles + Hover Effects */}
      <style jsx>
        {`
        /* Hover Effects - Custom CSS for dynamic values */
        .hover-lift:hover {
          transform: scale(var(--hover-scale)) translateY(calc(-1 * var(--hover-lift)));
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color);
        }
        
        .hover-default:hover {
          transform: scale(var(--hover-scale));
          filter: brightness(1.1);
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        
        
        @keyframes bounce-effect {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .effect-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        
        .effect-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        
        .effect-glow {
          /* Glow effect handled via inline styles now */
        }
        
        .effect-bounce {
          animation: bounce-effect 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse-effect {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.8; filter: brightness(1.1); }
        }
        
        .effect-pulse {
          animation: pulse-effect 2s ease-in-out infinite;
        }
        
        
        @keyframes recording-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes success-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes rainbow-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        .rainbow-wrapper {
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
          padding: 4px;
          border-radius: 20px;
          display: inline-block;
        }
      `}
      </style>

      {/* Just the Button - Clean */}
      <div class="relative inline-block">
        {/* Progress Ring for Recording */}
        {buttonState.value === "recording" && (
          <svg
            class="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={customization.recording.ringColor}
              strokeWidth="2"
              strokeDasharray={`${
                (recordingDuration.value / maxDuration) * 301.6
              } 301.6`}
              strokeLinecap="round"
              class="transition-all duration-1000"
            />
          </svg>
        )}

        {hasRainbowEffect
          ? (
            <div class="rainbow-wrapper">
              <button
                class={`${getButtonStyles().className} voice-button`}
                style={getButtonStyles().style}
                onClick={toggleRecording}
                disabled={buttonState.value === "processing" ||
                  buttonState.value === "requesting"}
                aria-label={`Voice recording button - ${getButtonText()}`}
                title={getButtonText()}
              >
                {/* Show recording feedback or regular content */}
                {buttonState.value === "recording"
                  ? (
                    <RecordingContent
                      recordingConfig={customization.recording}
                      duration={recordingDuration.value}
                      originalContent={customization.content.value}
                      buttonState={buttonState.value}
                      theme={customization.appearance.theme}
                    />
                  )
                  : customization.content.value
                  ? (
                    <span
                      class="font-bold leading-none text-center block"
                      style={{
                        fontSize: `${
                          Math.max(
                            12,
                            Math.min(32, customization.appearance.scale * 24),
                          )
                        }px`,
                        padding: `${customization.appearance.scale * 8}px`,
                        maxWidth: "100%",
                        wordBreak: "break-word",
                        hyphens: "auto",
                      }}
                    >
                      {customization.content.value}
                    </span>
                  )
                  : (
                    <ButtonIcon
                      state={buttonState.value}
                      theme={customization.appearance.theme}
                      scale={customization.appearance.scale}
                    />
                  )}
              </button>
            </div>
          )
          : (
            <button
              class={`${getButtonStyles().className} voice-button`}
              style={getButtonStyles().style}
              onClick={toggleRecording}
              disabled={buttonState.value === "processing" ||
                buttonState.value === "requesting"}
              aria-label={`Voice recording button - ${getButtonText()}`}
              title={getButtonText()}
            >
              {/* Show recording feedback or regular content */}
              {buttonState.value === "recording"
                ? (
                  <RecordingContent
                    recordingConfig={customization.recording}
                    duration={recordingDuration.value}
                    originalContent={customization.content.value}
                    buttonState={buttonState.value}
                    theme={customization.appearance.theme}
                  />
                )
                : customization.content.value
                ? (
                  <span
                    class="font-bold leading-none text-center block"
                    style={{
                      fontSize: `${
                        Math.max(
                          12,
                          Math.min(32, customization.appearance.scale * 24),
                        )
                      }px`,
                      padding: `${customization.appearance.scale * 8}px`,
                      maxWidth: "100%",
                      wordBreak: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    {customization.content.value}
                  </span>
                )
                : (
                  <ButtonIcon
                    state={buttonState.value}
                    theme={customization.appearance.theme}
                    scale={customization.appearance.scale}
                  />
                )}
            </button>
          )}
      </div>

      {/* Processing Spinner Only When Needed */}
      {buttonState.value === "processing" && (
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
  );
}

// Button Icon Component (theme-aware and sophisticated)
function ButtonIcon(
  { state, theme, scale = 1 }: {
    state: ButtonState;
    theme?: string;
    scale?: number;
  },
) {
  // Reactive icon sizing based on button scale
  const iconSize = Math.max(16, Math.min(48, scale * 32));
  const iconClasses = `mx-auto`;
  const iconStyle = { width: `${iconSize}px`, height: `${iconSize}px` };

  switch (state) {
    case "idle":
      return (
        <svg
          class={iconClasses}
          style={iconStyle}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            strokeWidth="1.5"
          />
          <path
            d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V21H9v2h6v-2h-2v-.06A9 9 0 0 0 21 12v-2h-2z"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "recording":
      return (
        <svg
          class={iconClasses}
          style={iconStyle}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="6" strokeWidth="2" />
        </svg>
      );
    case "processing":
      return (
        <svg
          class={`${iconClasses} animate-spin`}
          style={iconStyle}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2v2a8 8 0 0 1 8 8h2a10 10 0 0 0-10-10z"
            strokeWidth="2"
          />
        </svg>
      );
    case "success":
      return (
        <svg
          class={iconClasses}
          style={iconStyle}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 16.2l-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
            strokeWidth="2"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          class={iconClasses}
          style={iconStyle}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            strokeWidth="1.5"
          />
        </svg>
      );
    default:
      return (
        <svg
          class={iconClasses}
          style={iconStyle}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        </svg>
      );
  }
}

// Recording Content Component - Handles different visual feedback types
function RecordingContent(
  { recordingConfig, duration, originalContent, buttonState, theme }: {
    recordingConfig: ButtonCustomization["recording"];
    duration: number;
    originalContent: string;
    buttonState: ButtonState;
    theme?: string;
  },
) {
  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const sec = remainingSeconds < 10
      ? `0${remainingSeconds}`
      : `${remainingSeconds}`;
    return `${minutes}:${sec}`;
  };

  // ALWAYS maintain consistent size - no layout shift allowed!
  const wrapperClass =
    "w-full h-full flex items-center justify-center font-bold leading-none";

  switch (recordingConfig.visualFeedback) {
    case "timer":
      return (
        <div class={wrapperClass}>
          {recordingConfig.showTimer
            ? (
              <span
                class="font-mono text-center"
                style={{ fontSize: "inherit" }}
              >
                {formatTimer(duration)}
              </span>
            )
            : (
              <span style={{ fontSize: "inherit" }}>
                {originalContent || "Recording..."}
              </span>
            )}
        </div>
      );

    case "pulse":
      return (
        <div class={wrapperClass}>
          <span
            class="transition-all duration-1000 ease-in-out"
            style={{
              fontSize: "inherit",
              opacity: `${0.6 + (Math.sin(Date.now() / 500) + 1) * 0.2}`,
              filter: `brightness(${
                1 + (recordingConfig.pulseIntensity / 100) * 0.5
              })`,
            }}
          >
            {originalContent || "🎤"}
          </span>
        </div>
      );

    case "glow":
      return (
        <div class={wrapperClass}>
          <span
            class="animate-pulse"
            style={{
              fontSize: "inherit",
              textShadow:
                `0 0 15px ${recordingConfig.ringColor}, 0 0 30px ${recordingConfig.ringColor}80`,
              filter: "brightness(1.3)",
              color: recordingConfig.ringColor,
            }}
          >
            {originalContent || "🎤"}
          </span>
        </div>
      );

    case "ring":
      return (
        <div class={`${wrapperClass} relative`}>
          <div
            class="absolute inset-2 rounded-full border-2 animate-pulse"
            style={{
              borderColor: recordingConfig.ringColor,
              boxShadow: `0 0 10px ${recordingConfig.ringColor}60`,
            }}
          />
          <span class="relative z-10" style={{ fontSize: "inherit" }}>
            {originalContent || "🎤"}
          </span>
        </div>
      );

    default:
      return (
        <div class={wrapperClass}>
          <span style={{ fontSize: "inherit" }}>
            {originalContent || "Recording..."}
          </span>
        </div>
      );
  }
}

// Waveform Visualizer Component (like Pablo's AudioVisualizer.svelte)
function WaveformVisualizer(
  { analyzer, theme }: { analyzer?: AudioAnalyzer; theme?: string },
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyzer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

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
      const color = theme === "flamingo-brutalist" ? "#FF6B9D" : "#f59e0b";
      ctx.fillStyle = color;

      waveformData.forEach((value, index) => {
        const barHeight = value * height * 0.8; // Scale to 80% of canvas height
        const x = index * barWidth;
        const y = centerY - barHeight / 2;

        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [analyzer]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      class="w-full h-20 rounded-lg"
      style={{ background: "transparent" }}
    />
  );
}
