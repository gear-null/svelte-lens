import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const banner = `/**
 * @license MIT
 *
 * svelte-lens - select context for coding agents from your Svelte UI
 */`;

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true,
        css: "injected",
        dev: false,
      },
      emitCss: false,
    }),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      include: ["src/**/*.ts"],
      exclude: ["**/*.svelte", "**/*.test.ts"],
      rollupTypes: false,
      copyDtsFiles: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(here, "src/index.ts"),
        "core/index": resolve(here, "src/core/index.svelte.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [/^svelte($|\/)/, "element-source"],
      output: {
        banner,
        preserveModules: false,
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
    minify: isProd,
    sourcemap: !isProd,
    target: "es2022",
    emptyOutDir: true,
  },
});
