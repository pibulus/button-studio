import { playSound } from "../utils/audio/soundMapping.ts";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ["Cmd/Ctrl", "S"], action: "Shuffle (Surprise Me!)" },
    { keys: ["Cmd/Ctrl", "D"], action: "Toggle Design Panel" },
    { keys: ["Cmd/Ctrl", "F"], action: "Toggle Feel Panel" },
    { keys: ["Cmd/Ctrl", "E"], action: "Toggle Export (Ship) Panel" },
    { keys: ["Cmd/Ctrl", "M"], action: "Toggle Magic Panel" },
    { keys: ["1-9"], action: "Quick Theme Switch" },
    { keys: ["Space"], action: "Test Button" },
    { keys: ["?"], action: "Show This Help" },
  ];

  return (
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 border-4 border-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-black">
              ⌨️ Keyboard Shortcuts
            </h2>
            <button
              onClick={() => {
                playSound.secondaryClick();
                onClose();
              }}
              onMouseEnter={() => playSound.hover()}
              class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3">
            {shortcuts.map(({ keys, action }) => (
              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  {keys.map((key) => (
                    <kbd
                      class="px-3 py-1 text-sm font-bold bg-gray-100 border-2 border-gray-300 rounded-lg"
                      style={{
                        boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
                        fontFamily: "monospace",
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
                <span class="text-sm font-medium text-gray-700">{action}</span>
              </div>
            ))}
          </div>

          <div class="mt-6 p-3 bg-yellow-50 rounded-xl border-2 border-yellow-300">
            <p class="text-xs text-gray-600 text-center">
              💡 Pro tip: Number keys instantly switch themes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
