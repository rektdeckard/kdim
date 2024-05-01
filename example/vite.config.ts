import { defineConfig } from "vitest/config";

export default defineConfig({
  build: { target: "esnext" },
  optimizeDeps: { exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"] },
  base: "https://rektdeckard.github.io/kdim/",
});
