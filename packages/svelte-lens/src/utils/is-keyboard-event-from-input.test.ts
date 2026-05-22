import { describe, it, expect } from "vitest";
import { isKeyboardEventFromInput } from "./is-keyboard-event-from-input.js";

describe("isKeyboardEventFromInput", () => {
  function createKeyboardEvent(target: EventTarget): KeyboardEvent {
    return new KeyboardEvent("keydown", { bubbles: true, cancelable: true, composed: true });
  }

  it("returns true for INPUT element", () => {
    const input = document.createElement("input");
    const event = createKeyboardEvent(input);
    Object.defineProperty(event, "target", { value: input, configurable: true });
    expect(isKeyboardEventFromInput(event)).toBe(true);
  });

  it("returns true for TEXTAREA element", () => {
    const textarea = document.createElement("textarea");
    const event = createKeyboardEvent(textarea);
    Object.defineProperty(event, "target", { value: textarea, configurable: true });
    expect(isKeyboardEventFromInput(event)).toBe(true);
  });

  it("returns true for SELECT element", () => {
    const select = document.createElement("select");
    const event = createKeyboardEvent(select);
    Object.defineProperty(event, "target", { value: select, configurable: true });
    expect(isKeyboardEventFromInput(event)).toBe(true);
  });

  it("returns false for DIV element", () => {
    const div = document.createElement("div");
    const event = createKeyboardEvent(div);
    Object.defineProperty(event, "target", { value: div, configurable: true });
    expect(isKeyboardEventFromInput(event)).toBe(false);
  });

  it("returns true for contentEditable element", () => {
    const div = document.createElement("div");
    // jsdom doesn't fully support contentEditable getter, so we mock it
    Object.defineProperty(div, "isContentEditable", { value: true, configurable: true });
    const event = createKeyboardEvent(div);
    Object.defineProperty(event, "target", { value: div, configurable: true });
    expect(isKeyboardEventFromInput(event)).toBe(true);
  });
});
