import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      cssFileName: "style",
    },
    rollupOptions: {
      // Treat all @tauri-apps/* and lucide as peer deps — not bundled
      external: ["lucide", /^@tauri-apps\/.*/],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    dts({
      tscConfigFilePath: "./tsconfig.lib.json",
      include: ["src/lib/**/*.ts"],
      outDir: "dist",
      insertTypesEntry: true,
    }),
  ],
});
