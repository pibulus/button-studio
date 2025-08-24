// ===================================================================
// INSTALL GUIDE - Smart PWA installation helper
// ===================================================================

import { useEffect, useState } from "preact/hooks";

interface InstallGuideProps {
  appName: string;
  appUrl: string;
  iconUrl?: string;
}

export default function InstallGuide({ appName, appUrl, iconUrl }: InstallGuideProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    
    // Check if already installed as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    // Auto-show instructions on mobile
    if ((isIOS || isAndroid) && !standalone) {
      setShowInstructions(true);
    }
  }, []);
  
  // If already installed, show success
  if (isStandalone) {
    return (
      <div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div class="text-center">
          <div class="text-6xl mb-4">✅</div>
          <h1 class="text-3xl font-black mb-2">App Installed!</h1>
          <p class="text-gray-600">You can now use {appName} like a native app</p>
        </div>
      </div>
    );
  }
  
  const instructions = {
    ios: {
      title: "Install on iPhone",
      steps: [
        { icon: "1️⃣", text: "Tap the Share button below (box with arrow)" },
        { icon: "2️⃣", text: "Scroll down and tap 'Add to Home Screen'" },
        { icon: "3️⃣", text: "Tap 'Add' in the top right corner" }
      ],
      note: "Must use Safari browser!"
    },
    android: {
      title: "Install on Android",
      steps: [
        { icon: "1️⃣", text: "Tap the menu (3 dots) in your browser" },
        { icon: "2️⃣", text: "Tap 'Install app' or 'Add to Home screen'" },
        { icon: "3️⃣", text: "Tap 'Install' to confirm" }
      ],
      note: "Works in Chrome, Edge, or Samsung Internet"
    },
    desktop: {
      title: "Install on Desktop",
      steps: [
        { icon: "1️⃣", text: "Look for install icon in address bar" },
        { icon: "2️⃣", text: "Or check browser menu for 'Install'" },
        { icon: "3️⃣", text: "Click 'Install' to add to your computer" }
      ],
      note: "Works in Chrome, Edge, or Brave"
    }
  };
  
  const currentInstructions = instructions[platform];
  
  return (
    <>
      {/* Floating Install Prompt (mobile only) */}
      {platform !== "desktop" && !showInstructions && (
        <button
          onClick={() => setShowInstructions(true)}
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black text-white rounded-full shadow-2xl font-bold flex items-center gap-2 animate-bounce"
        >
          <span class="text-xl">📲</span>
          Install App
        </button>
      )}
      
      {/* Full Instructions Modal */}
      {showInstructions && (
        <div class="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <button
              onClick={() => setShowInstructions(false)}
              class="absolute top-6 right-6 text-2xl"
            >
              ✕
            </button>
            <div class="text-center">
              {iconUrl && (
                <img 
                  src={iconUrl} 
                  alt={appName}
                  class="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg"
                />
              )}
              <h2 class="text-2xl font-black">{currentInstructions.title}</h2>
              <p class="opacity-90 mt-2">Turn {appName} into a real app!</p>
            </div>
          </div>
          
          {/* Steps */}
          <div class="flex-1 p-6 overflow-auto">
            <div class="max-w-md mx-auto space-y-4">
              {currentInstructions.steps.map((step) => (
                <div class="flex gap-4 items-start">
                  <span class="text-2xl flex-shrink-0">{step.icon}</span>
                  <p class="text-lg pt-1">{step.text}</p>
                </div>
              ))}
              
              {/* Platform Note */}
              <div class="mt-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p class="font-bold text-yellow-800">⚠️ {currentInstructions.note}</p>
              </div>
              
              {/* Visual Guide */}
              {platform === "ios" && (
                <div class="mt-6 text-center">
                  <p class="text-gray-600 mb-4">Look for this button:</p>
                  <div class="inline-block p-4 bg-gray-100 rounded-xl">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                      <path d="M15 3v15M15 18l-7-7M15 18l7-7" stroke="#007AFF" stroke-width="2" stroke-linecap="round"/>
                      <rect x="8" y="12" width="14" height="16" rx="1" stroke="#007AFF" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div class="p-6 bg-gray-50 border-t">
            <button
              onClick={() => setShowInstructions(false)}
              class="w-full py-4 bg-black text-white rounded-2xl font-black text-lg"
            >
              Got it! Let me try
            </button>
          </div>
        </div>
      )}
    </>
  );
}