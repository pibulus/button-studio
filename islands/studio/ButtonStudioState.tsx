// ===================================================================
// BUTTON STUDIO STATE MANAGEMENT
// Extracted from ButtonStudio.tsx for better organization
// ===================================================================

import { signal } from "@preact/signals";
import {
  ButtonCustomization,
  defaultCustomization,
} from "../../types/customization.ts";

// ===================================================================
// GLOBAL STATE - Main app state using Preact signals
// ===================================================================

// Main customization state
export const customization = signal<ButtonCustomization>(defaultCustomization);

// Voice and transcription state
export const voiceEnabled = signal<boolean>(false);
export const transcriptResult = signal<string>("");
export const showTranscriptModal = signal<boolean>(false);

// API configuration state
export const apiKey = signal<string>(""); // Track API key from Magic panel
export const customPrompt = signal<string>(""); // Track custom prompt from Magic panel

// UI state
export const showExportPanel = signal<boolean>(false);
export const showSoundDesigner = signal<boolean>(false);

// Helper functions for state management
export function resetCustomization() {
  customization.value = defaultCustomization;
}

export function updateCustomization(updates: Partial<ButtonCustomization>) {
  customization.value = {
    ...customization.value,
    ...updates,
  };
}

export function toggleVoiceEnabled() {
  voiceEnabled.value = !voiceEnabled.value;
}

export function setTranscriptResult(transcript: string) {
  transcriptResult.value = transcript;
  showTranscriptModal.value = true;
}

export function closeTranscriptModal() {
  showTranscriptModal.value = false;
}

export function setApiKey(key: string) {
  apiKey.value = key;
}

export function setCustomPrompt(prompt: string) {
  customPrompt.value = prompt;
}

export function toggleExportPanel() {
  showExportPanel.value = !showExportPanel.value;
}

export function toggleSoundDesigner() {
  showSoundDesigner.value = !showSoundDesigner.value;
}
