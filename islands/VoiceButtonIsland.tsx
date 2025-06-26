import VoiceButton from "../components/VoiceButton.tsx";
import type { VoiceButtonEvents, ButtonState, ThemeId, ButtonSize } from "../types/core.ts";

interface VoiceButtonIslandProps {
  // Appearance
  theme?: ThemeId
  size?: ButtonSize
  customCSS?: string
  
  // Behavior
  autoStart?: boolean
  maxDuration?: number
  enableHaptics?: boolean
  enableSounds?: boolean
  showTimer?: boolean
  showWaveform?: boolean
  
  // Event callbacks
  onComplete?: (result: { text: string, confidence: number }) => void
  onError?: (error: { message: string, code: string }) => void
  onStateChange?: (state: ButtonState) => void
}

export default function VoiceButtonIsland(props: VoiceButtonIslandProps) {
  return <VoiceButton {...props} />;
}