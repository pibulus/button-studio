// ===================================================================
// iOS SAFARI AUDIO SUPPORT - Handle iOS audio quirks gracefully
// ===================================================================

// Check if running on iOS
export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad Pro detection
}

// Check if running in Safari
export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Check if running as installed PWA
export function isStandalone(): boolean {
  return (globalThis.navigator as unknown as Record<string, unknown>)
        .standalone ===
      true ||
    globalThis.matchMedia("(display-mode: standalone)").matches;
}

// iOS Audio Context singleton - must be created from user gesture
let audioContext: AudioContext | null = null;
let isAudioUnlocked = false;

// Initialize audio context from user gesture (required for iOS)
export async function initializeIOSAudio(): Promise<AudioContext> {
  if (audioContext && isAudioUnlocked) {
    return audioContext;
  }

  try {
    // Create or resume audio context
    if (!audioContext) {
      audioContext = new (globalThis.AudioContext ||
        (globalThis as Record<string, unknown>)
          .webkitAudioContext as typeof AudioContext)();
    }

    // iOS requires resuming the context from a user gesture
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    // Play silent buffer to unlock audio (iOS hack)
    if (isIOS() && !isAudioUnlocked) {
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      source.stop(0.001);
      isAudioUnlocked = true;
      console.log("✅ iOS audio unlocked");
    }

    return audioContext;
  } catch (error) {
    console.error("❌ Failed to initialize iOS audio:", error);
    throw error;
  }
}

// Get shared audio context (safe for iOS)
export function getAudioContext(): AudioContext | null {
  return audioContext;
}

// Check if MediaRecorder is supported with proper codecs
export function getIOSSupportedMimeType(): string {
  const types = [
    "audio/mp4", // iOS prefers mp4
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/wav",
    "audio/aac",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // Fallback for iOS which might not report support correctly
  if (isIOS()) {
    return "audio/mp4"; // iOS default
  }

  return "audio/webm"; // Standard fallback
}

// Request microphone permission with iOS-specific handling
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    // Check if permissions API is available (not on all iOS versions)
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (result.state === "denied") {
          return false;
        }
      } catch {
        // iOS Safari doesn't support permissions.query for microphone
        console.log("Permissions API not available for microphone");
      }
    }

    // Actually request the microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: isIOS() ? 48000 : 16000, // iOS prefers 48kHz
      },
    });

    // Stop the test stream
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error("❌ Microphone permission denied:", error);
    return false;
  }
}

// iOS-specific recording constraints
export function getIOSRecordingConstraints(): MediaStreamConstraints {
  if (isIOS()) {
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000, // iOS works better with 48kHz
        channelCount: 1,
      },
    };
  }

  // Standard constraints for other platforms
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000, // Better for speech recognition
      channelCount: 1,
    },
  };
}

// Prevent iOS Safari bounce scrolling
export function preventIOSBounce(): void {
  if (!isIOS()) return;

  let startY = 0;

  document.addEventListener("touchstart", (e) => {
    startY = e.touches[0].pageY;
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    const element = e.target as HTMLElement;
    const isScrollable = element.scrollHeight > element.clientHeight;

    if (!isScrollable) {
      e.preventDefault();
      return;
    }

    const y = e.touches[0].pageY;
    const isAtTop = element.scrollTop === 0 && y > startY;
    const isAtBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight &&
      y < startY;

    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Fix iOS viewport height (for proper fullscreen)
export function fixIOSViewportHeight(): void {
  if (!isIOS()) return;

  const setViewportHeight = () => {
    const vh = globalThis.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  setViewportHeight();
  globalThis.addEventListener("resize", setViewportHeight);
  globalThis.addEventListener("orientationchange", setViewportHeight);
}

// Handle iOS PWA status bar
export function setupIOSStatusBar(): void {
  if (!isIOS() || !isStandalone()) return;

  // Add padding for status bar in standalone mode
  document.body.style.paddingTop = "20px";

  // Set status bar style dynamically
  const metaTag = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (metaTag) {
    // Change based on theme or time of day
    const isDark =
      globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
    metaTag.setAttribute("content", isDark ? "black-translucent" : "default");
  }
}

// iOS-safe clipboard write
export async function writeToClipboardIOS(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older iOS versions
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

// Initialize all iOS-specific fixes
export function initializeIOSSupport(): void {
  if (!isIOS()) return;

  preventIOSBounce();
  fixIOSViewportHeight();
  setupIOSStatusBar();

  console.log("📱 iOS support initialized", {
    safari: isSafari(),
    standalone: isStandalone(),
    platform: navigator.platform,
  });
}
