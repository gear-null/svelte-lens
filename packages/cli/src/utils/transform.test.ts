import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { previewTransform, applyTransform } from "./transform.js";

let tempDir: string;

beforeEach(() => {
  tempDir = join(tmpdir(), `svlens-test-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("CLI transform — SvelteKit", () => {
  it("creates new layout when none exists", () => {
    mkdirSync(join(tempDir, "src", "routes"), { recursive: true });
    const result = previewTransform(tempDir, "sveltekit");
    expect(result.success).toBe(true);
    expect(result.newContent).toContain("svelte-lens");
    expect(result.newContent).toContain("<script>");
  });

  it("prepends script block when layout has no existing script", () => {
    mkdirSync(join(tempDir, "src", "routes"), { recursive: true });
    writeFileSync(join(tempDir, "src/routes/+layout.svelte"), "<slot />");
    const result = previewTransform(tempDir, "sveltekit");
    expect(result.success).toBe(true);
    expect(result.newContent).toContain("svelte-lens");
    // Should have exactly one <script> block
    expect(result.newContent!.split("<script").length).toBe(2);
  });

  it("merges into existing <script> block instead of creating duplicate", () => {
    mkdirSync(join(tempDir, "src", "routes"), { recursive: true });
    writeFileSync(
      join(tempDir, "src/routes/+layout.svelte"),
      `<script>
  import { someThing } from "somewhere";
</script>

<slot />`,
    );
    const result = previewTransform(tempDir, "sveltekit");
    expect(result.success).toBe(true);
    expect(result.newContent).toContain("svelte-lens");
    // Must NOT create a second <script> block
    expect(result.newContent!.split("<script").length).toBe(2);
  });

  it("detects existing svelte-lens import as already installed", () => {
    mkdirSync(join(tempDir, "src", "routes"), { recursive: true });
    writeFileSync(
      join(tempDir, "src/routes/+layout.svelte"),
      `<script>
  import { dev } from "$app/environment";
  onMount(() => { if (dev) import("svelte-lens"); });
</script>

<slot />`,
    );
    const result = previewTransform(tempDir, "sveltekit");
    expect(result.success).toBe(true);
    expect(result.noChanges).toBe(true);
  });
});

describe("CLI transform — unsupported framework", () => {
  it("returns failure for unknown framework", () => {
    const result = previewTransform(tempDir, "unknown");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Unsupported");
  });
});
