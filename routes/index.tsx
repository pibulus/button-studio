import { Head } from "$fresh/runtime.ts";
import VoiceButtonStudio from "../islands/VoiceButtonStudio.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Voice Button Studio</title>
        <meta name="description" content="Design your perfect voice button" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Soft Stack Background 🧁 */}
      <div class="min-h-screen bg-soft-cream font-sans">
        
        {/* Hero Section */}
        <section class="relative overflow-hidden">
          {/* Ambient background gradient */}
          <div class="absolute inset-0 bg-gradient-to-br from-soft-peach/10 via-soft-lavender/5 to-soft-mint/10"></div>
          
          <div class="relative max-w-6xl mx-auto px-6 py-16">
            <div class="text-center mb-16">
              {/* App Icon */}
              <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-soft-peach to-soft-coral rounded-3xl shadow-soft-card mb-6">
                <span class="text-3xl">🎤</span>
              </div>
              
              {/* Chonky Headline */}
              <h1 class="text-6xl font-black text-soft-charcoal tracking-tight mb-4">
                Voice Button
                <br />
                <span class="bg-gradient-to-r from-soft-peach to-soft-coral bg-clip-text text-transparent">
                  Studio
                </span>
              </h1>
              
              {/* Friendly Subtext */}
              <p class="text-xl text-soft-slate font-medium max-w-lg mx-auto leading-relaxed">
                Craft the perfect little click companion with soul ✨
              </p>
            </div>
          </div>
        </section>

        {/* Main Studio Section */}
        <section class="relative">
          <div class="max-w-5xl mx-auto px-6 pb-20">
            <VoiceButtonStudio />
          </div>
        </section>

        {/* Footer with Soft Stack Love */}
        <footer class="border-t border-soft-mist/50 bg-soft-paper/50">
          <div class="max-w-4xl mx-auto px-6 py-12 text-center">
            <p class="text-soft-quiet font-medium">
              Made with weird science and warm vibes by 
              <span class="text-soft-glow font-bold"> Pablo</span>
            </p>
            <p class="text-sm text-soft-quiet mt-2">
              Brought to you by the Soft Stack 🧁
            </p>
          </div>
        </footer>
        
      </div>
    </>
  );
}
