import { describe, it, expect } from "vitest";
import { isMountHost } from "./is-mount-host.js";
import { HOST_ATTRIBUTE } from "../constants.js";

describe("isMountHost", () => {
  it("returns true for element with host attribute", () => {
    const host = document.createElement("div");
    host.setAttribute(HOST_ATTRIBUTE, "true");
    expect(isMountHost(host)).toBe(true);
  });

  it("returns true for child of host element", () => {
    const host = document.createElement("div");
    host.setAttribute(HOST_ATTRIBUTE, "true");
    const child = document.createElement("span");
    host.appendChild(child);
    expect(isMountHost(child)).toBe(true);
  });

  it("returns false for regular element", () => {
    const div = document.createElement("div");
    expect(isMountHost(div)).toBe(false);
  });

  it("returns false for element not in host hierarchy", () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.appendChild(child);
    expect(isMountHost(child)).toBe(false);
  });
});
