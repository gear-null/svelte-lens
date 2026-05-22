import { describe, it, expect } from "vitest";
import { createElementBounds } from "./create-element-bounds.js";

describe("createElementBounds", () => {
  it("returns bounds from getBoundingClientRect", () => {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = "10px";
    div.style.top = "20px";
    div.style.width = "100px";
    div.style.height = "50px";
    document.body.appendChild(div);

    const bounds = createElementBounds(div);
    expect(bounds).toHaveProperty("x");
    expect(bounds).toHaveProperty("y");
    expect(bounds).toHaveProperty("width");
    expect(bounds).toHaveProperty("height");
    expect(bounds).toHaveProperty("borderRadius");
    div.remove();
  });

  it("includes borderRadius from computed style", () => {
    const div = document.createElement("div");
    div.style.borderRadius = "8px";
    document.body.appendChild(div);

    const bounds = createElementBounds(div);
    expect(bounds.borderRadius).toBeTruthy();
    div.remove();
  });
});
