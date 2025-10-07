import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";

/**
 * 🎸 About Modal Component
 *
 * Showcase modal explaining ASCIIFIER's purpose and Pablo's rapid dev approach.
 *
 * FEATURES:
 * - Project narrative & tech stack showcase
 * - Links to portfolio, GitHub, LinkedIn
 * - Escape key to close
 * - Mobile responsive
 * - Fully themed to match app aesthetic
 *
 * Built by Pablo for SoftStack apps 🎸
 */

// Global signal for modal state
export const aboutModalOpen = signal(false);

// Helper to open modal from anywhere
export function openAboutModal() {
  aboutModalOpen.value = true;
}

// Helper to close modal
export function closeAboutModal() {
  aboutModalOpen.value = false;
}

export function AboutModal() {
  const isOpen = aboutModalOpen.value;

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAboutModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);"
        onClick={closeAboutModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Modal */}
        <div
          class="relative w-full max-w-3xl animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            class="p-6 border-4 border-b-0 rounded-t-3xl"
            style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex items-start justify-between mb-2">
              <h2
                id="about-modal-title"
                class="text-3xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                About ButtonStudio
              </h2>
              <button
                onClick={closeAboutModal}
                class="text-3xl leading-none font-bold transition-transform hover:scale-110"
                style="color: var(--color-text, #0A0A0A)"
                aria-label="Close about dialog"
              >
                ×
              </button>
            </div>
            <p
              class="text-lg font-mono font-bold"
              style="color: var(--color-accent, #FF69B4)"
            >
              The Figma for voice buttons 🎤
            </p>
          </div>

          {/* Content */}
          <div
            class="p-8 border-4 rounded-b-3xl shadow-brutal-xl space-y-6"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
          >
            {/* Story */}
            <p
              class="text-base sm:text-lg leading-relaxed"
              style="color: var(--color-text, #0A0A0A)"
            >
              I'm Pablo. I build tools with personality and soul. ButtonStudio lets you design beautiful voice recording buttons with real-time AI transcription.
            </p>

            {/* What it's for */}
            <div
              class="py-4 px-4 border-2 rounded-xl space-y-2"
              style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A)"
            >
              <p
                class="text-sm sm:text-base font-medium"
                style="color: var(--color-text, #0A0A0A)"
              >
                Design custom voice buttons. Export as HTML, PWA, or embeddable code. Add voice interfaces to any website. Powered by Google Gemini AI.
              </p>
              <p
                class="text-sm sm:text-base font-medium"
                style="color: var(--color-text, #0A0A0A)"
              >
                It's visual, it's powerful, and it actually works. Free.
              </p>
            </div>

            {/* Links */}
            <div class="pt-2">
              <p
                class="text-sm font-medium mb-3 text-center"
                style="color: var(--color-text, #0A0A0A)"
              >
                Check out more of my work:
              </p>
              <div class="flex flex-wrap gap-3 justify-center">
                <a
                  href="https://pibul.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 border-3 rounded-lg font-mono font-bold transition-all hover:scale-105 shadow-brutal-sm"
                  style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
                >
                  🌐 Portfolio
                </a>
                <a
                  href="https://github.com/pibulus"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 border-3 rounded-lg font-mono font-bold transition-all hover:scale-105 shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
                >
                  💻 GitHub
                </a>
              </div>
            </div>

            {/* Footer */}
            <div
              class="pt-4 text-center border-t-2"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              <p
                class="text-xs opacity-60"
                style="color: var(--color-text, #0A0A0A)"
              >
                Made in Melbourne with care 🎸
              </p>
            </div>
          </div>

          {/* Footer hint */}
          <div class="text-center mt-4">
            <p
              class="text-xs font-mono opacity-60"
              style="color: var(--color-text, #0A0A0A)"
            >
              Press ESC or click outside to close
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes modal-in {
            0% {
              opacity: 0;
              transform: scale(0.95) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-modal-in {
            animation: modal-in 0.3s ease-out forwards;
          }

          .shadow-brutal-xl {
            box-shadow: 12px 12px 0px var(--color-border, #0A0A0A);
          }

          .shadow-brutal-sm {
            box-shadow: 4px 4px 0px var(--color-border, #0A0A0A);
          }
        `}
      </style>
    </>
  );
}

/**
 * 🔘 About Link Component
 *
 * Simple link that opens the About modal.
 */

interface AboutLinkProps {
  label?: string;
  className?: string;
}

export function AboutLink({
  label = "Made by Pablo 🎸",
  className = "",
}: AboutLinkProps) {
  return (
    <button
      onClick={openAboutModal}
      class={`px-3 py-2 text-sm border-3 rounded-xl font-mono font-bold shadow-brutal transition-all hover:scale-105 active:scale-95 ${className}`}
      style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
    >
      {label}
    </button>
  );
}
