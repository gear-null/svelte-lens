import { describe, it, expect } from "vitest";
import { getTagName } from "./get-tag-name.js";

describe("getTagName", () => {
  it("returns lowercase tag name for a div", () => {
    const div = document.createElement("div");
    expect(getTagName(div)).toBe("div");
  });

  it("returns lowercase tag name for a button", () => {
    const btn = document.createElement("button");
    expect(getTagName(btn)).toBe("button");
  });

  it("returns lowercase for custom elements", () => {
    const el = document.createElement("my-component");
    expect(getTagName(el)).toBe("my-component");
  });
});
