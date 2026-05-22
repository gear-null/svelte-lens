import type { SourceInfo } from "../types.js";

export const formatStackString = (stack: SourceInfo[], maxLines = 3): string => {
  const lines: string[] = [];
  for (const frame of stack) {
    if (lines.length >= maxLines) break;
    const location = frame.lineNumber
      ? `${frame.filePath}:${frame.lineNumber}${frame.columnNumber ? `:${frame.columnNumber}` : ""}`
      : frame.filePath;
    if (frame.componentName) {
      lines.push(`\n  in ${frame.componentName} (at ${location})`);
    } else {
      lines.push(`\n  in ${location}`);
    }
  }
  return lines.join("");
};
