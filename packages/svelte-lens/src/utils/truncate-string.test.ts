import { describe, it, expect } from "vitest";
import { truncateString } from "./truncate-string.js";

describe("truncateString", () => {
  it("returns the string unchanged when within limit", () => {
    expect(truncateString("hello", 10)).toBe("hello");
  });

  it("truncates at maxLength with ellipsis", () => {
    expect(truncateString("hello world", 5)).toBe("hello...");
  });

  it("returns the string unchanged when equal to maxLength", () => {
    expect(truncateString("hello", 5)).toBe("hello");
  });

  it("handles empty string", () => {
    expect(truncateString("", 5)).toBe("");
  });
});
