import { PREVIEW_TEXT_MAX_LENGTH, INTERNAL_ATTRIBUTES } from "../constants.js";
import { getTagName } from "./get-tag-name.js";
import { truncateString } from "./truncate-string.js";

const PRIORITY_ATTRS: ReadonlyArray<string> = [
  "id",
  "data-testid",
  "data-test",
  "name",
  "role",
  "aria-label",
  "type",
  "href",
];

const formatAttrs = (element: Element): string => {
  const parts: string[] = [];
  for (const { name, value } of Array.from(element.attributes)) {
    if (INTERNAL_ATTRIBUTES.has(name)) continue;
    if (name === "class" || name === "style") continue;
    if (PRIORITY_ATTRS.includes(name) || value) {
      const valueText = truncateString(value, 60);
      parts.push(value ? ` ${name}="${valueText}"` : ` ${name}`);
    }
  }
  const classValue = element.getAttribute("class");
  if (classValue) parts.push(` class="${truncateString(classValue, 60)}"`);
  return parts.join("");
};

const getDirectText = (element: Element): string => {
  let text = "";
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const trimmed = node.textContent?.trim() ?? "";
      if (trimmed) text += (text ? " " : "") + trimmed;
    }
  }
  return text;
};

export const formatHtmlPreview = (element: Element): string => {
  const tagName = getTagName(element);
  const attrs = formatAttrs(element);
  const text = truncateString(getDirectText(element), PREVIEW_TEXT_MAX_LENGTH);
  if (text) {
    return `<${tagName}${attrs}>${text}</${tagName}>`;
  }
  const childCount = element.children.length;
  if (childCount > 0) {
    return `<${tagName}${attrs}>(${childCount} children)</${tagName}>`;
  }
  return `<${tagName}${attrs} />`;
};
