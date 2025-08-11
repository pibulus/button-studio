// ===================================================================
// HTML STANDALONE TEMPLATE - Self-contained button export
// ===================================================================

import { ButtonCustomization } from "../../../types/customization.ts";
import { generateButtonStyles } from "../../../types/customization.ts";

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
  } = {},
): string {
  const buttonStyles = generateButtonStyles(customization);
  const buttonId = `voice-button-${Date.now()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${customization.content.label || "Voice Button"}</title>
    <meta name="description" content="Custom voice recording button created with ButtonStudio">
    
    <!-- Tailwind CSS CDN for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom styles for button -->
    <style>
        ${getCustomCSS(customization)}
        
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
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
    
    <!-- Main Button Container -->
    <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">
            ${customization.content.label || "Voice Button"}
        </h1>
        
        <!-- Voice Button -->
        <button 
            id="${buttonId}"
            class="voice-button transition-all duration-200 ease-out touch-manipulation"
            style="${buttonStyles}"
            onmousedown="handleMouseDown()"
            onmouseup="handleMouseUp()"
            onmouseleave="handleMouseUp()"
            ontouchstart="handleMouseDown()"
            ontouchend="handleMouseUp()"
            onclick="handleButtonClick()"
        >
            <span class="button-content text-4xl">
                ${customization.content.value}
            </span>
        </button>
        
        <!-- Status Display -->
        <div id="status" class="mt-6 text-lg font-medium text-gray-600">
            ${options.autoStart ? "Ready to auto-record..." : "Click to record"}
        </div>
        
        <!-- API Key Setup (shown when no key) -->
        <div id="api-setup" class="mt-4 max-w-lg mx-auto p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200 ${
    options.apiKey ? "hidden" : ""
  }">
            <h3 class="text-xl font-bold mb-3 text-center">🚀 Enable AI Transcription</h3>
            <p class="text-gray-600 mb-4 text-center">Get a free Gemini API key in 2 minutes:</p>
            
            <div class="space-y-3 text-sm">
                <div class="flex items-center space-x-3">
                    <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</span>
                    <span>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-600 underline font-medium">Google AI Studio</a></span>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</span>
                    <span>Click "Create API key" → "Create API key in new project"</span>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">3</span>
                    <span>Copy your key and paste below:</span>
                </div>
            </div>
            
            <div class="mt-4 space-y-3">
                <input 
                    type="password" 
                    id="api-key-input" 
                    placeholder="Paste your Gemini API key here..." 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                >
                <button onclick="saveApiKey()" class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all">
                    ✨ Save & Start Transcribing
                </button>
            </div>
            
            <p class="text-xs text-gray-500 mt-3 text-center">
                🔒 Your API key stays private in your browser only
            </p>
        </div>

        <!-- Transcript Display -->
        <div id="transcript" class="mt-4 max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md hidden">
            <h3 class="text-lg font-bold mb-2">Transcript:</h3>
            <p id="transcript-text" class="text-gray-800 font-mono text-sm bg-gray-50 p-3 rounded border"></p>
            <button onclick="copyTranscript()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Copy to Clipboard
            </button>
        </div>
        
        ${
    !options.customBranding
      ? `
        <!-- ButtonStudio Attribution -->
        <div class="mt-8 text-sm text-gray-500">
            Created with <a href="https://buttonstudio.app" class="text-blue-500 hover:underline">ButtonStudio</a>
        </div>
        `
      : ""
  }
    </div>

    <script>
        // Voice Button Functionality
        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;
        let currentTranscript = '';
        let userApiKey = ${
    options.apiKey
      ? `'${options.apiKey}'`
      : 'localStorage.getItem("gemini-api-key") || null'
  };
        
        // API Key Management
        function saveApiKey() {
            const input = document.getElementById('api-key-input');
            const apiKey = input.value.trim();
            
            if (!apiKey) {
                alert('Please enter your API key');
                return;
            }
            
            if (!apiKey.startsWith('AIza')) {
                alert('Invalid API key format. Gemini API keys start with "AIza"');
                return;
            }
            
            // Save to localStorage
            localStorage.setItem('gemini-api-key', apiKey);
            userApiKey = apiKey;
            
            // Hide API setup, show ready state
            document.getElementById('api-setup').classList.add('hidden');
            document.getElementById('status').textContent = '🎉 AI Transcription enabled! Click to record';
            
            // Show success feedback
            const button = document.querySelector('#api-setup button');
            const originalText = button.textContent;
            button.textContent = '✅ Saved!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }
        
        // Check API key on load
        window.addEventListener('load', () => {
            if (userApiKey && !${options.apiKey ? "true" : "false"}) {
                document.getElementById('api-setup').classList.add('hidden');
                document.getElementById('status').textContent = 'Click to record';
            }
        });
        
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
    options.includeAI && options.apiKey
      ? `
            try {
                // Convert audio to base64 for Gemini API
                const base64Audio = await blobToBase64(audioBlob);
                
                // Call Gemini API for transcription
                const apiKey = userApiKey || '${options.apiKey || ""}';
                if (!apiKey) {
                    status.textContent = 'Please set up your API key first';
                    return;
                }
                
                const response = await fetch(
                    \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=\${apiKey}\`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: "Transcribe this audio file accurately and completely, removing any redundant 'ums,' 'likes, 'uhs', and similar filler words. Return only the cleaned-up transcription, with no additional text."
                                }, {
                                    inline_data: {
                                        mime_type: audioBlob.type,
                                        data: base64Audio
                                    }
                                }]
                            }]
                        })
                    }
                );
                
                if (response.ok) {
                    const result = await response.json();
                    const transcript = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    
                    if (transcript) {
                        showTranscript(transcript);
                    } else {
                        status.textContent = 'No speech detected';
                    }
                } else {
                    throw new Error('Transcription failed');
                }
            } catch (error) {
                console.error('Transcription error:', error);
                status.textContent = 'Transcription failed. Please try again.';
            }
            `
      : `
            // No AI transcription - show API setup prompt
            status.textContent = 'Recording saved! Set up API key above for transcription ⬆️';
            document.getElementById('api-setup').classList.remove('hidden');
            `
  }
        }
        
        function showTranscript(transcript) {
            currentTranscript = transcript;
            transcriptText.textContent = transcript;
            transcriptDiv.classList.remove('hidden');
            
            ${
    options.autoCopy
      ? `
            // Auto-copy transcript to clipboard
            navigator.clipboard.writeText(transcript).then(() => {
                status.textContent = 'Transcription complete! Auto-copied to clipboard ✅';
            }).catch(() => {
                status.textContent = 'Transcription complete! (Auto-copy failed)';
            });
            `
      : `
            status.textContent = 'Transcription complete!';
            `
  }
        }
        
        function copyTranscript() {
            if (currentTranscript) {
                navigator.clipboard.writeText(currentTranscript).then(() => {
                    // Show temporary feedback
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                });
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

function getCustomCSS(customization: ButtonCustomization): string {
  // Generate custom CSS based on customization
  const { appearance, interactions } = customization;

  return `
    .voice-button {
      width: ${100 * appearance.scale}px;
      height: ${100 * appearance.scale}px;
      border-radius: ${
    appearance.shape === "circle" ? "50%" : appearance.roundness + "px"
  };
      border: ${appearance.borderWidth}px solid ${
    appearance.theme === "minimal" ? "#000" : "#333"
  };
      background: ${
    appearance.fillType === "solid"
      ? appearance.solidColor
      : `linear-gradient(${appearance.gradient.direction}deg, ${appearance.gradient.start}, ${appearance.gradient.end})`
  };
      box-shadow: ${
    appearance.shadowType === "brutalist"
      ? "4px 4px 0px #000"
      : "0 4px 12px rgba(0,0,0,0.15)"
  };
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .voice-button:hover {
      transform: ${
    interactions.hoverEffect === "lift"
      ? "translateY(-2px)"
      : interactions.hoverEffect === "glow"
      ? "scale(1.05)"
      : "none"
  };
    }
    
    .button-content {
      font-size: ${Math.min(appearance.scale * 40, 60)}px;
      line-height: 1;
    }
  `;
}
