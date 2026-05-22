import { describe, it, expect, vi } from "vitest";
import { isMac } from "./is-mac.js";

describe("isMac", () => {
  it("returns false when navigator.platform is Win32", () => {
    Object.defineProperty(navigator, "platform", { value: "Win32", configurable: true });
    expect(isMac()).toBe(false);
  });

  it("returns true when navigator.platform is MacIntel", () => {
    Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true });
    expect(isMac()).toBe(true);
  });

  it("returns true for iPhone", () => {
    Object.defineProperty(navigator, "platform", { value: "iPhone", configurable: true });
    expect(isMac()).toBe(true);
  });
});
