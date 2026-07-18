import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import { builtinModules } from "module";

const EXTERNALS = [
  "electron",
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron.cjs",
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              external: EXTERNALS,
              output: { format: "cjs" },
            },
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
            rollupOptions: {
              external: EXTERNALS,
              output: { format: "cjs" },
            },
          },
        },
      },
    ]),
  ],
  build: {
    outDir: "dist",
  },
});
