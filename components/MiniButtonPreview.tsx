import { ButtonCustomization } from "../types/customization.ts";

interface MiniButtonPreviewProps {
  customization: ButtonCustomization;
}

// ===================================================================
// MINI BUTTON PREVIEW - visual-only, non-interactive shrunk button
// ===================================================================
// Used by the sticky mobile preview bar so the "live preview" promise
// holds even after the user scrolls past the main "Your Button" stage.
// Deliberately does NOT touch VoiceButton or its recording logic - this
// is a lightweight mirror of just the visual appearance (fill, shape,
// border, roundness) driven by the same customization signal.

export default function MiniButtonPreview(
  { customization }: MiniButtonPreviewProps,
) {
  const { appearance, content } = customization;

  const background = appearance.fillType === "solid"
    ? appearance.solidColor
    : `linear-gradient(${appearance.gradient.direction}deg, ${appearance.gradient.start}, ${appearance.gradient.end})`;

  const borderRadius = appearance.shape === "circle"
    ? "50%"
    : `${Math.min(appearance.roundness, 20)}px`;

  const size = appearance.shape === "circle" ? "44px" : "56px";

  return (
    <div
      class="shrink-0 flex items-center justify-center font-bold select-none"
      style={{
        width: size,
        height: appearance.shape === "circle" ? size : "40px",
        background,
        borderRadius,
        borderStyle: appearance.borderStyle,
        borderWidth: `${Math.max(2, Math.min(appearance.borderWidth, 4))}px`,
        borderColor: "#000000",
        boxShadow: "3px 3px 0px #000000",
        fontSize: "10px",
        lineHeight: 1,
        overflow: "hidden",
        color: "#000000",
      }}
    >
      {content.value
        ? (
          <span class="px-1 truncate max-w-full">
            {content.value}
          </span>
        )
        : "🎤"}
    </div>
  );
}
