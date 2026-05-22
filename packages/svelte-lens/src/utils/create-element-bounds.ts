import type { Bounds } from "../types.js";

export const createElementBounds = (element: Element): Bounds => {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    borderRadius: styles.borderRadius || "0px",
  };
};
