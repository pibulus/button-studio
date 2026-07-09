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
  const rawAppName = customization.content.label || "Action Button";
  const appName = escapeHTML(rawAppName);
  const buttonStyleAttr = escapeAttribute(buttonStyles);
  const buttonContent = escapeHTML(
    customization.content.value || "Boop me!",
  );
  const outputPrompt = options.customPrompt?.trim() ||
    customization.api?.customPrompt?.trim() ||
    DEFAULT_OUTPUT_PROMPT;
  const outputPromptScript = jsonForScript(outputPrompt);
  const appNameScript = jsonForScript(rawAppName);
  const outputFormat = customization.api?.format === "list" ||
      customization.api?.format === "sections"
    ? customization.api.format
    : "text";
  const outputFormatScript = jsonForScript(outputFormat);
  // Stable per-button storage key so history survives reloads but doesn't
  // collide across different buttons installed on the same device. Derived
  // from the label (not buttonId, which is Date.now()-based and would mint
  // a new bucket on every export/re-export of "the same" button).
  const historyKey = `buttonspa-history-${simpleHash(rawAppName)}`;
  const historyKeyScript = jsonForScript(historyKey);
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

        /* ---------------------------------------------------------------
           Spacing scale — one rhythm for the whole page.
           4 (hairline) · 8 (tight) · 16 (base) · 24 (section) · 32 (stack)
           --------------------------------------------------------------- */
        :root {
            --space-1: 4px;
            --space-2: 8px;
            --space-3: 16px;
            --space-4: 24px;
            --space-5: 32px;
            --card-radius: 22px;
            --card-border: 3px solid #111215;
            --card-shadow: 6px 6px 0 rgba(17, 18, 21, 0.82);
            --ink: #111215;
            --ink-soft: #4b5563;
        }

        html {
            height: 100%;
        }

        body {
            background:
                radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.18), transparent 28%),
                radial-gradient(circle at 82% 18%, rgba(120, 210, 255, 0.20), transparent 30%),
                #f7f0e2;
            color: var(--ink);
            min-height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            padding:
                max(var(--space-5), env(safe-area-inset-top))
                max(var(--space-4), env(safe-area-inset-right))
                max(var(--space-5), env(safe-area-inset-bottom))
                max(var(--space-4), env(safe-area-inset-left));
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

        /* Single centered column. Flex (not text-align) so it also centers
           block-level children like .voice-button, whose display:flex makes
           text-align:center on the parent a no-op for it. Vertically
           centered on tall screens (margin: auto top/bottom via a min-height
           flex parent); becomes top-aligned automatically once content is
           taller than the viewport because flexbox never shrinks it below
           natural height — nothing gets clipped. */
        .buttonspa-shell {
            width: 100%;
            max-width: 460px;
            margin: auto 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        /* App name reads as a little pinned tag above the button, not a
           stranded heading. Chunky border + hard shadow ties it to the
           toy-brutalist card language below. */
        .buttonspa-title {
            display: inline-block;
            margin: 0 0 var(--space-4);
            padding: 6px 16px;
            color: var(--ink);
            background: #fffaf2;
            border: 2px solid var(--ink);
            border-radius: 999px;
            box-shadow: 3px 3px 0 rgba(17, 18, 21, 0.82);
            font-size: clamp(18px, 5vw, 24px);
            font-weight: 900;
            letter-spacing: -0.01em;
            line-height: 1.1;
            transform: rotate(-1.5deg);
        }

        /* Hero button gets the biggest chunk of breathing room on either
           side of it — it's the thing everything else orbits. A slow idle
           breath makes it feel alive and tappable at rest. The breath only
           runs at idle: press (.button-pressed/.button-released) and
           recording (.recording) set their own transforms/animation, so we
           scope breathe off when any of those classes are present to avoid
           a fight in the cascade. */
        #${buttonId} {
            margin: 0 auto;
        }

        #${buttonId}:not(.recording):not(.button-pressed):not(.button-released) {
            animation: buttonspa-breathe 4s ease-in-out infinite;
        }

        @keyframes buttonspa-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
        }

        .status {
            margin-top: var(--space-4);
            color: var(--ink-soft);
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.01em;
        }

        .output-card {
            width: 100%;
            max-width: 460px;
            margin: var(--space-4) auto 0;
            border: var(--card-border);
            border-radius: var(--card-radius);
            background: #fffaf2;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            text-align: left;
        }

        .output-title {
            margin: 0;
            color: var(--ink);
            font-size: 18px;
            font-weight: 900;
            line-height: 1.15;
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
            margin-top: var(--space-2);
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
            background: #ffe9c7;
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

        .output-card.is-error .output-header {
            background: #fecaca;
        }

        .output-error-text {
            margin: 0;
            padding: 16px;
            color: #991b1b;
            font-size: 15px;
            font-weight: 700;
            line-height: 1.5;
        }

        .voice-button:disabled,
        .voice-button[aria-busy="true"] {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .attribution {
            width: 100%;
            max-width: 460px;
            margin: var(--space-5) auto 0;
            color: #9ca3af;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        }

        .attribution a {
            color: #be185d;
            font-weight: 800;
        }

        @media (max-width: 520px) {
            body {
                padding:
                    max(var(--space-4), env(safe-area-inset-top))
                    max(var(--space-3), env(safe-area-inset-right))
                    max(var(--space-4), env(safe-area-inset-bottom))
                    max(var(--space-3), env(safe-area-inset-left));
            }

            .output-actions {
                flex-direction: column;
            }
        }

        /* Give the hero room to breathe on real desktop viewports without
           feeling lost — a touch more vertical space around the column. */
        @media (min-width: 640px) and (min-height: 700px) {
            .buttonspa-title {
                margin-bottom: var(--space-4);
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

        /* Recording timer + live level meter — sits close under the status
           line, still part of the same tight column under the button. */
        .recording-meter {
            display: none;
            flex-direction: column;
            align-items: center;
            gap: var(--space-2);
            margin-top: var(--space-3);
        }

        .recording-meter.is-visible {
            display: flex;
        }

        .recording-timer {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 15px;
            font-weight: 900;
            color: #111215;
        }

        .recording-bars {
            display: flex;
            align-items: flex-end;
            gap: 3px;
            height: 28px;
        }

        .recording-bar {
            width: 5px;
            height: 4px;
            border-radius: 3px;
            background: #ec4899;
            border: 1px solid #111215;
            transition: height 60ms ease-out;
        }

        /* History section — same card language as .output-card so the two
           read as one system (border weight, radius, shadow direction). */
        .history-card {
            width: 100%;
            max-width: 460px;
            margin: var(--space-4) auto 0;
            border: var(--card-border);
            border-radius: var(--card-radius);
            background: #fffaf2;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            text-align: left;
        }

        .history-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border: 0;
            background: #ffd9ec;
            color: #111215;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            text-align: left;
        }

        .history-toggle-caret {
            transition: transform 160ms ease;
        }

        .history-card.is-open .history-toggle-caret {
            transform: rotate(180deg);
        }

        .history-body {
            display: none;
            padding: 12px 14px 16px;
        }

        .history-card.is-open .history-body {
            display: block;
        }

        .history-clear-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
        }

        .history-clear {
            border: 2px solid #111215;
            border-radius: 10px;
            background: white;
            color: #991b1b;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
        }

        .history-empty {
            margin: 0;
            padding: 8px 4px;
            color: #6b7280;
            font-size: 13px;
            font-weight: 700;
        }

        .history-list {
            display: grid;
            gap: 10px;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .history-entry {
            border: 2px solid #111215;
            border-radius: 14px;
            background: #fffdf7;
            box-shadow: 3px 3px 0 rgba(17, 18, 21, 0.5);
            overflow: hidden;
        }

        .history-entry-main {
            width: 100%;
            display: block;
            padding: 10px 12px;
            border: 0;
            background: transparent;
            color: #111215;
            text-align: left;
            cursor: pointer;
            font: inherit;
        }

        .history-entry-time {
            margin: 0 0 4px;
            color: #6b7280;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }

        .history-entry-preview {
            margin: 0;
            color: #374151;
            font-size: 13px;
            font-weight: 700;
            line-height: 1.35;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .history-entry-actions {
            display: flex;
            gap: 8px;
            padding: 0 12px 10px;
        }

        .history-entry-actions button {
            border: 2px solid #111215;
            border-radius: 8px;
            background: white;
            color: #111215;
            padding: 5px 9px;
            font-size: 11px;
            font-weight: 900;
            cursor: pointer;
        }

        .history-entry-actions .history-entry-delete {
            color: #991b1b;
        }

        /* Structured output: checklist */
        .output-checklist {
            display: grid;
            gap: 2px;
            margin: 0;
            padding: 12px 16px;
            list-style: none;
            background: #fffdf7;
        }

        .output-checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 8px 4px;
            border-bottom: 1px dashed rgba(17, 18, 21, 0.15);
        }

        .output-checklist-item:last-child {
            border-bottom: 0;
        }

        .output-checklist-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin-top: 1px;
            flex-shrink: 0;
            accent-color: #ec4899;
        }

        .output-checklist-item label {
            color: #111827;
            font-size: 15px;
            font-weight: 600;
            line-height: 1.5;
        }

        .output-checklist-item.is-checked label {
            color: #9ca3af;
            text-decoration: line-through;
        }

        /* Structured output: sections */
        .output-sections {
            display: grid;
            gap: 14px;
            margin: 0;
            padding: 16px;
            background: #fffdf7;
        }

        .output-section-block {
            border-left: 4px solid #ec4899;
            padding-left: 12px;
        }

        .output-section-heading {
            margin: 0 0 4px;
            color: #111215;
            font-size: 15px;
            font-weight: 900;
        }

        .output-section-body {
            margin: 0;
            color: #111827;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.55;
            white-space: pre-wrap;
        }

        /* Every touch target stays comfortably tappable regardless of the
           user's chosen button size/theme. */
        .secondary-action,
        .history-toggle,
        .history-clear,
        .history-entry-actions button {
            min-height: 44px;
        }

        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
                scroll-behavior: auto !important;
            }
        }

        ${options.showInstallGuide ? getInstallGuideCSS() : ""}
    </style>
</head>
<body>
    <!-- Main Button Container -->
    <main class="buttonspa-shell">
        <h1 class="buttonspa-title">${appName}</h1>

        <!-- Voice Button -->
        <button
            id="${buttonId}"
            class="voice-button transition-all duration-200 ease-out touch-manipulation"
            style="${buttonStyleAttr}"
            aria-busy="false"
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
            ${options.autoStart ? "Warming up..." : "Tap me and talk"}
        </div>

        ${
    options.includeAI !== false
      ? `
        <!-- Recording timer + live level meter -->
        <div id="recording-meter" class="recording-meter">
            <div id="recording-timer" class="recording-timer">0:00</div>
            <div id="recording-bars" class="recording-bars" aria-hidden="true"></div>
        </div>
        `
      : ""
  }

        <!-- Output Display -->
        <div id="transcript" class="output-card hidden">
            <div class="output-header">
                <div>
                    <h3 id="output-title" class="output-title">Output</h3>
                    <p id="output-subtitle" class="output-subtitle">Edit it, copy it, or share it.</p>
                </div>
                <span id="output-state" class="output-pill">Ready</span>
            </div>
            <p id="output-error-text" class="output-error-text hidden" role="alert"></p>
            <textarea
                id="transcript-text"
                class="output-text"
                aria-label="Button output"
                oninput="currentTranscript = this.value"
            ></textarea>
            <ul id="output-checklist" class="output-checklist hidden" aria-label="Button output checklist"></ul>
            <div id="output-sections" class="output-sections hidden" aria-label="Button output sections"></div>
            <div id="output-actions" class="output-actions">
                <button onclick="copyTranscript(this)" class="secondary-action">
                    Copy Output
                </button>
                <button onclick="shareOutput(this)" class="secondary-action">
                    Share
                </button>
            </div>
        </div>

        ${
    options.includeAI !== false
      ? `
        <!-- History -->
        <section id="history-card" class="history-card hidden">
            <button type="button" id="history-toggle" class="history-toggle" onclick="toggleHistory()" aria-expanded="false">
                <span id="history-toggle-label">History</span>
                <span class="history-toggle-caret" aria-hidden="true">▾</span>
            </button>
            <div id="history-body" class="history-body">
                <div class="history-clear-row">
                    <button type="button" class="history-clear" onclick="clearHistory()">Clear all</button>
                </div>
                <ul id="history-list" class="history-list"></ul>
            </div>
        </section>
        `
      : ""
  }

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
        let isProcessing = false;
        let currentTranscript = '';
        let currentResult = null; // last rendered result: { text, items, sections, format }
        const outputPrompt = ${outputPromptScript};
        const TRANSCRIBE_URL = "https://buttonspa.app/api/transcribe";
        const TRANSCRIBE_TIMEOUT_MS = 30000;

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

        ${
    options.includeAI !== false
      ? `
        const outputFormat = ${outputFormatScript};
        const HISTORY_KEY = ${historyKeyScript};
        const HISTORY_LIMIT = 50;
        const MAX_RECORDING_MS = 120000; // soft cap so a pocket-dial can't record forever

        // Recording timer + live level meter state (always set up, independent
        // of the silence-detection AnalyserNode above which only exists when
        // autoStopOnSilence is on).
        let meterAudioContext = null;
        let meterAnalyser = null;
        let meterSource = null;
        let meterRafId = null;
        let recordingStartedAt = null;
        let recordingTimerInterval = null;
        let maxDurationTimeout = null;
        const METER_BAR_COUNT = 12;
        `
      : ""
  }
        
        const button = document.getElementById('${buttonId}');
        const status = document.getElementById('status');
        const transcriptDiv = document.getElementById('transcript');
        const transcriptText = document.getElementById('transcript-text');
        const outputErrorText = document.getElementById('output-error-text');
        const outputActions = document.getElementById('output-actions');
        const outputState = document.getElementById('output-state');
        const outputChecklist = document.getElementById('output-checklist');
        const outputSections = document.getElementById('output-sections');

        ${
    options.includeAI !== false
      ? `
        const recordingMeter = document.getElementById('recording-meter');
        const recordingTimerEl = document.getElementById('recording-timer');
        const recordingBarsEl = document.getElementById('recording-bars');
        const historyCard = document.getElementById('history-card');
        const historyToggleLabel = document.getElementById('history-toggle-label');
        const historyList = document.getElementById('history-list');
        `
      : ""
  }

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
            if (isProcessing) return;

            if (!isRecording) {
                await startRecording();
            } else {
                await stopRecording();
            }
        }

        function setProcessing(processing) {
            isProcessing = processing;
            button.disabled = processing;
            button.setAttribute('aria-busy', processing ? 'true' : 'false');
        }

        function showOutputError(message) {
            currentTranscript = '';
            transcriptDiv.classList.remove('hidden');
            transcriptDiv.classList.add('is-error');
            outputErrorText.textContent = message;
            outputErrorText.classList.remove('hidden');
            transcriptText.classList.add('hidden');
            outputActions.classList.add('hidden');
            outputState.textContent = 'Error';
        }

        function clearOutputError() {
            transcriptDiv.classList.remove('is-error');
            outputErrorText.classList.add('hidden');
            outputErrorText.textContent = '';
            transcriptText.classList.remove('hidden');
            outputActions.classList.remove('hidden');
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

                ${
    options.includeAI !== false ? "startRecordingMeter(stream);" : ""
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
                    ${
    options.includeAI !== false ? "stopRecordingMeter();" : ""
  }

                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    await processAudio(audioBlob);
                };

                mediaRecorder.start();

            } catch (error) {
                console.error('Error starting recording:', error);
                if (error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
                    status.textContent = 'Microphone permission denied — check your browser settings';
                } else if (error && error.name === 'NotFoundError') {
                    status.textContent = 'No microphone found';
                } else {
                    status.textContent = 'Error: Could not access microphone';
                }
            }
        }

        async function stopRecording(reason) {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
                isRecording = false;
                setProcessing(true);

                // Update UI
                button.classList.remove('recording');
                status.textContent = reason === 'max-duration'
                    ? 'Hit the 2 minute cap — wrapping up...'
                    : 'Processing...';
            }
        }

        ${
    options.includeAI !== false
      ? `
        // ---------------------------------------------------------------
        // Recording timer + REAL live level meter (driven by actual mic
        // amplitude, not a fake random pulse). Independent of the
        // silence-detection AnalyserNode above — this one always runs
        // while recording so users can see it's really listening.
        // ---------------------------------------------------------------
        function buildMeterBars() {
            if (!recordingBarsEl || recordingBarsEl.childElementCount > 0) return;
            for (let i = 0; i < METER_BAR_COUNT; i++) {
                const bar = document.createElement('div');
                bar.className = 'recording-bar';
                recordingBarsEl.appendChild(bar);
            }
        }

        function startRecordingMeter(stream) {
            if (!recordingMeter) return;
            buildMeterBars();
            recordingMeter.classList.add('is-visible');

            // Timer
            recordingStartedAt = Date.now();
            updateRecordingTimer();
            recordingTimerInterval = setInterval(updateRecordingTimer, 250);

            // Soft max-duration cap so a pocket-dial doesn't record forever
            maxDurationTimeout = setTimeout(() => {
                if (isRecording) stopRecording('max-duration');
            }, MAX_RECORDING_MS);

            // Real amplitude meter
            try {
                meterAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                meterSource = meterAudioContext.createMediaStreamSource(stream);
                meterAnalyser = meterAudioContext.createAnalyser();
                meterAnalyser.fftSize = 256;
                meterSource.connect(meterAnalyser);
                drawMeterFrame();
            } catch (error) {
                console.warn('Could not set up level meter:', error);
            }
        }

        function updateRecordingTimer() {
            if (!recordingTimerEl || !recordingStartedAt) return;
            const elapsedSec = Math.floor((Date.now() - recordingStartedAt) / 1000);
            const mins = Math.floor(elapsedSec / 60);
            const secs = elapsedSec % 60;
            recordingTimerEl.textContent = mins + ':' + String(secs).padStart(2, '0');
        }

        function drawMeterFrame() {
            if (!meterAnalyser || !isRecording) return;

            const bufferLength = meterAnalyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            meterAnalyser.getByteTimeDomainData(dataArray);

            // Amplitude from the time-domain waveform (0 = silence, ~1 = loud)
            let peak = 0;
            for (let i = 0; i < bufferLength; i++) {
                const deviation = Math.abs(dataArray[i] - 128) / 128;
                if (deviation > peak) peak = deviation;
            }

            if (recordingBarsEl) {
                const bars = recordingBarsEl.children;
                for (let i = 0; i < bars.length; i++) {
                    // Slight per-bar jitter so it reads as a live meter, not one block
                    const jitter = 0.75 + (Math.sin(i * 1.7 + Date.now() / 120) + 1) * 0.125;
                    const height = Math.max(4, Math.min(28, peak * 60 * jitter));
                    bars[i].style.height = height + 'px';
                    bars[i].style.opacity = String(Math.max(0.35, Math.min(1, 0.35 + peak * 2)));
                }
            }

            meterRafId = requestAnimationFrame(drawMeterFrame);
        }

        function stopRecordingMeter() {
            if (recordingTimerInterval) {
                clearInterval(recordingTimerInterval);
                recordingTimerInterval = null;
            }
            if (maxDurationTimeout) {
                clearTimeout(maxDurationTimeout);
                maxDurationTimeout = null;
            }
            if (meterRafId) {
                cancelAnimationFrame(meterRafId);
                meterRafId = null;
            }
            if (meterSource) {
                try { meterSource.disconnect(); } catch (error) { /* already gone */ }
                meterSource = null;
            }
            if (meterAnalyser) {
                meterAnalyser = null;
            }
            if (meterAudioContext) {
                meterAudioContext.close().catch(() => {});
                meterAudioContext = null;
            }
            recordingStartedAt = null;
            if (recordingMeter) recordingMeter.classList.remove('is-visible');
            if (recordingBarsEl) {
                const bars = recordingBarsEl.children;
                for (let i = 0; i < bars.length; i++) {
                    bars[i].style.height = '4px';
                    bars[i].style.opacity = '1';
                }
            }
        }
        `
      : ""
  }

        async function processAudio(audioBlob) {
            ${
    options.includeAI !== false
      ? `
            const timeoutController = new AbortController();
            const timeoutId = setTimeout(() => timeoutController.abort(), TRANSCRIBE_TIMEOUT_MS);

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
                        format: outputFormat,
                        sessionId: 'export-' + Date.now(),
                        hasPaid: false,
                    }),
                    signal: timeoutController.signal,
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const result = await response.json();

                    if (result.text || (result.items && result.items.length) || (result.sections && result.sections.length)) {
                        handleResult({
                            text: result.text || '',
                            items: Array.isArray(result.items) ? result.items : undefined,
                            sections: Array.isArray(result.sections) ? result.sections : undefined,
                            format: outputFormat,
                        });
                    } else {
                        clearOutputError();
                        status.textContent = 'No speech detected';
                    }
                } else {
                    const err = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        showOutputError("That's your 20 for today. Chip in at buttonspa.app to go unlimited.");
                    } else {
                        throw new Error(err.error || 'Transcription failed');
                    }
                }
            } catch (error) {
                clearTimeout(timeoutId);
                console.error('Transcription error:', error);
                if (error && error.name === 'AbortError') {
                    showOutputError('Taking too long — try again.');
                } else {
                    showOutputError('Transcription failed. Check your connection and try again.');
                }
            } finally {
                setProcessing(false);
            }
            `
      : `
            status.textContent = 'Recording complete.';
            setProcessing(false);
            `
  }
        }
        
        ${
    options.includeAI !== false
      ? `
        // -------------------------------------------------------------
        // Unified result pipeline: a fresh transcription AND tapping a
        // history entry both flow through here, so history and the live
        // output can never drift apart.
        // -------------------------------------------------------------
        function handleResult(result) {
            saveHistoryEntry(result);
            renderResult(result);

            ${
        options.autoCopy
          ? `
            // Auto-copy the flat-text fallback to clipboard
            navigator.clipboard.writeText(result.text || '').then(() => {
                outputState.textContent = 'Copied';
                status.textContent = 'Your output is ready and copied';
            }).catch(() => {
                outputState.textContent = 'Ready';
                status.textContent = 'Your output is ready';
            });
            `
          : `
            outputState.textContent = 'Ready';
            status.textContent = 'Your output is ready';
            `
      }
        }

        // Renders a result — structured (checklist/sections) when the
        // format asked for it AND the server actually returned that shape;
        // otherwise falls back to the plain editable textarea. Never assumes
        // items/sections exist just because a structured format was requested,
        // since the server degrades to { text } on a bad model response.
        function renderResult(result) {
            clearOutputError();
            currentResult = result;
            currentTranscript = result.text || '';
            transcriptDiv.classList.remove('hidden');

            const hasItems = result.format === 'list' && Array.isArray(result.items) && result.items.length > 0;
            const hasSections = result.format === 'sections' && Array.isArray(result.sections) && result.sections.length > 0;

            if (hasItems) {
                renderChecklist(result.items);
                transcriptText.classList.add('hidden');
                outputSections.classList.add('hidden');
                outputChecklist.classList.remove('hidden');
            } else if (hasSections) {
                renderSections(result.sections);
                transcriptText.classList.add('hidden');
                outputChecklist.classList.add('hidden');
                outputSections.classList.remove('hidden');
            } else {
                transcriptText.value = currentTranscript;
                outputChecklist.classList.add('hidden');
                outputSections.classList.add('hidden');
                transcriptText.classList.remove('hidden');
            }
        }

        function renderChecklist(items) {
            outputChecklist.innerHTML = '';
            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'output-checklist-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'checklist-item-' + index;
                checkbox.addEventListener('change', () => {
                    li.classList.toggle('is-checked', checkbox.checked);
                });

                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = item;

                li.appendChild(checkbox);
                li.appendChild(label);
                outputChecklist.appendChild(li);
            });
        }

        function renderSections(sections) {
            outputSections.innerHTML = '';
            sections.forEach((section) => {
                const block = document.createElement('div');
                block.className = 'output-section-block';

                const heading = document.createElement('h4');
                heading.className = 'output-section-heading';
                heading.textContent = section.heading;

                const body = document.createElement('p');
                body.className = 'output-section-body';
                body.textContent = section.body;

                block.appendChild(heading);
                block.appendChild(body);
                outputSections.appendChild(block);
            });
        }

        // -------------------------------------------------------------
        // Local history (localStorage) — guarded so a storage failure
        // (private browsing, quota) never breaks recording/transcription.
        // -------------------------------------------------------------
        function loadHistory() {
            try {
                const raw = localStorage.getItem(HISTORY_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.warn('Could not read history:', error);
                return [];
            }
        }

        function writeHistory(entries) {
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
            } catch (error) {
                console.warn('Could not save history:', error);
            }
        }

        function saveHistoryEntry(result) {
            try {
                const entries = loadHistory();
                entries.unshift({
                    id: 'h-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
                    timestamp: Date.now(),
                    text: result.text || '',
                    items: result.items,
                    sections: result.sections,
                    format: result.format || 'text',
                });
                writeHistory(entries.slice(0, HISTORY_LIMIT));
                renderHistoryList();
            } catch (error) {
                console.warn('Could not save history entry:', error);
            }
        }

        function formatHistoryTimestamp(timestamp) {
            try {
                const date = new Date(timestamp);
                const now = new Date();
                const isToday = date.toDateString() === now.toDateString();
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const isYesterday = date.toDateString() === yesterday.toDateString();
                const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                if (isToday) return time + ' \\u00b7 today';
                if (isYesterday) return time + ' \\u00b7 yesterday';
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' \\u00b7 ' + time;
            } catch (error) {
                return '';
            }
        }

        function renderHistoryList() {
            if (!historyCard || !historyList) return;

            const entries = loadHistory();

            if (entries.length === 0) {
                historyCard.classList.add('hidden');
                historyList.innerHTML = '';
                return;
            }

            historyCard.classList.remove('hidden');
            historyToggleLabel.textContent = 'History (' + entries.length + ')';
            historyList.innerHTML = '';

            entries.forEach((entry) => {
                const li = document.createElement('li');
                li.className = 'history-entry';

                const main = document.createElement('button');
                main.type = 'button';
                main.className = 'history-entry-main';
                main.addEventListener('click', () => {
                    renderResult(entry);
                    status.textContent = 'Showing a past entry';
                    transcriptDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });

                const time = document.createElement('p');
                time.className = 'history-entry-time';
                time.textContent = formatHistoryTimestamp(entry.timestamp);

                const preview = document.createElement('p');
                preview.className = 'history-entry-preview';
                preview.textContent = historyPreviewText(entry);

                main.appendChild(time);
                main.appendChild(preview);

                const actions = document.createElement('div');
                actions.className = 'history-entry-actions';

                const copyBtn = document.createElement('button');
                copyBtn.type = 'button';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', () => {
                    const text = historyPreviewText(entry, true);
                    navigator.clipboard.writeText(text).then(() => {
                        const original = copyBtn.textContent;
                        copyBtn.textContent = 'Copied';
                        setTimeout(() => { copyBtn.textContent = original; }, 1500);
                    }).catch(() => {});
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'history-entry-delete';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => {
                    deleteHistoryEntry(entry.id);
                });

                actions.appendChild(copyBtn);
                actions.appendChild(deleteBtn);

                li.appendChild(main);
                li.appendChild(actions);
                historyList.appendChild(li);
            });
        }

        // Full copyable text for an entry: prefers the stored flat text, but
        // reconstructs it from items/sections if text is missing/stale.
        function historyPreviewText(entry, full) {
            if (entry.text) return entry.text;
            if (Array.isArray(entry.items) && entry.items.length) {
                return entry.items.join(full ? '\\n' : ' \\u00b7 ');
            }
            if (Array.isArray(entry.sections) && entry.sections.length) {
                return entry.sections.map((s) => s.heading + (full ? '\\n' + s.body : '')).join(full ? '\\n\\n' : ' \\u00b7 ');
            }
            return '';
        }

        function deleteHistoryEntry(id) {
            const entries = loadHistory().filter((entry) => entry.id !== id);
            writeHistory(entries);
            renderHistoryList();
        }

        function clearHistory() {
            writeHistory([]);
            renderHistoryList();
        }

        function toggleHistory() {
            if (!historyCard) return;
            const isOpen = historyCard.classList.toggle('is-open');
            const toggleBtn = document.getElementById('history-toggle');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
        `
      : ""
  }

        // Copyable text for the CURRENT output: prefers the live textarea's
        // (possibly hand-edited) value, falls back to reconstructing plain
        // text from a structured result if there's no flat text.
        function currentCopyText() {
            if (currentTranscript) return currentTranscript;
            if (currentResult && typeof historyPreviewText === 'function') {
                return historyPreviewText(currentResult, true);
            }
            return '';
        }

        function copyTranscript(trigger) {
            const text = currentCopyText();
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
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
            const text = currentCopyText();
            if (!text) return;

            try {
                if (navigator.share) {
                    await navigator.share({
                        title: ${appNameScript} + ' output',
                        text: text,
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
    options.includeAI !== false
      ? `
        // Cold load: render any history saved from previous sessions so a
        // diary entry recorded yesterday is still there today.
        renderHistoryList();
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

// Small, stable, non-cryptographic string hash (djb2) used to derive a
// per-button localStorage key from the button's label. Doesn't need to be
// collision-proof — worst case two differently-labeled buttons share a
// history bucket, which is a mild UX nit, not a data-loss bug.
function simpleHash(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
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

// Safely embed a JSON-serializable value inside a <script> block.
// JSON.stringify does NOT escape "</script>", which lets user-controlled
// strings break out of the script tag and inject arbitrary markup/script.
// Escaping "<" (and the JS line terminators U+2028/U+2029, which are legal
// in JSON strings but illegal unescaped in JS string literals) neutralizes
// that without changing the decoded value.
function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003C")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function getCustomCSS(customization: ButtonCustomization): string {
  // Generate custom CSS based on customization
  const { appearance, interactions, effects } = customization;

  // Calculate sizes based on scale (match VoiceButton component sizing)
  const baseSize = appearance.shape === "circle" ? 120 : 160;
  const buttonSize = baseSize * appearance.scale;
  const fontSize = Math.min(appearance.scale * 40, 60);

  return `
    /* ROOT FIX: .voice-button is display:flex, so the parent's
       text-align:center (which only centers inline/inline-block content)
       can't center it — it was sitting flush left. margin-left/right:auto
       centers it as a block-level flex item within the column. */
    .voice-button {
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      position: relative;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
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
      : interactions.hoverEffect === "tilt"
      ? "rotate(2deg)"
      : interactions.hoverEffect === "bright"
      ? "none"
      : `translateY(-${interactions.hoverLift || 2}px)`
  };
      ${interactions.hoverEffect === "bright" ? "filter: brightness(1.1);" : ""}
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
