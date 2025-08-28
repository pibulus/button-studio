import { Handlers, PageProps } from "$fresh/server.ts";
import GradientSoundDemo from "../islands/GradientSoundDemo.tsx";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function SoundDemoPage(_props: PageProps) {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            🎵 SoftStack Sound System
          </h1>
          <p class="text-xl text-gray-600 mt-4">
            Modular sound packs for beautiful webapps
          </p>
        </div>

        <GradientSoundDemo />
      </div>
    </div>
  );
}
