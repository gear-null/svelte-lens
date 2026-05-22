import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HOST_ATTRIBUTE } from "../constants.js";

describe("index.ts public API", () => {
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    vi.resetModules();
    const existing = document.querySelectorAll(`[${HOST_ATTRIBUTE}]`);
    for (const el of existing) el.remove();
    if (typeof window !== "undefined" && window.__SVELTE_LENS__) {
      delete window.__SVELTE_LENS__;
    }
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    vi.restoreAllMocks();
  });

  it("registerPlugin adds a plugin to the initialized API", async () => {
    const { registerPlugin, getGlobalApi } = await import("../index.js");

    // After import, auto-init has already run, so registerPlugin goes directly to the API
    registerPlugin({
      name: "direct-plugin",
      theme: { hue: 90 },
    });

    const api = getGlobalApi();
    expect(api).not.toBeNull();
    expect(api!.getPlugins()).toContain("direct-plugin");

    if (api) cleanup = api.dispose;
  });

  it("unregisterPlugin removes a plugin from the initialized API", async () => {
    const { registerPlugin, unregisterPlugin, getGlobalApi } = await import("../index.js");

    registerPlugin({ name: "removable-plugin" });
    const api = getGlobalApi();
    expect(api!.getPlugins()).toContain("removable-plugin");

    unregisterPlugin("removable-plugin");
    expect(api!.getPlugins()).not.toContain("removable-plugin");

    if (api) cleanup = api.dispose;
  });

  it("auto-init sets window.__SVELTE_LENS__", async () => {
    // The auto-init at the bottom of index.ts runs on import.
    // Since vi.resetModules() was called, importing fresh will trigger auto-init.
    await import("../index.js");

    expect(window.__SVELTE_LENS__).toBeDefined();
    if (window.__SVELTE_LENS__) {
      cleanup = window.__SVELTE_LENS__.dispose;
    }
  });

  it("getGlobalApi returns the initialized API", async () => {
    const { getGlobalApi, init } = await import("../index.js");

    // init() calls setGlobalApi, so after init getGlobalApi should return the API
    const api = init();
    cleanup = api.dispose;

    const globalApi = getGlobalApi();
    expect(globalApi).not.toBeNull();
    expect(globalApi?.isEnabled()).toBe(true);
  });
});
