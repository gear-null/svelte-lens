import type { ActivationKey } from "../types.js";

interface ParsedKey {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const isCtrlPart = (part: string): boolean =>
  part === "ctrl" || part === "control" || part === "cmd" || part === "command";

const parsePartsToKey = (parts: string[]): ParsedKey => {
  const key: ParsedKey = { key: "", ctrl: false, meta: false, alt: false, shift: false };
  for (const rawPart of parts) {
    const part = rawPart.trim().toLowerCase();
    if (!part) continue;
    if (part === "ctrl" || part === "control") key.ctrl = true;
    else if (part === "cmd" || part === "command" || part === "meta") key.meta = true;
    else if (part === "alt" || part === "option") key.alt = true;
    else if (part === "shift") key.shift = true;
    else key.key = part;
  }
  if (parts.some(isCtrlPart) && !key.ctrl && !key.meta) {
    key.meta = true;
  }
  return key;
};

const matchesParsedKey = (event: KeyboardEvent, parsed: ParsedKey): boolean => {
  if (parsed.shift !== event.shiftKey) return false;
  if (parsed.alt !== event.altKey) return false;
  if (parsed.ctrl && !event.ctrlKey) return false;
  if (parsed.meta && !event.metaKey) return false;
  if (!parsed.key) return true;
  return event.key.toLowerCase() === parsed.key || event.code.toLowerCase() === parsed.key;
};

export const parseActivationKey = (
  activation: ActivationKey | undefined,
): ((event: KeyboardEvent) => boolean) => {
  if (!activation) {
    return () => false;
  }
  if (typeof activation === "function") {
    return activation;
  }
  const parsed = parsePartsToKey(activation.split(/[+\s]+/));
  return (event: KeyboardEvent) => matchesParsedKey(event, parsed);
};
