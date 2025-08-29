import { ButtonCustomization, ButtonTheme } from "../types/customization.ts";
import { signal } from "@preact/signals";
import { playSound } from "../utils/audio/soundMapping.ts";
import { hapticService } from "../utils/audio/hapticService.ts";

// Import modular panel components
import CollapsiblePanel from "./panels/CollapsiblePanel.tsx";
import DesignPanel from "./panels/DesignPanel.tsx";
import FeelPanel from "./panels/FeelPanel.tsx";
import MagicPanel from "./panels/MagicPanel.tsx";
import ShipPanel from "./panels/ShipPanel.tsx";

interface CustomizationPanelProps {
  customization: ButtonCustomization;
  onChange: (customization: ButtonCustomization) => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;
  apiKeyValue?: string;
  onApiKeyChange?: (apiKey: string) => void;
  customPromptValue?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

// Collapsible panel state - Updated for 4 consolidated panels
const expandedPanels = signal<Record<string, boolean>>({
  design: false,  // Start collapsed for cleaner initial view
  feel: false,
  ship: false,
  magic: false,
});

export default function CustomizationPanel({
  customization,
  onChange,
  voiceEnabled = false,
  onVoiceToggle,
  apiKeyValue = "",
  onApiKeyChange,
  customPromptValue = "",
  onCustomPromptChange,
}: CustomizationPanelProps) {
  // ===================================================================
  // STATE UPDATE HANDLERS - Clean, typed state management
  // ===================================================================

  const updateAppearance = (
    key: keyof ButtonCustomization["appearance"],
    value: number | string,
  ) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        [key]: value,
      },
    });
  };

  // Smart effect toggling - handles conflicts between similar effects
  const updateEffect = (
    key: keyof ButtonCustomization["effects"],
    value: boolean,
  ) => {
    const newEffects = { ...customization.effects };

    if (value && (key === "breathing" || key === "bounce")) {
      // Movement effects - turn off the other when enabling one
      newEffects.breathing = key === "breathing";
      newEffects.bounce = key === "bounce";
    } else if (key === "breathing" || key === "bounce") {
      // Turning off a movement effect
      newEffects[key] = false;
    } else {
      // Visual effects (glow, flat, shine) can be toggled independently
      newEffects[key] = value;
    }

    onChange({
      ...customization,
      effects: newEffects,
    });
  };

  const applyTheme = (theme: ButtonTheme) => {
    onChange({
      ...customization,
      appearance: {
        ...customization.appearance,
        ...theme.appearance,
      },
      interactions: {
        ...customization.interactions,
        ...theme.interactions,
      },
      effects: {
        ...customization.effects,
        ...theme.effects,
      },
    });
  };

  const togglePanel = (panelId: string) => {
    const isExpanding = !expandedPanels.value[panelId];
    expandedPanels.value = {
      ...expandedPanels.value,
      [panelId]: isExpanding,
    };
    // Use correct sound based on expand/collapse action
    if (isExpanding) {
      playSound.panelsExpand?.() || playSound.primaryClick();
    } else {
      playSound.panelsCollapse?.() || playSound.secondaryClick();
    }
    hapticService.lightTap();
  };

  return (
    <div>
      <CollapsiblePanel
        id="design"
        title="Design"
        color="red"
        isExpanded={expandedPanels.value.design}
        onToggle={togglePanel}
      >
        <DesignPanel
          customization={customization}
          updateAppearance={updateAppearance}
        />
      </CollapsiblePanel>

      <div style={{ marginTop: "16px" }}>
        <CollapsiblePanel
          id="feel"
        title="Feel"
        color="orange"
        isExpanded={expandedPanels.value.feel}
        onToggle={togglePanel}
      >
        <FeelPanel
          customization={customization}
          updateEffect={updateEffect}
          applyTheme={applyTheme}
        />
        </CollapsiblePanel>
      </div>

      <div style={{ marginTop: "16px" }}>
        <CollapsiblePanel
          id="ship"
        title="Ship"
        color="yellow"
        isExpanded={expandedPanels.value.ship}
        onToggle={togglePanel}
      >
        <ShipPanel
          customization={customization}
          apiKeyValue={apiKeyValue}
        />
        </CollapsiblePanel>
      </div>

      <div style={{ marginTop: "16px" }}>
        <CollapsiblePanel
          id="magic"
        title="Magic"
        color="purple"
        isExpanded={expandedPanels.value.magic}
        onToggle={togglePanel}
        special={true}
      >
        <MagicPanel
          voiceEnabled={voiceEnabled}
          onVoiceToggle={onVoiceToggle}
          apiKeyValue={apiKeyValue}
          onApiKeyChange={onApiKeyChange}
          customPromptValue={customPromptValue}
          onCustomPromptChange={onCustomPromptChange}
        />
        </CollapsiblePanel>
      </div>
    </div>
  );
}
