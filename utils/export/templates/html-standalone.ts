// ===================================================================
// HTML STANDALONE TEMPLATE - Self-contained button export
// ===================================================================

import { ButtonCustomization } from "../../../types/customization.ts";
import { generateButtonStyles } from "../../../types/customization.ts";

const DEFAULT_OUTPUT_PROMPT =
  "Transcribe this audio file accurately and completely, removing any redundant 'ums,' 'likes, 'uhs', and similar filler words. Return only the cleaned-up transcription, with no additional text.";

export function generateStandaloneHTML(
  customization: ButtonCustomization,
  options: {
    includeAI?: boolean;
    apiKey?: string;
    customPrompt?: string;
    customBranding?: boolean;
    autoStart?: boolean;
    autoCopy?: boolean;
    autoStopOnSilence?: boolean;
    silenceDuration?: number;
    showInstallGuide?: boolean;
  } = {},
): string {
  const buttonStylesObj = generateButtonStyles(customization);
  // Convert style object to inline CSS string, filtering out CSS variables
  const buttonStyles = Object.entries(buttonStylesObj)
    .filter(([key]) => !key.startsWith("--")) // Filter out CSS variables
    .map(([key, value]) => {
      // Convert camelCase to kebab-case for CSS properties
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join("; ");
  const buttonId = `voice-button-${Date.now()}`;
  const appName = escapeHTML(customization.content.label || "Action Button");
  const buttonStyleAttr = escapeAttribute(buttonStyles);
  const buttonContent = escapeHTML(
    customization.content.value || "Boop me!",
  );
  const outputPrompt = options.customPrompt?.trim() ||
    customization.api?.customPrompt?.trim() ||
    DEFAULT_OUTPUT_PROMPT;
  const outputPromptScript = JSON.stringify(outputPrompt);
  const pageDescription =
    "A button app made with ButtonSpa. Open it, tap the button, and let it do useful work.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} - ButtonSpa</title>
    <meta name="description" content="${pageDescription}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${appName} - ButtonSpa Tiny App">
    <meta property="og:description" content="${pageDescription}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${appName} - ButtonSpa Tiny App">
    <meta name="twitter:description" content="${pageDescription}">
    
    <!-- Custom styles for button -->
    <style>
        ${getCustomCSS(customization)}

        body {
            background:
                radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.18), transparent 28%),
                radial-gradient(circle at 82% 18%, rgba(120, 210, 255, 0.20), transparent 30%),
                #f7f0e2;
            color: #111215;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            box-sizing: border-box;
        }

        *,
        *::before,
        *::after {
            box-sizing: inherit;
        }

        .hidden {
            display: none !important;
        }

        .buttonspa-shell {
            width: min(100%, 560px);
            text-align: center;
        }

        .buttonspa-title {
            margin: 0 0 32px;
            color: #1f2937;
            font-size: clamp(28px, 7vw, 44px);
            font-weight: 900;
            line-height: 1.05;
        }

        .status {
            margin-top: 24px;
            color: #4b5563;
            font-size: 18px;
            font-weight: 800;
        }

        .setup-card,
        .output-card {
            width: min(100%, 560px);
            margin: 18px auto 0;
            border: 3px solid #111215;
            border-radius: 22px;
            background: #fffaf2;
            box-shadow: 6px 6px 0 rgba(17, 18, 21, 0.82);
            overflow: hidden;
            text-align: left;
        }

        .setup-card {
            padding: 20px;
            border-style: dashed;
            background: linear-gradient(135deg, #fff1f7, #fff7d6);
        }

        .setup-title,
        .output-title {
            margin: 0;
            color: #111215;
            font-size: 20px;
            font-weight: 900;
            line-height: 1.15;
        }

        .setup-body {
            margin: 8px 0 16px;
            color: #4b5563;
            font-size: 14px;
            line-height: 1.45;
        }

        .setup-steps {
            display: grid;
            gap: 10px;
            margin: 0 0 16px;
            padding: 0;
            list-style: none;
            color: #374151;
            font-size: 14px;
            line-height: 1.35;
        }

        .step-badge {
            display: inline-flex;
            width: 24px;
            height: 24px;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            border-radius: 999px;
            background: #ec4899;
            color: white;
            font-size: 12px;
            font-weight: 900;
        }

        .api-input {
            width: 100%;
            min-height: 48px;
            padding: 12px 14px;
            border: 2px solid #111215;
            border-radius: 12px;
            background: white;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 14px;
        }

        .api-input:focus {
            outline: 4px solid rgba(236, 72, 153, 0.25);
        }

        .primary-action,
        .secondary-action {
            min-height: 48px;
            border: 2px solid #111215;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 15px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 120ms ease, background 120ms ease;
        }

        .primary-action {
            width: 100%;
            margin-top: 12px;
            background: linear-gradient(135deg, #f9a8d4, #fde68a);
            color: #111215;
        }

        .secondary-action {
            background: #111215;
            color: white;
            flex: 1;
        }

        .primary-action:active,
        .secondary-action:active {
            transform: translateY(2px) scale(0.98);
        }

        .privacy-note {
            margin: 12px 0 0;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
        }

        .output-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border-bottom: 3px solid rgba(17, 18, 21, 0.18);
            background: #d8f0a6;
        }

        .output-subtitle {
            margin: 4px 0 0;
            color: rgba(17, 18, 21, 0.62);
            font-size: 13px;
            font-weight: 800;
        }

        .output-pill {
            flex-shrink: 0;
            border: 2px solid rgba(17, 18, 21, 0.72);
            border-radius: 999px;
            background: white;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 900;
        }

        .output-text {
            width: 100%;
            min-height: 180px;
            max-height: 42vh;
            resize: vertical;
            border: 0;
            background: #fffdf7;
            color: #111827;
            padding: 16px;
            font: 600 16px/1.6 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .output-text:focus {
            outline: 4px solid rgba(216, 240, 166, 0.45);
        }

        .output-actions {
            display: flex;
            gap: 12px;
            padding: 14px;
            border-top: 2px solid rgba(17, 18, 21, 0.1);
            background: #fff9f2;
        }

        .attribution {
            margin-top: 32px;
            color: #6b7280;
            font-size: 14px;
        }

        .attribution a,
        .setup-card a {
            color: #be185d;
            font-weight: 800;
        }

        @media (max-width: 520px) {
            body {
                align-items: flex-start;
                padding: 24px 16px;
            }

            .output-actions {
                flex-direction: column;
            }
        }
        
        /* Recording animation */
        .recording {
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        /* Button juice animations */
        .button-pressed {
            transform: scale(0.95) translateY(2px);
            transition: transform 0.1s ease-out;
        }
        
        .button-released {
            transform: scale(1) translateY(0px);
            transition: transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        ${options.showInstallGuide ? getInstallGuideCSS() : ""}
    </style>
</head>
<body>
    
    <!-- Main Button Container -->
    <main class="buttonspa-shell">
        <h1 class="buttonspa-title">
            ${appName}
        </h1>
        
        <!-- Voice Button -->
        <button 
            id="${buttonId}"
            class="voice-button transition-all duration-200 ease-out touch-manipulation"
            style="${buttonStyleAttr}"
            onmousedown="handleMouseDown()"
            onmouseup="handleMouseUp()"
            onmouseleave="handleMouseUp()"
            ontouchstart="handleMouseDown()"
            ontouchend="handleMouseUp()"
            onclick="handleButtonClick()"
        >
            <span class="button-content">
                ${buttonContent}
            </span>
        </button>
        
        <!-- Status Display -->
        <div id="status" class="status">
            ${options.autoStart ? "Ready to auto-record..." : "Click to record"}
        </div>
        
        <!-- API Key Setup (shown when no key) -->
        <div id="api-setup" class="setup-card hidden">
            <h3 class="setup-title">AI Transcription Ready</h3>
            <p class="setup-body">This button uses ButtonSpa's AI to turn recordings into text. Just tap and record — no setup needed.</p>
        </div>

        <!-- Output Display -->
        <div id="transcript" class="output-card hidden">
            <div class="output-header">
                <div>
                    <h3 class="output-title">Output</h3>
                    <p class="output-subtitle">Edit it, copy it, or share it.</p>
                </div>
                <span id="output-state" class="output-pill">Ready</span>
            </div>
            <textarea
                id="transcript-text"
                class="output-text"
                aria-label="Button output"
                oninput="currentTranscript = this.value"
            ></textarea>
            <div class="output-actions">
                <button onclick="copyTranscript(this)" class="secondary-action">
                    Copy Output
                </button>
                <button onclick="shareOutput(this)" class="secondary-action">
                    Share
                </button>
            </div>
        </div>
        
        ${
    !options.customBranding
      ? `
        <!-- ButtonSpa Attribution -->
        <div class="attribution">
            Created with <a href="https://buttonspa.app">ButtonSpa</a>
        </div>
        `
      : ""
  }
    </main>

    ${options.showInstallGuide ? getInstallGuideMarkup() : ""}

    <script>
        // Voice Button Functionality
        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;
        let currentTranscript = '';
        const outputPrompt = ${outputPromptScript};
        const TRANSCRIBE_URL = "https://buttonspa.app/api/transcribe";

        ${
    options.autoStopOnSilence
      ? `
        // Silence Detection Variables
        let audioContext = null;
        let analyser = null;
        let silenceTimeout = null;
        let lastAudioTime = Date.now();
        const silenceDuration = ${
        options.silenceDuration || 3
      } * 1000; // Convert to milliseconds
        const silenceThreshold = -50; // dB threshold for silence
        `
      : ""
  }
        
        const button = document.getElementById('${buttonId}');
        const status = document.getElementById('status');
        const transcriptDiv = document.getElementById('transcript');
        const transcriptText = document.getElementById('transcript-text');

        ${options.showInstallGuide ? getInstallGuideScript() : ""}
        
        // Button interaction handlers
        function handleMouseDown() {
            button.classList.add('button-pressed');
            button.classList.remove('button-released');
        }
        
        function handleMouseUp() {
            button.classList.remove('button-pressed');
            button.classList.add('button-released');
        }
        
        async function handleButtonClick() {
            if (!isRecording) {
                await startRecording();
            } else {
                await stopRecording();
            }
        }
        
        async function startRecording() {
            try {
                // Request microphone permission
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 16000
                    }
                });
                
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                isRecording = true;
                
                ${
    options.autoStopOnSilence
      ? `
                // Set up silence detection
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const source = audioContext.createMediaStreamSource(stream);
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 256;
                    analyser.minDecibels = -90;
                    analyser.maxDecibels = -10;
                    source.connect(analyser);
                    
                    // Start monitoring audio levels
                    monitorAudioLevels();
                } catch (error) {
                    console.warn('Could not set up silence detection:', error);
                }
                `
      : ""
  }
                
                // Update UI
                status.textContent = '${
    options.autoStopOnSilence
      ? "Recording... (Auto-stops on silence)"
      : "Recording... Click to stop"
  }';
                button.classList.add('recording');
                
                // Handle recorded data
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };
                
                // Handle recording stop
                mediaRecorder.onstop = async () => {
                    ${
    options.autoStopOnSilence
      ? `
                    // Clean up silence detection
                    if (silenceTimeout) {
                        clearTimeout(silenceTimeout);
                        silenceTimeout = null;
                    }
                    if (audioContext) {
                        audioContext.close();
                        audioContext = null;
                        analyser = null;
                    }
                    `
      : ""
  }
                    
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    await processAudio(audioBlob);
                };
                
                mediaRecorder.start();
                
            } catch (error) {
                console.error('Error starting recording:', error);
                status.textContent = 'Error: Could not access microphone';
            }
        }
        
        async function stopRecording() {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
                isRecording = false;
                
                // Update UI
                button.classList.remove('recording');
                status.textContent = 'Processing...';
            }
        }
        
        async function processAudio(audioBlob) {
            ${
    options.includeAI !== false
      ? `
            try {
                // Convert audio to base64
                const base64Audio = await blobToBase64(audioBlob);
                
                // Call ButtonSpa's transcription proxy
                const response = await fetch(TRANSCRIBE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audioBase64: base64Audio,
                        mimeType: audioBlob.type,
                        prompt: outputPrompt,
                        sessionId: 'export-' + Date.now(),
                        hasPaid: false,
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const transcript = result.text;
                    
                    if (transcript) {
                        showTranscript(transcript);
                    } else {
                        status.textContent = 'No speech detected';
                    }
                } else {
                    const err = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        status.textContent = 'Daily limit reached. Upgrade at buttonspa.app for unlimited use.';
                    } else {
                        throw new Error(err.error || 'Transcription failed');
                    }
                }
            } catch (error) {
                console.error('Transcription error:', error);
                status.textContent = 'Transcription failed. Check your connection and try again.';
            }
            `
      : `
            status.textContent = 'Recording complete.';
            `
  }
        }
        
        function showTranscript(transcript) {
            currentTranscript = transcript;
            transcriptText.value = transcript;
            transcriptDiv.classList.remove('hidden');
            
            ${
    options.autoCopy
      ? `
            // Auto-copy transcript to clipboard
            navigator.clipboard.writeText(transcript).then(() => {
                document.getElementById('output-state').textContent = 'Copied';
                status.textContent = 'Your output is ready and copied';
            }).catch(() => {
                document.getElementById('output-state').textContent = 'Ready';
                status.textContent = 'Your output is ready';
            });
            `
      : `
            document.getElementById('output-state').textContent = 'Ready';
            status.textContent = 'Your output is ready';
            `
  }
        }
        
        function copyTranscript(trigger) {
            if (currentTranscript) {
                navigator.clipboard.writeText(currentTranscript).then(() => {
                    document.getElementById('output-state').textContent = 'Copied';
                    const originalText = trigger.textContent;
                    trigger.textContent = 'Copied';
                    setTimeout(() => {
                        trigger.textContent = originalText;
                    }, 2000);
                }).catch(() => {
                    status.textContent = 'Could not copy output';
                });
            }
        }

        async function shareOutput(trigger) {
            if (!currentTranscript) return;

            try {
                if (navigator.share) {
                    await navigator.share({
                        title: '${appName} output',
                        text: currentTranscript,
                    });
                    return;
                }

                copyTranscript(trigger);
            } catch (error) {
                if (error && error.name !== 'AbortError') {
                    status.textContent = 'Could not share output';
                }
            }
        }
        
        function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result;
                    const base64data = result.split(',')[1];
                    resolve(base64data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        
        ${
    options.autoStopOnSilence
      ? `
        // Monitor audio levels for silence detection
        function monitorAudioLevels() {
            if (!analyser || !isRecording) return;
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate RMS (Root Mean Square) for volume level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / bufferLength);
            
            // Convert to dB (approximate)
            const db = 20 * Math.log10(rms / 255);
            
            // Check if audio level is above silence threshold
            if (db > silenceThreshold) {
                // Audio detected - reset silence timer
                lastAudioTime = Date.now();
                if (silenceTimeout) {
                    clearTimeout(silenceTimeout);
                    silenceTimeout = null;
                }
            } else {
                // Silence detected - start/continue silence timer
                if (!silenceTimeout) {
                    const timeSinceLastAudio = Date.now() - lastAudioTime;
                    if (timeSinceLastAudio > 500) { // Grace period for brief pauses
                        silenceTimeout = setTimeout(() => {
                            if (isRecording) {
                                status.textContent = 'Auto-stopping due to silence...';
                                stopRecording();
                            }
                        }, Math.max(0, silenceDuration - timeSinceLastAudio));
                    }
                }
            }
            
            // Continue monitoring
            if (isRecording) {
                requestAnimationFrame(monitorAudioLevels);
            }
        }
        `
      : ""
  }
        
        ${
    options.autoStart
      ? `
        // Auto-start recording when page loads
        window.addEventListener('load', () => {
            // Add a small delay for user awareness
            setTimeout(() => {
                status.textContent = 'Auto-starting recording in 3...';
                setTimeout(() => {
                    status.textContent = 'Auto-starting recording in 2...';
                    setTimeout(() => {
                        status.textContent = 'Auto-starting recording in 1...';
                        setTimeout(() => {
                            startRecording();
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        });
        `
      : ""
  }
    </script>
</body>
</html>`;
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function escapeAttribute(value: string): string {
  return escapeHTML(value);
}

function getCustomCSS(customization: ButtonCustomization): string {
  // Generate custom CSS based on customization
  const { appearance, interactions, effects } = customization;

  // Calculate sizes based on scale (match VoiceButton component sizing)
  const baseSize = appearance.shape === "circle" ? 120 : 160;
  const buttonSize = baseSize * appearance.scale;
  const fontSize = Math.min(appearance.scale * 40, 60);

  return `
    .voice-button {
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      position: relative;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: ${interactions.fontWeight || "bold"};
      text-transform: ${interactions.textTransform || "none"};
      transition: all ${interactions.animationSpeed || 1}s;
      ${
    appearance.borderStyle ? `border-style: ${appearance.borderStyle};` : ""
  }
    }
    
    .voice-button:hover {
      transform: ${
    interactions.hoverEffect === "squish"
      ? `scale(${1 - (interactions.squishPower || 6) / 100})`
      : interactions.hoverEffect === "grow"
      ? "scale(1.05)"
      : interactions.hoverEffect === "bright"
      ? "brightness(1.1)"
      : interactions.hoverEffect === "tilt"
      ? "rotate(2deg)"
      : `translateY(-${interactions.hoverLift || 2}px)`
  };
    }
    
    .voice-button:active {
      transform: scale(${
    1 - (interactions.squishPower || 6) / 100
  }) translateY(2px);
    }
    
    .button-content {
      font-size: ${fontSize}px;
      line-height: 1;
      z-index: 10;
      position: relative;
    }
    
    /* Effects */
    ${
    effects.breathing
      ? `
    .voice-button {
      animation: breathing 3s ease-in-out infinite;
    }
    @keyframes breathing {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    `
      : ""
  }
    
    ${
    effects.bounce
      ? `
    .voice-button {
      animation: bounce 2s ease-in-out infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    `
      : ""
  }
    
    ${
    effects.glow
      ? `
    .voice-button {
      animation: glow 2s ease-in-out infinite;
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 157, 0.5); }
      50% { box-shadow: 0 0 40px rgba(255, 107, 157, 0.8); }
    }
    `
      : ""
  }
    
    ${
    effects.pulse
      ? `
    .voice-button {
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    `
      : ""
  }
    
    ${
    effects.shine
      ? `
    .voice-button::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shine 3s infinite;
    }
    @keyframes shine {
      0% { left: -100%; }
      50%, 100% { left: 100%; }
    }
    `
      : ""
  }
  `;
}

function getInstallGuideCSS(): string {
  return `
        body {
            padding-bottom: calc(2rem + env(safe-area-inset-bottom));
        }

        .install-banner {
            position: fixed;
            left: max(16px, env(safe-area-inset-left));
            right: max(16px, env(safe-area-inset-right));
            bottom: max(16px, env(safe-area-inset-bottom));
            z-index: 50;
            display: none;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            max-width: 560px;
            margin: 0 auto;
            padding: 14px;
            border: 3px solid #111215;
            border-radius: 18px;
            background: #fffaf2;
            box-shadow: 5px 5px 0 rgba(17, 18, 21, 0.88);
            text-align: left;
        }

        .install-banner.is-visible {
            display: flex;
        }

        .install-banner__copy {
            min-width: 0;
        }

        .install-banner__title {
            margin: 0;
            font-size: 14px;
            font-weight: 900;
            line-height: 1.15;
        }

        .install-banner__body {
            margin: 3px 0 0;
            color: #4b5563;
            font-size: 12px;
            line-height: 1.3;
        }

        .install-banner__actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .install-banner__button {
            min-height: 44px;
            padding: 0 14px;
            border: 2px solid #111215;
            border-radius: 12px;
            background: #111215;
            color: white;
            font-size: 13px;
            font-weight: 900;
            white-space: nowrap;
        }

        .install-banner__button[hidden] {
            display: none;
        }

        .install-banner__close {
            width: 44px;
            height: 44px;
            border: 2px solid #111215;
            border-radius: 12px;
            background: #fff;
            color: #111215;
            font-size: 22px;
            line-height: 1;
            font-weight: 900;
        }

        @media (max-width: 420px) {
            .install-banner {
                align-items: stretch;
            }

            .install-banner__actions {
                flex-direction: column;
            }
        }

        @media (display-mode: standalone) {
            .install-banner {
                display: none !important;
            }
        }
    `;
}

function getInstallGuideMarkup(): string {
  return `
    <aside id="install-banner" class="install-banner" aria-live="polite">
        <div class="install-banner__copy">
            <p id="install-title" class="install-banner__title">Save this button</p>
            <p id="install-body" class="install-banner__body">Install it on your home screen for one-tap action.</p>
        </div>
        <div class="install-banner__actions">
            <button id="install-action" type="button" class="install-banner__button">Install</button>
            <button id="install-dismiss" type="button" class="install-banner__close" aria-label="Dismiss install help">×</button>
        </div>
    </aside>
  `;
}

function getInstallGuideScript(): string {
  return `
        let deferredInstallPrompt = null;
        const installBanner = document.getElementById('install-banner');
        const installTitle = document.getElementById('install-title');
        const installBody = document.getElementById('install-body');
        const installAction = document.getElementById('install-action');
        const installDismiss = document.getElementById('install-dismiss');
        const installDismissedKey = 'buttonspa-install-dismissed';

        function isStandaloneApp() {
            return window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true;
        }

        function isIOSDevice() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        }

        function isApiSetupVisible() {
            const apiSetup = document.getElementById('api-setup');
            return apiSetup && !apiSetup.classList.contains('hidden');
        }

        function showInstallBanner() {
            if (!installBanner || isStandaloneApp()) return;
            if (isApiSetupVisible()) return;

            const dismissedAt = Number(localStorage.getItem(installDismissedKey) || 0);
            const dismissedRecently = dismissedAt && Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000;
            if (dismissedRecently) return;

            if (isIOSDevice()) {
                installTitle.textContent = 'Save this button to Home Screen';
                installBody.textContent = 'Open in Safari, tap Share, then Add to Home Screen.';
                installAction.hidden = true;
            } else if (deferredInstallPrompt) {
                installTitle.textContent = 'Install this button';
                installBody.textContent = 'Add it as a tiny app with its own custom icon.';
                installAction.hidden = false;
                installAction.textContent = 'Install';
            } else {
                installTitle.textContent = 'Save this button';
                installBody.textContent = 'Use your browser menu to install or add it to the home screen.';
                installAction.hidden = true;
            }

            installBanner.classList.add('is-visible');
        }

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            deferredInstallPrompt = event;
            showInstallBanner();
        });

        window.addEventListener('appinstalled', () => {
            deferredInstallPrompt = null;
            installBanner?.classList.remove('is-visible');
            localStorage.setItem(installDismissedKey, String(Date.now()));
        });

        installAction?.addEventListener('click', async () => {
            if (!deferredInstallPrompt) return;

            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            installBanner?.classList.remove('is-visible');
        });

        installDismiss?.addEventListener('click', () => {
            localStorage.setItem(installDismissedKey, String(Date.now()));
            installBanner?.classList.remove('is-visible');
        });

        window.addEventListener('load', () => {
            setTimeout(showInstallBanner, 900);
        });
  `;
}
