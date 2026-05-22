const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export const isKeyboardEventFromInput = (event: KeyboardEvent): boolean => {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  if (INPUT_TAGS.has(target.tagName)) return true;
  if ((target as HTMLElement).isContentEditable) return true;
  return false;
};
