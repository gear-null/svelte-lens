import { describe, it, expect } from "vitest";
import { formatStackString } from "./format-stack-string.js";
import type { SourceInfo } from "../types.js";

describe("formatStackString", () => {
  const frame1: SourceInfo = {
    filePath: "src/lib/Counter.svelte",
    lineNumber: 5,
    columnNumber: 10,
    componentName: "Counter",
  };

  const frame2: SourceInfo = {
    filePath: "src/routes/+page.svelte",
    lineNumber: 12,
    columnNumber: null,
    componentName: "+page",
  };

  const frame3: SourceInfo = {
    filePath: "src/lib/Card.svelte",
    lineNumber: null,
    columnNumber: null,
    componentName: "Card",
  };

  it("formats a single frame with component name and location", () => {
    const result = formatStackString([frame1]);
    expect(result).toContain("in Counter");
    expect(result).toContain("src/lib/Counter.svelte:5:10");
  });

  it("formats frame without column", () => {
    const result = formatStackString([frame2]);
    expect(result).toContain("src/routes/+page.svelte:12");
    expect(result).not.toContain("::12");
  });

  it("formats frame without line number", () => {
    const result = formatStackString([frame3]);
    expect(result).toContain("src/lib/Card.svelte");
    expect(result).not.toContain("Card.svelte:");
  });

  it("respects maxLines parameter", () => {
    const result = formatStackString([frame1, frame2, frame3], 2);
    expect(result).toContain("Counter");
    expect(result).toContain("+page");
    expect(result).not.toContain("Card");
  });

  it("returns empty string for empty stack", () => {
    expect(formatStackString([])).toBe("");
  });
});
