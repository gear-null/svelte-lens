import { describe, it, expect } from "vitest";
import { parseActivationKey } from "./parse-activation-key.js";

function makeKeyboardEvent(overrides: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key: overrides.key ?? "g",
    metaKey: overrides.metaKey ?? false,
    ctrlKey: overrides.ctrlKey ?? false,
    altKey: overrides.altKey ?? false,
    shiftKey: overrides.shiftKey ?? false,
    ...overrides,
  });
}

describe("parseActivationKey", () => {
  it("returns always-false matcher for undefined", () => {
    const matcher = parseActivationKey(undefined);
    expect(matcher(makeKeyboardEvent())).toBe(false);
  });

  it("returns the function itself when given a function", () => {
    const customFn = (_event: KeyboardEvent) => true;
    const matcher = parseActivationKey(customFn);
    expect(matcher).toBe(customFn);
  });

  it("parses 'Cmd+Alt+g' correctly", () => {
    const matcher = parseActivationKey("Cmd+Alt+g");
    const matching = makeKeyboardEvent({ key: "g", metaKey: true, altKey: true });
    expect(matcher(matching)).toBe(true);
  });

  it("does not match when modifier is missing", () => {
    const matcher = parseActivationKey("Cmd+Alt+g");
    const noAlt = makeKeyboardEvent({ key: "g", metaKey: true, altKey: false });
    expect(matcher(noAlt)).toBe(false);
  });

  it("parses 'Ctrl+Shift+c' correctly", () => {
    const matcher = parseActivationKey("Ctrl+Shift+c");
    const matching = makeKeyboardEvent({ key: "c", ctrlKey: true, shiftKey: true });
    expect(matcher(matching)).toBe(true);
  });

  it("matches 'Command+Option+G' (longhand)", () => {
    const matcher = parseActivationKey("Command+Option+G");
    const matching = makeKeyboardEvent({ key: "g", metaKey: true, altKey: true });
    expect(matcher(matching)).toBe(true);
  });

  it("does not match when key differs", () => {
    const matcher = parseActivationKey("Cmd+Alt+g");
    const wrongKey = makeKeyboardEvent({ key: "c", metaKey: true, altKey: true });
    expect(matcher(wrongKey)).toBe(false);
  });

  it("matches without modifiers for a bare key", () => {
    const matcher = parseActivationKey("g");
    const matching = makeKeyboardEvent({ key: "g" });
    expect(matcher(matching)).toBe(true);
  });
});
