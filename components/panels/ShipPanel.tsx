import { signal } from "@preact/signals";
import { ButtonCustomization } from "../../types/customization.ts";
import { ButtonExporter } from "../../utils/export/ButtonExporter.ts";
import { toast } from "../Toast.tsx";
import { playSound } from "../../utils/audio/soundMapping.ts";
import { hapticService } from "../../utils/audio/hapticService.ts";
import PWAShareModal from "../PWAShareModal.tsx";

interface ShipPanelProps {
  customization: ButtonCustomization;
  apiKeyValue?: string;
}

// State for PWA share modal
const showPWAModal = signal(false);

export default function ShipPanel(
  { customization, apiKeyValue = "" }: ShipPanelProps,
) {
  const handleExport = async (type: "html" | "pwa" | "share") => {
    const exporter = new ButtonExporter();

    try {
      playSound.primaryClick();
      hapticService.buttonPress();

      if (type === "html") {
        const result = await exporter.generateHTML(customization, {
          includeAI: !!apiKeyValue,
          apiKey: apiKeyValue,
        });
        const blob = new Blob([result.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast("HTML exported! 🎉", "success");
      } else if (type === "pwa") {
        const result = await exporter.generatePWA(customization, {
          includeAI: !!apiKeyValue,
          apiKey: apiKeyValue,
        });
        const zip = await import("https://deno.land/x/zip@v1.2.5/mod.ts");
        const archive = new zip.ZipWriter(new zip.BlobWriter());

        await archive.add("index.html", new zip.TextReader(result.html));
        await archive.add("manifest.json", new zip.TextReader(result.manifest));
        await archive.add("sw.js", new zip.TextReader(result.serviceWorker));
        await archive.add("icon-192.png", new zip.TextReader(result.icon192));
        await archive.add("icon-512.png", new zip.TextReader(result.icon512));

        const blob = await archive.close();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast("PWA exported! 📱", "success");
      } else if (type === "share") {
        const shareUrl = exporter.generateShareLink(customization);
        await navigator.clipboard.writeText(shareUrl);
        toast("Share link copied! 🔗", "success");
      }

      playSound.success();
      hapticService.buttonSuccess();
    } catch (error) {
      toast(`Export failed: ${error.message}`, "error");
      playSound.error();
      hapticService.generalError();
    }
  };

  return (
    <div class="space-y-2">
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-2">Ship Your Button</h4>
        <p class="text-sm text-gray-600 mb-3">
          Turn this design into a link, a phone app, or a standalone file.
        </p>

        {/* Export Buttons */}
        <div class="space-y-2">
          {/* Save to Phone Button */}
          <button
            onClick={() => {
              playSound.primaryClick();
              showPWAModal.value = true;
            }}
            onMouseEnter={() => playSound.hover()}
            type="button"
            class="w-full h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-md active:scale-95 bg-yellow-200 hover:bg-yellow-300 text-black"
            style={{
              borderColor: "rgba(0,0,0,0.85)",
              boxShadow: "4px 4px 0px rgba(0,0,0,0.85)",
            }}
          >
            📱 Save as Tiny App
          </button>

          <button
            onClick={() => handleExport("share")}
            onMouseEnter={() => playSound.hover()}
            type="button"
            class="w-full h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-md active:scale-95 bg-yellow-200 hover:bg-yellow-300 text-black"
            style={{
              borderColor: "rgba(0,0,0,0.85)",
              boxShadow: "4px 4px 0px rgba(0,0,0,0.85)",
            }}
          >
            🔗 Copy Design Link
          </button>

          <button
            onClick={() => handleExport("html")}
            onMouseEnter={() => playSound.hover()}
            type="button"
            class="w-full h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-md active:scale-95 bg-yellow-200 hover:bg-yellow-300 text-black"
            style={{
              borderColor: "rgba(0,0,0,0.85)",
              boxShadow: "4px 4px 0px rgba(0,0,0,0.85)",
            }}
          >
            📄 Download HTML
          </button>

          {
            /* COMMENTED OUT: PWA ZIP Export - not useful for most users
          <button
            onClick={() => handleExport("pwa")}
            onMouseEnter={() => playSound.hover()}
            type="button"
            class="w-full h-12 px-6 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-md active:scale-95 bg-yellow-200 hover:bg-yellow-300 text-black"
            style={{
              borderColor: "rgba(0,0,0,0.85)",
              boxShadow: "4px 4px 0px rgba(0,0,0,0.85)",
            }}
          >
            📦 Export PWA (ZIP)
          </button>
          */
          }
        </div>
      </div>

      {/* Export Info - More compact and friendly */}
      <div class="mt-2 p-2 bg-yellow-50 rounded-xl border-2 border-yellow-300">
        <h5 class="font-bold text-xs mb-1">Best exits</h5>
        <ul class="text-xs sm:text-sm space-y-1 text-gray-700">
          <li>
            • <strong>Tiny app</strong> - home screen button with its own icon
          </li>
          <li>
            • <strong>Design link</strong> - send the editable button
          </li>
          <li>
            • <strong>HTML</strong> - drop it into a site
          </li>
          {apiKeyValue && (
            <li class="text-green-700 font-bold">
              ✓ Voice transcription included in exports
            </li>
          )}
        </ul>
      </div>

      {/* PWA Share Modal */}
      <PWAShareModal
        isOpen={showPWAModal.value}
        onClose={() => showPWAModal.value = false}
        customization={customization}
        apiKey={apiKeyValue}
      />
    </div>
  );
}
