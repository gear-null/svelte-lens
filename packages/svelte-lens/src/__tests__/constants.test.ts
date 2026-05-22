import { describe, it, expect } from "vitest";
import {
  HOST_ATTRIBUTE,
  INTERNAL_ATTRIBUTES,
  Z_INDEX_OVERLAY,
  Z_INDEX_OVERLAY_CANVAS,
  OFFSCREEN_POSITION,
  FEEDBACK_DURATION_MS,
  ELEMENT_DETECTION_THROTTLE_MS,
  DEFAULT_KEY_HOLD_DURATION_MS,
  PREVIEW_TEXT_MAX_LENGTH,
  DEFAULT_MAX_CONTEXT_LINES,
  OVERLAY_BORDER_COLOR,
  OVERLAY_FILL_COLOR,
} from "../constants.js";

describe("constants", () => {
  it("HOST_ATTRIBUTE is data-svelte-lens", () => {
    expect(HOST_ATTRIBUTE).toBe("data-svelte-lens");
  });

  it("INTERNAL_ATTRIBUTES includes svelte internal attrs", () => {
    expect(INTERNAL_ATTRIBUTES.has("data-svelte-source")).toBe(true);
    expect(INTERNAL_ATTRIBUTES.has("data-svelte-h")).toBe(true);
    expect(INTERNAL_ATTRIBUTES.size).toBe(2);
  });

  it("z-index values are high enough to overlay everything", () => {
    expect(Z_INDEX_OVERLAY).toBeGreaterThan(2147483600);
    expect(Z_INDEX_OVERLAY_CANVAS).toBeLessThan(Z_INDEX_OVERLAY);
  });

  it("OFFSCREEN_POSITION is a large negative number", () => {
    expect(OFFSCREEN_POSITION).toBeLessThan(0);
  });

  it("timing constants are reasonable", () => {
    expect(FEEDBACK_DURATION_MS).toBeGreaterThan(0);
    expect(ELEMENT_DETECTION_THROTTLE_MS).toBeGreaterThan(0);
    expect(DEFAULT_KEY_HOLD_DURATION_MS).toBeGreaterThan(0);
  });

  it("content limits are reasonable", () => {
    expect(PREVIEW_TEXT_MAX_LENGTH).toBeGreaterThan(0);
    expect(DEFAULT_MAX_CONTEXT_LINES).toBeGreaterThan(0);
  });

  it("overlay colors are valid rgba values", () => {
    expect(OVERLAY_BORDER_COLOR).toMatch(/^rgba\(/);
    expect(OVERLAY_FILL_COLOR).toMatch(/^rgba\(/);
  });
});
