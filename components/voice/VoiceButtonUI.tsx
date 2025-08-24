// ===================================================================
// VOICE BUTTON UI COMPONENTS
// Extracted from VoiceButton.tsx for better organization
// ===================================================================

import { ButtonState } from "../../types/core.ts";

// ===================================================================
// BUTTON ICON COMPONENT
// ===================================================================

export function ButtonIcon(
  { state, size, color, hideOnRecord = false }: {
    state: ButtonState;
    size: number;
    color: string;
    hideOnRecord?: boolean;
  },
) {
  // Don't show microphone when recording
  if (hideOnRecord && state === "recording") {
    return null;
  }

  const iconSize = Math.min(size * 0.5, 48);

  // Show microphone icon
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: "absolute",
        zIndex: 10,
        opacity: state === "recording" ? 0 : 1,
        transform: state === "requesting" ? "scale(1.2)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// ===================================================================
// RECORDING CONTENT COMPONENT
// ===================================================================

export function RecordingContent(
  { duration, showDuration, color, buttonConfig }: {
    duration: number;
    showDuration: boolean;
    color: string;
    buttonConfig?: {
      size?: { width: number };
    };
  },
) {
  if (!showDuration) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Determine font size based on button size
  const buttonSize = buttonConfig?.size?.width || 120;
  const fontSize = Math.max(16, Math.min(24, buttonSize * 0.15));

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        zIndex: 20,
      }}
    >
      {/* Recording dot */}
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />

      {/* Duration text */}
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: "600",
          color: color,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        {timeString}
      </span>
    </div>
  );
}

// ===================================================================
// WAVEFORM VISUALIZER COMPONENT
// ===================================================================

export function WaveformVisualizer(
  {
    data,
    size,
    color,
    style = "bars",
    opacity = 0.8,
  }: {
    data: number[];
    size: number;
    color: string;
    style?: "bars" | "circle" | "dots";
    opacity?: number;
  },
) {
  if (!data || data.length === 0) return null;

  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  if (style === "circle") {
    // Circular waveform visualization
    const points = data.map((value, index) => {
      const angle = (index / data.length) * Math.PI * 2;
      const normalizedValue = value / 255;
      const radiusOffset = normalizedValue * (radius * 0.3);
      const r = radius * 0.6 + radiusOffset;

      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      return `${x},${y}`;
    }).join(" ");

    return (
      <svg
        width={size}
        height={size}
        style={{
          position: "absolute",
          opacity,
          pointerEvents: "none",
        }}
      >
        <polygon
          points={points}
          fill={color}
          fillOpacity="0.3"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.6"
        />
      </svg>
    );
  }

  // Default bars visualization
  const barCount = Math.min(data.length, 12);
  const barWidth = size / (barCount * 2);
  const maxHeight = size * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: `${barWidth / 2}px`,
        opacity,
      }}
    >
      {data.slice(0, barCount).map((value, index) => {
        const normalizedValue = value / 255;
        const height = Math.max(4, normalizedValue * maxHeight);

        return (
          <div
            key={index}
            style={{
              width: `${barWidth}px`,
              height: `${height}px`,
              backgroundColor: color,
              borderRadius: `${barWidth / 2}px`,
              transition: "height 0.1s ease-out",
            }}
          />
        );
      })}
    </div>
  );
}
