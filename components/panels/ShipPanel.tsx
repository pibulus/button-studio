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
      hapticService.success();
    } catch (error) {
      toast(`Export failed: ${error.message}`, "error");
      playSound.error();
      hapticService.error();
    }
  };

  return (
    <div class="space-y-4">
      <div>
        <h4 class="text-lg font-black text-gray-900 mb-4">Export Options</h4>

        {/* Export Buttons */}
        <div class="space-y-3">
          <button
            onClick={() => handleExport("html")}
            type="button"
            class="w-full px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-black hover:bg-yellow-50"
          >
            📄 Export as HTML
          </button>

          <button
            onClick={() => handleExport("pwa")}
            type="button"
            class="w-full px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-black hover:bg-yellow-50"
          >
            📦 Export PWA (ZIP)
          </button>

          {/* NEW: Save to Phone Button */}
          <button
            onClick={() => {
              playSound.primaryClick();
              showPWAModal.value = true;
            }}
            type="button"
            class="w-full px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            📱 Save to Phone
          </button>

          <button
            onClick={() => handleExport("share")}
            type="button"
            class="w-full px-6 py-4 rounded-2xl border-3 border-black font-black transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-black hover:bg-yellow-50"
          >
            🔗 Copy Share Link
          </button>
        </div>
      </div>

      {/* Export Info */}
      <div class="mt-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-300">
        <h5 class="font-bold text-sm mb-2">Export Features:</h5>
        <ul class="text-sm space-y-1">
          <li>• HTML: Self-contained single file</li>
          <li>• PWA: Installable web app with icons</li>
          <li>• Share: URL with encoded design</li>
          {apiKeyValue && (
            <li class="text-green-700">✓ AI transcription included</li>
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
