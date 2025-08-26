/**
 * Test Neon Color System
 * Test pastel vs neon intensity toggle
 */

import { ButtonExporter } from "./utils/export/ButtonExporter.ts";
import { defaultCustomization } from "./types/customization.ts";

console.log("🌈 Testing Neon Color System...\n");

const baseConfig = {
  ...defaultCustomization,
  appearance: {
    ...defaultCustomization.appearance,
    fillType: "gradient" as const,
    gradient: {
      start: "#ff1493", // Hot pink
      end: "#00ffff", // Cyan
      direction: 135,
    },
  },
};

// Test 1: Pastel mode
console.log("🌸 Test 1: Pastel Mode");
const pastelConfig = {
  ...baseConfig,
  appearance: {
    ...baseConfig.appearance,
    colorIntensity: "pastel" as const,
  },
};

const exporter = new ButtonExporter(pastelConfig);
const pastelResult = exporter.generateHTML({
  includeAI: false,
});

if (pastelResult.success) {
  const htmlContent = pastelResult.data as string;

  const checks = {
    noPulse: !htmlContent.includes("pulse"),
    noGlow: !htmlContent.includes("box-shadow: 0 0 20px"),
    normalSaturation: !htmlContent.includes("saturate(1.2)"),
  };

  console.log("   Pastel Features:");
  console.log(`   🎨 Soft appearance: ${checks.noPulse ? "✅" : "❌"}`);
  console.log(`   💫 No neon glow: ${checks.noGlow ? "✅" : "❌"}`);
  console.log(
    `   🌟 Normal saturation: ${checks.normalSaturation ? "✅" : "❌"}`,
  );
}

// Test 2: Neon mode
console.log("\n⚡ Test 2: Neon Mode");
const neonConfig = {
  ...baseConfig,
  appearance: {
    ...baseConfig.appearance,
    colorIntensity: "neon" as const,
  },
};

const neonExporter = new ButtonExporter(neonConfig);
const neonResult = neonExporter.generateHTML({
  includeAI: false,
});

if (neonResult.success) {
  const htmlContent = neonResult.data as string;

  const checks = {
    hasGlow: htmlContent.includes("box-shadow") &&
      htmlContent.includes("0 0 20px"),
    hasSaturation: htmlContent.includes("saturate(1.2)"),
    hasBrightness: htmlContent.includes("brightness(1.1)"),
  };

  console.log("   Neon Features:");
  console.log(`   ⚡ Electric glow: ${checks.hasGlow ? "✅" : "❌"}`);
  console.log(
    `   🔥 Boosted saturation: ${checks.hasSaturation ? "✅" : "❌"}`,
  );
  console.log(
    `   💎 Enhanced brightness: ${checks.hasBrightness ? "✅" : "❌"}`,
  );
}

console.log("\n🎨 COLOR PALETTE TEST:");
console.log("   🌸 Pastel: Soft, gentle, easy on eyes");
console.log("   ⚡ Neon: Electric, vibrant, cyberpunk vibes");

console.log("\n🎯 RESULT: Simple toggle, dramatic difference!");
console.log("💫 Users can go from kawaii to ELECTRIC with one click! ✨");
