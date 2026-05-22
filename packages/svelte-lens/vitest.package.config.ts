import { defineConfig } from "vitest/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["src/__tests__/package-e2e.test.ts"],
    testTimeout: 15000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@gear-null/svelte-lens": resolve(here, "dist/index.js"),
    },
  },
});
