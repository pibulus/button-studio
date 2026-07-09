import { Head } from "$fresh/runtime.ts";
import { asset } from "$fresh/runtime.ts";

export default function PremiumSuccess() {
  return (
    <>
      <Head>
        <title>Thanks for chipping in — ButtonSpa</title>
        <meta name="robots" content="noindex" />
        <script defer src={asset("/js/premium-poll.js")} />
      </Head>
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-amber-100">
        <div class="text-center p-8 max-w-md">
          <div class="text-6xl mb-6">✨</div>
          <h1 class="text-3xl font-black text-gray-900 mb-4">
            Sorting you out...
          </h1>
          <p class="text-lg text-gray-600 mb-8">
            One sec while we confirm — thanks for chipping in. 🎸
          </p>
          <div class="animate-spin text-4xl">🎰</div>
        </div>
      </div>
    </>
  );
}
