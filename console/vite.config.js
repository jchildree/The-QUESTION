import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron.cjs",
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
      {
        entry: "preload.cjs",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
    ]),
  ],
  build: {
    outDir: "dist",
  },
});
