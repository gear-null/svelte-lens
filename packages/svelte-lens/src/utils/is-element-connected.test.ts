import { describe, it, expect } from "vitest";
import { isElementConnected } from "./is-element-connected.js";

describe("isElementConnected", () => {
  it("returns true for element in document", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    expect(isElementConnected(div)).toBe(true);
    div.remove();
  });

  it("returns false for detached element", () => {
    const div = document.createElement("div");
    expect(isElementConnected(div)).toBe(false);
  });
});
