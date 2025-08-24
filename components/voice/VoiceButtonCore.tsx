// ===================================================================
// VOICE BUTTON CORE - Refactored main component
// Uses extracted UI and Audio components for better organization
// ===================================================================

import { useEffect, useMemo, useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import { ButtonSize, ButtonState, ThemeId } from "../../types/core.ts";
import { OutputPlugin, TranscriptionPlugin } from "../../types/plugins.ts";
import {
  ButtonCustomization,
  defaultCustomization,
  generateButtonClasses,
  generateButtonStyles,
  getSmartTextColor,
} from "../../types/customization.ts";
import { copyToClipboard } from "../../utils/audio.ts";
import { toast } from "../Toast.tsx";

// Import extracted components
import {
  ButtonIcon,
  RecordingContent,
  WaveformVisualizer,
} from "./VoiceButtonUI.tsx";
import { VoiceButtonAudioManager } from "./VoiceButtonAudio.tsx";

// ===================================================================
// VOICE BUTTON PROPS
// ===================================================================

interface VoiceButtonProps {
  // New customization system (primary)
  customization?: ButtonCustomization;

  // Voice activation toggle
  voiceEnabled?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;

  // API Configuration
  apiKey?: string;
  customPrompt?: string;

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
  buttonShape?: "circle" | "pill" | "rounded" | "sharp";

  // Legacy comprehensive config (preserved for compatibility)
  buttonConfig?: {
    content: { text: string; autoScale: boolean };
    size: { width: number; height: number; maintainRatio?: boolean };
    shape: {
      type: "circle" | "pill" | "rounded" | "sharp";
      borderRadius: number;
    };
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

  // Event handlers
  onStateChange?: (state: ButtonState) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;

  // UI options
  showWaveform?: boolean;
  showDuration?: boolean;
  autoStart?: boolean;

  // Audio/Haptic settings
  enableAudio?: boolean;
  enableHaptics?: boolean;
  soundPreset?: string;
}

// ===================================================================
// MAIN VOICE BUTTON COMPONENT (REFACTORED)
// ===================================================================

export default function VoiceButton({
  customization = defaultCustomization,
  voiceEnabled = true,
  onVoiceToggle,
  apiKey,
  customPrompt,
  transcriptionPlugin,
  outputPlugin,
  theme,
  size = "medium",
  customCSS = "",
  customSize,
  squishiness,
  chonkiness,
  glowIntensity,
  customText,
  buttonShape,
  buttonConfig,
  onStateChange,
  onTranscript,
  onError,
  showWaveform = true,
  showDuration = true,
  autoStart = false,
  enableAudio = true,
  enableHaptics = true,
  soundPreset = "soft",
}: VoiceButtonProps) {
  // Audio manager instance
  const audioManagerRef = useRef<VoiceButtonAudioManager | null>(null);
  const isClipboardSuccess = signal<boolean>(false);

  // Initialize audio manager
  useEffect(() => {
    const manager = new VoiceButtonAudioManager({
      transcriptionPlugin,
      enableHaptics,
      enableAudio,
      soundPreset,
    });

    audioManagerRef.current = manager;
    manager.initialize();

    // Auto-start if configured
    if (autoStart && voiceEnabled) {
      setTimeout(() => {
        handleRecord();
      }, 1000);
    }

    return () => {
      manager.cleanup();
    };
  }, []);

  // Update audio manager settings when props change
  useEffect(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.setEnableHaptics(enableHaptics);
      audioManagerRef.current.setEnableAudio(enableAudio);
      audioManagerRef.current.setSoundPreset(soundPreset);
      audioManagerRef.current.setTranscriptionPlugin(transcriptionPlugin);
    }
  }, [enableHaptics, enableAudio, soundPreset, transcriptionPlugin]);

  // Watch for state changes
  useEffect(() => {
    if (!audioManagerRef.current) return;

    const unsubscribe = audioManagerRef.current.buttonState.subscribe(
      (state) => {
        onStateChange?.(state);
      },
    );

    return unsubscribe;
  }, [onStateChange]);

  // Watch for transcript changes
  useEffect(() => {
    if (!audioManagerRef.current) return;

    const unsubscribe = audioManagerRef.current.transcript.subscribe(
      (text) => {
        if (text) {
          onTranscript?.(text);
          handleAutoClipboard(text);
        }
      },
    );

    return unsubscribe;
  }, [onTranscript]);

  // Auto-clipboard functionality
  const handleAutoClipboard = async (text: string) => {
    const success = await copyToClipboard(text);
    isClipboardSuccess.value = success;
    if (success) {
      toast.success("Voice magic copied! 🎤✨");
    } else {
      toast.error("Oops, clipboard magic failed!");
    }
  };

  // Handle record button click
  const handleRecord = async () => {
    if (!audioManagerRef.current) return;

    const currentState = audioManagerRef.current.buttonState.value;

    if (currentState === "idle" || currentState === "error") {
      await audioManagerRef.current.startRecording();
    } else if (currentState === "recording") {
      await audioManagerRef.current.stopRecording();
    }
  };

  // Generate button styles
  const buttonStyles = useMemo(() => {
    if (buttonConfig) {
      return generateButtonStyles(buttonConfig);
    }
    return generateButtonStyles({
      ...customization,
      size: { width: 120, height: 120 },
    });
  }, [buttonConfig, customization]);

  const buttonClasses = useMemo(() => {
    return generateButtonClasses(customization);
  }, [customization]);

  // Get current state from audio manager
  const currentState = audioManagerRef.current?.buttonState.value || "idle";
  const currentDuration = audioManagerRef.current?.recordingDuration.value || 0;
  const waveformData = audioManagerRef.current?.waveformData.value || [];
  const errorMessage = audioManagerRef.current?.errorMessage.value || "";

  // Determine text color
  const bgColor = buttonConfig?.appearance?.fill?.solid ||
    customization.colors.primary;
  const textColor = getSmartTextColor(bgColor);

  // Determine button size
  const buttonSize = buttonConfig?.size?.width || 120;

  return (
    <div className="voice-button-container">
      <button
        onClick={handleRecord}
        disabled={!voiceEnabled || currentState === "processing"}
        className={`voice-button ${buttonClasses} ${currentState}`}
        style={{
          ...buttonStyles,
          position: "relative",
          cursor: voiceEnabled ? "pointer" : "not-allowed",
          opacity: voiceEnabled ? 1 : 0.5,
        }}
        aria-label={`Voice recording button - ${currentState}`}
      >
        {/* Button content container */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Waveform visualization */}
          {showWaveform && currentState === "recording" && (
            <WaveformVisualizer
              data={waveformData}
              size={buttonSize}
              color={textColor}
              style="bars"
              opacity={0.6}
            />
          )}

          {/* Button icon or recording content */}
          {currentState === "recording" && showDuration
            ? (
              <RecordingContent
                duration={currentDuration}
                showDuration={showDuration}
                color={textColor}
                buttonConfig={buttonConfig}
              />
            )
            : (
              <ButtonIcon
                state={currentState}
                size={buttonSize}
                color={textColor}
                hideOnRecord={false}
              />
            )}

          {/* Processing spinner */}
          {currentState === "processing" && (
            <div className="processing-spinner" />
          )}

          {/* Success checkmark */}
          {currentState === "success" && (
            <div className="success-checkmark">✓</div>
          )}

          {/* Error message */}
          {currentState === "error" && errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </button>

      {/* Custom text below button */}
      {customText && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "14px",
            color: textColor,
            textAlign: "center",
          }}
        >
          {customText}
        </p>
      )}
    </div>
  );
}
