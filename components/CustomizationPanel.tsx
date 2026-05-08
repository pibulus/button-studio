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
import ColorsPanel from "./panels/ColorsPanel.tsx";
import SizeShapePanel from "./panels/SizeShapePanel.tsx";

interface CustomizationPanelProps {
  customization: ButtonCustomization;
  onChange: (customization: ButtonCustomization) => void;
  apiKeyValue?: string;
  onApiKeyChange?: (apiKey: string) => void;
  customPromptValue?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

// Collapsible panel state - 6 panels with gradient stripes
const expandedPanels = signal<Record<string, boolean>>({
  colors: false, // Start collapsed for cleaner initial view
  sizeShape: false,
  design: false,
  feel: false,
  ship: false,
  magic: false,
});

export default function CustomizationPanel({
  customization,
  onChange,
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

  const applyTheme = (_theme: ButtonTheme) => {
    void _theme;
  };

  const togglePanel = (panelId: string) => {
    const isExpanding = !expandedPanels.value[panelId];
    expandedPanels.value = {
      ...expandedPanels.value,
      [panelId]: isExpanding,
    };
    // Use correct sound based on expand/collapse action
    if (isExpanding) {
      playSound.panelExpand?.() || playSound.primaryClick();
    } else {
      playSound.panelCollapse?.() || playSound.secondaryClick();
    }
    hapticService.buttonPress();
  };

  return (
    <div class="flex flex-col gap-5">
      {/* Colors Panel - Gradient 1: Violet → Pink */}
      <CollapsiblePanel
        id="colors"
        title="Colors"
        color="violet"
        isExpanded={expandedPanels.value.colors}
        onToggle={togglePanel}
        index={0}
      >
        <ColorsPanel
          customization={customization}
          onChange={onChange}
        />
      </CollapsiblePanel>

      {/* Size & Shape Panel - Gradient 2: Pink → Coral */}
      <CollapsiblePanel
        id="sizeShape"
        title="Size & Shape"
        color="pink"
        isExpanded={expandedPanels.value.sizeShape}
        onToggle={togglePanel}
        index={1}
      >
        <SizeShapePanel
          customization={customization}
          updateAppearance={updateAppearance}
        />
      </CollapsiblePanel>

      {/* Design Panel - Gradient 3: Coral → Orange */}
      <CollapsiblePanel
        id="design"
        title="Design"
        color="red"
        isExpanded={expandedPanels.value.design}
        onToggle={togglePanel}
        index={2}
      >
        <DesignPanel
          customization={customization}
          updateAppearance={updateAppearance}
        />
      </CollapsiblePanel>

      {/* Feel Panel - Gradient 4: Orange → Yellow */}
      <CollapsiblePanel
        id="feel"
        title="Feel"
        color="orange"
        isExpanded={expandedPanels.value.feel}
        onToggle={togglePanel}
        index={3}
      >
        <FeelPanel
          customization={customization}
          updateEffect={updateEffect}
          applyTheme={applyTheme}
        />
      </CollapsiblePanel>

      {/* Ship Panel - Gradient 5: Yellow → Lime */}
      <CollapsiblePanel
        id="ship"
        title="Ship"
        color="yellow"
        isExpanded={expandedPanels.value.ship}
        onToggle={togglePanel}
        index={4}
      >
        <ShipPanel
          customization={customization}
          apiKeyValue={apiKeyValue}
          customPromptValue={customPromptValue}
        />
      </CollapsiblePanel>

      {/* Magic Panel - Gradient 6: Lime → Aqua */}
      <CollapsiblePanel
        id="magic"
        title="Magic"
        color="purple"
        isExpanded={expandedPanels.value.magic}
        onToggle={togglePanel}
        special
        index={5}
      >
        <MagicPanel
          apiKeyValue={apiKeyValue}
          onApiKeyChange={onApiKeyChange}
          customPromptValue={customPromptValue}
          onCustomPromptChange={onCustomPromptChange}
        />
      </CollapsiblePanel>
    </div>
  );
}
