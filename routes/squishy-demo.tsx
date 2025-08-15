import { SquishyButton, UltraSquishyButton } from "../components/SquishyButton.tsx";

export default function SquishyDemo() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
      <h1 class="text-4xl font-black mb-8 text-center">
        🎯 Neo-Brutalist Squishy Buttons
      </h1>
      
      <div class="max-w-4xl mx-auto space-y-12">
        
        {/* Standard Squishy Buttons */}
        <section>
          <h2 class="text-2xl font-bold mb-4">Standard Squishy (Press & Depress)</h2>
          <div class="flex flex-wrap gap-4">
            <SquishyButton color="pink" onClick={() => console.log("Pink!")}>
              Press Me
            </SquishyButton>
            <SquishyButton color="yellow" onClick={() => console.log("Yellow!")}>
              Click Me
            </SquishyButton>
            <SquishyButton color="cyan" onClick={() => console.log("Cyan!")}>
              Touch Me
            </SquishyButton>
            <SquishyButton color="lime" size="lg" onClick={() => console.log("Big!")}>
              Big Button
            </SquishyButton>
            <SquishyButton color="orange" size="sm" onClick={() => console.log("Small!")}>
              Tiny
            </SquishyButton>
          </div>
        </section>

        {/* Ultra Squishy with Bounce */}
        <section>
          <h2 class="text-2xl font-bold mb-4">Ultra Squishy (Elastic Bounce)</h2>
          <div class="flex flex-wrap gap-4">
            <UltraSquishyButton color="pink" onClick={() => console.log("Bouncy pink!")}>
              Bouncy
            </UltraSquishyButton>
            <UltraSquishyButton color="yellow" onClick={() => console.log("Bouncy yellow!")}>
              Elastic
            </UltraSquishyButton>
            <UltraSquishyButton color="cyan" size="lg" onClick={() => console.log("Big bounce!")}>
              Big Bounce
            </UltraSquishyButton>
          </div>
        </section>

        {/* Disabled State */}
        <section>
          <h2 class="text-2xl font-bold mb-4">Disabled State</h2>
          <div class="flex flex-wrap gap-4">
            <SquishyButton color="pink" disabled>
              Disabled
            </SquishyButton>
            <UltraSquishyButton color="cyan" disabled>
              No Touch
            </UltraSquishyButton>
          </div>
        </section>

        {/* What Makes Them Squishy */}
        <section class="bg-white/50 rounded-lg p-6 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <h2 class="text-2xl font-bold mb-4">🧪 What Makes Them Feel Tactile?</h2>
          <ul class="space-y-2 text-lg">
            <li class="flex items-start">
              <span class="mr-2">1️⃣</span>
              <span><strong>Depression on press:</strong> Button moves down (translate) and shadow disappears</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">2️⃣</span>
              <span><strong>Hard black shadows:</strong> Creates 3D depth illusion (4-6px offset)</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">3️⃣</span>
              <span><strong>Instant feedback:</strong> onMouseDown/onTouchStart (not onClick)</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">4️⃣</span>
              <span><strong>Subtle glow on hover:</strong> drop-shadow with color-matched glow</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">5️⃣</span>
              <span><strong>Elastic bounce:</strong> Overshoot animation after click (scale keyframes)</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">6️⃣</span>
              <span><strong>Inset shadows:</strong> Ultra-squishy uses inset shadows for depth</span>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
}