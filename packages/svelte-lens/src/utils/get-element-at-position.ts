import { isMountHost } from "./is-mount-host.js";

export const getElementAtPosition = (clientX: number, clientY: number): Element | null => {
  if (typeof document === "undefined") return null;
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
  const candidates = document.elementsFromPoint(clientX, clientY);
  for (const candidate of candidates) {
    if (!isMountHost(candidate)) return candidate;
  }
  return null;
};
