import { describe, it, expect, vi } from "vitest";
import { getElementAtPosition } from "./get-element-at-position.js";
import { HOST_ATTRIBUTE } from "../constants.js";

describe("getElementAtPosition", () => {
  it("returns null when no elements found at position", () => {
    vi.spyOn(Document.prototype, "elementsFromPoint").mockReturnValue([]);
    expect(getElementAtPosition(0, 0)).toBe(null);
    vi.restoreAllMocks();
  });

  it("returns first non-host element", () => {
    const host = document.createElement("div");
    host.setAttribute(HOST_ATTRIBUTE, "true");
    const target = document.createElement("button");
    document.body.appendChild(host);
    document.body.appendChild(target);

    vi.spyOn(Document.prototype, "elementsFromPoint").mockReturnValue([host, target]);
    expect(getElementAtPosition(10, 10)).toBe(target);

    host.remove();
    target.remove();
    vi.restoreAllMocks();
  });

  it("skips host children and returns first real element", () => {
    const host = document.createElement("div");
    host.setAttribute(HOST_ATTRIBUTE, "true");
    const hostChild = document.createElement("span");
    host.appendChild(hostChild);
    const target = document.createElement("div");
    document.body.appendChild(host);
    document.body.appendChild(target);

    vi.spyOn(Document.prototype, "elementsFromPoint").mockReturnValue([hostChild, host, target]);
    expect(getElementAtPosition(10, 10)).toBe(target);

    host.remove();
    target.remove();
    vi.restoreAllMocks();
  });

  it("returns null for non-finite coordinates", () => {
    expect(getElementAtPosition(NaN, 0)).toBe(null);
    expect(getElementAtPosition(0, Infinity)).toBe(null);
  });
});
