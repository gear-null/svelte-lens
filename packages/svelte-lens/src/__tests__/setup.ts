import { vi } from "vitest";

// Stub clipboard API since jsdom doesn't implement it
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Stub elementsFromPoint (not in jsdom)
Document.prototype.elementsFromPoint = vi.fn().mockReturnValue([]);

// Mock window.getComputedStyle for jsdom
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  const style = originalGetComputedStyle(elt, pseudoElt);
  // jsdom returns a valid CSSStyleDeclaration but many properties are empty;
  // add borderRadius default if needed
  if (!style.borderRadius) {
    Object.defineProperty(style, "borderRadius", { value: "0px", configurable: true });
  }
  return style;
};

// Suppress console.error during tests (Svelte mount warnings in jsdom are noisy)
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.join(" ");
  if (msg.includes("Hydration") || msg.includes("svelte")) return;
  originalConsoleError(...args);
};
