import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true,
        css: "injected",
        dev: true,
      },
      emitCss: false,
    }),
  ],
  resolve: {
    alias: {
      "svelte-lens": resolve(here, "src/index.ts"),
    },
    conditions: ["browser"],
  },
  ssr: {
    noExternal: [/^svelte($|\/)/, "element-source"],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/__tests__/setup.ts"],
    globals: true,
    testTimeout: 10000,
    // Override SSR resolution so Svelte uses client runtime in jsdom
    alias: {
      "svelte/internal/server": "svelte/internal/client",
    },
  },
});
