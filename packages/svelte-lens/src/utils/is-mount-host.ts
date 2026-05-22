import { HOST_ATTRIBUTE } from "../constants.js";

export const isMountHost = (element: Element): boolean => {
  let current: Element | null = element;
  while (current) {
    if (current.hasAttribute?.(HOST_ATTRIBUTE)) return true;
    current = current.parentElement;
  }
  return false;
};
