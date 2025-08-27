/**
 * Sound System Test & Documentation
 * 
 * Run this in the browser console to test all available sounds
 * and ensure the sound system is properly integrated.
 */

import { playSound, listAvailableSounds } from "./soundMapping.ts";
import { soundService } from "./soundService.ts";

// ===================================================================
// AVAILABLE SOUNDS REFERENCE
// ===================================================================

export const AVAILABLE_SOUNDS = {
  // PRIMARY INTERACTIONS
  primaryClick: "Heavy click for main actions (export, create)",
  primaryHover: "Hover feedback for primary buttons",
  
  // SECONDARY INTERACTIONS  
  secondaryClick: "Medium click for secondary actions",
  secondaryHover: "Hover feedback for secondary buttons",
  
  // SELECTION SOUNDS
  selectionSelect: "Selection confirmation sound",
  selectionDeselect: "Deselection sound",
  selectionHover: "Hover over selectable items",
  
  // TOGGLE SOUNDS
  toggleOn: "Toggle/switch turned on",
  toggleOff: "Toggle/switch turned off",
  toggleHover: "Hover over toggles",
  
  // PANEL SOUNDS
  panelExpand: "Panel opening/expanding",
  panelCollapse: "Panel closing/collapsing", 
  panelHover: "Hover over panel headers",
  
  // SLIDER SOUNDS
  sliderStep: "Slider movement tick",
  sliderRelease: "Slider release/drop",
  sliderHover: "Hover over sliders",
  
  // COLOR PICKER
  colorSelect: "Color selection sound",
  colorHover: "Hover over color swatches",
  
  // EXPORT/ACTION SOUNDS
  exportCopy: "Copy to clipboard",
  exportSave: "Save/download action",
  exportExport: "Export completion",
  exportShare: "Share link generation",
  
  // FEEDBACK SOUNDS
  feedbackSuccess: "Success notification",
  feedbackError: "Error notification",
  feedbackWarning: "Warning notification",
  feedbackCompletion: "Task completion",
  feedbackCelebration: "Major achievement",
  
  // SPECIAL SOUNDS
  specialDiceRoll: "Random/surprise button",
  specialMagic: "Magic panel actions",
  specialUnlock: "Feature unlock",
  specialAchievement: "Achievement earned",
};

// ===================================================================
// TEST ALL SOUNDS
// ===================================================================

export async function testAllSounds() {
  console.group("🎵 Testing ButtonStudio Sound System");
  
  // List all available sound functions
  console.log("\n📋 Available sound functions:");
  listAvailableSounds();
  
  // Test each category
  const categories = [
    { name: "Primary Actions", sounds: ["primaryClick", "primaryHover"] },
    { name: "Secondary Actions", sounds: ["secondaryClick", "secondaryHover"] },
    { name: "Selection", sounds: ["selectionSelect", "selectionDeselect"] },
    { name: "Toggles", sounds: ["toggleOn", "toggleOff"] },
    { name: "Panels", sounds: ["panelExpand", "panelCollapse"] },
    { name: "Sliders", sounds: ["sliderStep", "sliderRelease"] },
    { name: "Feedback", sounds: ["feedbackSuccess", "feedbackError"] },
  ];
  
  for (const category of categories) {
    console.group(`\n🎯 Testing ${category.name}:`);
    for (const soundName of category.sounds) {
      try {
        console.log(`  Playing ${soundName}...`);
        await playSound[soundName]?.();
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between sounds
      } catch (error) {
        console.error(`  ❌ Failed to play ${soundName}:`, error);
      }
    }
    console.groupEnd();
  }
  
  console.groupEnd();
}

// ===================================================================
// SOUND PACK INFO
// ===================================================================

export const SOUND_PACKS = {
  current: {
    name: "ButtonStudio Default",
    description: "Mix of custom sounds and Kenney UI Audio pack",
    sounds: {
      custom: [
        "scroll-haptic",
        "echo-button",
        "pop-on/pop-off",
        "grab-pop",
        "paste-drop",
        "download",
        "sweet-error",
        "KidsCheer",
      ],
      kenney: [
        "click variations (high/low)",
        "toggle switches",
        "panel maximize/minimize",
        "confirmations",
        "glass sounds",
        "bong effects",
      ],
    },
  },
  available: {
    kenney: {
      total: 100,
      categories: ["clicks", "toggles", "glass", "confirmations", "errors"],
      variations: "Each sound has normal, high, and low pitch variants",
    },
  },
};

// ===================================================================
// INTEGRATION STATUS
// ===================================================================

export const INTEGRATION_STATUS = {
  ✅: {
    "DesignPanel": ["Button shape selection", "Border style selection"],
    "FeelPanel": ["Movement effects toggles", "Visual effects toggles", "Theme selection"],
    "ShipPanel": ["Export actions", "Success/error feedback"],
    "CustomizationPanel": ["Panel expand/collapse"],
  },
  
  "🔧": {
    "ColorPicker": "Needs color selection sounds on swatch clicks",
    "Sliders": "Size/roundness/thickness sliders need step sounds",
    "MagicPanel": "API key input and custom prompt need focus sounds",
    "VoiceButton": "Recording states need appropriate feedback sounds",
  },
};

// Export test function for browser console
if (typeof window !== "undefined") {
  (window as any).testButtonStudioSounds = testAllSounds;
  (window as any).soundSystemStatus = INTEGRATION_STATUS;
  console.log("✨ Sound System Ready!");
  console.log("Run 'testButtonStudioSounds()' in console to test all sounds");
  console.log("Check 'soundSystemStatus' to see integration progress");
}