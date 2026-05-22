import { createSourceResolver, svelteResolver, type ElementSourceInfo } from "element-source";
import type { ElementContext, SourceInfo } from "../types.js";
import { DEFAULT_MAX_CONTEXT_LINES } from "../constants.js";
import { formatHtmlPreview } from "../utils/format-html-preview.js";
import { formatStackString } from "../utils/format-stack-string.js";
import { getTagName } from "../utils/get-tag-name.js";

const resolver = createSourceResolver({ resolvers: [svelteResolver] });

const componentNameFromFilePath = (filePath: string): string | null => {
  const match = filePath.match(/([^/\\]+)\.svelte$/);
  return match?.[1] ?? null;
};

const fillComponentName = (frame: ElementSourceInfo): SourceInfo => ({
  filePath: frame.filePath,
  lineNumber: frame.lineNumber,
  columnNumber: frame.columnNumber,
  componentName: frame.componentName ?? componentNameFromFilePath(frame.filePath),
});

export const resolveSource = async (element: Element): Promise<SourceInfo | null> => {
  const source = await resolver.resolveSource(element);
  if (!source) return null;
  return fillComponentName(source);
};

export const resolveStack = async (element: Element): Promise<SourceInfo[]> => {
  const stack = await resolver.resolveStack(element);
  return stack.map(fillComponentName);
};

export const getStackContext = async (
  element: Element,
  maxLines = DEFAULT_MAX_CONTEXT_LINES,
): Promise<string> => {
  const stack = await resolveStack(element);
  return formatStackString(stack, maxLines);
};

export const getElementContext = async (element: Element): Promise<ElementContext> => {
  const [source, stack] = await Promise.all([resolveSource(element), resolveStack(element)]);
  return {
    element,
    tagName: getTagName(element),
    componentName: source?.componentName ?? stack[0]?.componentName ?? null,
    source,
    stack,
    htmlPreview: formatHtmlPreview(element),
    stackString: formatStackString(stack),
  };
};
