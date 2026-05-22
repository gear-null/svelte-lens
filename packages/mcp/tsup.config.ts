import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/server.ts"],
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  dts: false,
  sourcemap: false,
  splitting: false,
});
