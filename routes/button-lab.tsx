import VoiceButton from "../components/VoiceButton.tsx";
import { defaultCustomization } from "../types/customization.ts";

// Different button personalities with tweaked physics
const buttonVariants = [
  {
    name: "Original",
    className: "",
    style: {},
    description: "Jello physics"
  },
  {
    name: "Snappy",
    className: "snappy-btn",
    style: {},
    description: "Instant response"
  },
  {
    name: "Gummy",
    className: "gummy-btn",
    style: {},
    description: "Slow & sticky"
  },
  {
    name: "Bouncy",
    className: "bouncy-btn",
    style: {},
    description: "Extra springy"
  },
  {
    name: "Heavy",
    className: "heavy-btn",
    style: {},
    description: "Feels weighty"
  },
  {
    name: "Soft",
    className: "soft-btn",
    style: {},
    description: "Gentle press"
  },
  {
    name: "Clicky",
    className: "clicky-btn",
    style: {},
    description: "Mechanical feel"
  },
  {
    name: "Wobbly",
    className: "wobbly-btn",
    style: {},
    description: "Jiggle physics"
  },
  {
    name: "Magnetic",
    className: "magnetic-btn",
    style: {},
    description: "Pulls to press"
  },
];

export default function ButtonLab() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
      <style>{`
        /* Snappy - Ultra fast response, minimal travel */
        .snappy-btn {
          transition: all 0.05s linear !important;
        }
        .snappy-btn:active {
          transform: translate(2px, 2px) scale(0.98) !important;
          box-shadow: 1px 1px 0px rgba(0,0,0,1) !important;
        }
        
        /* Gummy - Slow, sticky feeling */
        .gummy-btn {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
        }
        .gummy-btn:active {
          transform: translate(6px, 6px) scale(0.92) !important;
          box-shadow: 0px 0px 0px rgba(0,0,0,0.5) !important;
          transition: all 0.15s ease-in !important;
        }
        
        /* Bouncy - Extra spring in the animation */
        @keyframes super-bounce {
          0% { transform: scale(1); }
          20% { transform: scale(0.9); }
          40% { transform: scale(1.3); }
          50% { transform: scale(0.85); }
          60% { transform: scale(1.15); }
          70% { transform: scale(0.95); }
          80% { transform: scale(1.08); }
          90% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        .bouncy-btn:active:not(:disabled) {
          animation: super-bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
        }
        
        /* Heavy - Feels like it has mass */
        .heavy-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .heavy-btn:active {
          transform: translate(5px, 5px) scale(0.95) !important;
          box-shadow: 1px 1px 0px rgba(0,0,0,0.7) !important;
          filter: brightness(0.95);
        }
        .heavy-btn:hover:not(:active) {
          transform: translate(0px, -2px) scale(1.01) !important;
          box-shadow: 6px 10px 0px rgba(0,0,0,1) !important;
        }
        
        /* Soft - Gentle, cushioned feel */
        .soft-btn {
          transition: all 0.4s ease-out !important;
          box-shadow: 4px 4px 8px rgba(0,0,0,0.3) !important;
        }
        .soft-btn:active {
          transform: translate(3px, 3px) scale(0.96) !important;
          box-shadow: 1px 1px 4px rgba(0,0,0,0.2) !important;
        }
        .soft-btn::after {
          opacity: 0.6 !important;
        }
        
        /* Clicky - Mechanical switch feeling */
        .clicky-btn {
          transition: all 0.02s linear !important;
        }
        .clicky-btn:active {
          transform: translate(4px, 4px) scale(1) !important;
          box-shadow: 0px 0px 0px rgba(0,0,0,1) !important;
        }
        .clicky-btn:not(:active) {
          transition: all 0.1s ease-out !important;
        }
        
        /* Wobbly - Jiggly jello effect */
        @keyframes wobble {
          0% { transform: scale(1) rotate(0deg); }
          15% { transform: scale(1.1) rotate(-5deg); }
          30% { transform: scale(0.9) rotate(5deg); }
          45% { transform: scale(1.05) rotate(-3deg); }
          60% { transform: scale(0.95) rotate(2deg); }
          75% { transform: scale(1.02) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .wobbly-btn:active:not(:disabled) {
          animation: wobble 0.6s ease-out !important;
        }
        .wobbly-btn:hover:not(:active) {
          animation: wobble 1s ease-out infinite !important;
          animation-iteration-count: 1 !important;
        }
        
        /* Magnetic - Pulls toward click point */
        .magnetic-btn {
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .magnetic-btn:hover:not(:active) {
          transform: scale(1.05) !important;
          box-shadow: 10px 10px 0px rgba(0,0,0,1) !important;
        }
        .magnetic-btn:active {
          transform: translate(6px, 6px) scale(0.9) !important;
          box-shadow: 0px 0px 0px rgba(0,0,0,1) !important;
          transition: all 0.08s ease-in !important;
        }
      `}</style>

      <div class="max-w-5xl mx-auto">
        <h1 class="text-4xl font-black mb-2 text-center">
          🧪 Button Physics Lab
        </h1>
        <p class="text-center text-gray-700 mb-8">
          Test different button "feelings" - find your favorite squish!
        </p>
        
        <div class="grid grid-cols-3 gap-8">
          {buttonVariants.map((variant) => (
            <div class="text-center">
              <VoiceButton
                customization={{
                  ...defaultCustomization,
                  content: { text: variant.name, autoScale: true },
                  appearance: { fill: "#FFB6C1", border: "#000000", shadow: "#000000" },
                  size: { width: 140, height: 140 }
                }}
                customCSS={variant.className}
              />
              <p class="mt-2 text-sm text-gray-600">{variant.description}</p>
            </div>
          ))}
        </div>

        <div class="mt-12 p-6 bg-white/50 rounded-lg border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h2 class="text-2xl font-bold mb-4">🎛️ What's Different?</h2>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Snappy:</strong> 50ms transition, minimal travel (2px)
            </div>
            <div>
              <strong>Gummy:</strong> 300ms sticky ease, deep press (6px)
            </div>
            <div>
              <strong>Bouncy:</strong> Aggressive overshoot animation
            </div>
            <div>
              <strong>Heavy:</strong> Lifts on hover, thuds down
            </div>
            <div>
              <strong>Soft:</strong> Cushioned with blur shadows
            </div>
            <div>
              <strong>Clicky:</strong> 20ms binary state (like keyboard)
            </div>
            <div>
              <strong>Wobbly:</strong> Rotation + scale jiggle
            </div>
            <div>
              <strong>Magnetic:</strong> Grows on hover, snaps to press
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}