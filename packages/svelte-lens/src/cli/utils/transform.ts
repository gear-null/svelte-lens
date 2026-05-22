import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Framework } from "./detect.js";
import { SVELTEKIT_LAYOUT_BLOCK, VITE_SVELTE_IMPORT } from "./templates.js";

export interface TransformResult {
  success: boolean;
  filePath: string;
  message: string;
  originalContent?: string;
  newContent?: string;
  noChanges?: boolean;
}

const ROOT_LAYOUT_PATHS = [
  "src/routes/+layout.svelte",
  "src/routes/+layout.ts",
  "src/routes/+layout.js",
];

const VITE_ENTRY_PATHS = [
  "src/main.ts",
  "src/main.js",
  "src/main.tsx",
  "src/main.jsx",
  "src/index.ts",
  "src/index.js",
];

const findFirst = (projectRoot: string, candidates: string[]): string | null => {
  for (const candidate of candidates) {
    const fullPath = join(projectRoot, candidate);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
};

const fileContainsLensImport = (content: string): boolean =>
  /["'`](?:svelte-lens|sv-lens)["'`]/.test(content);

const LENS_ONMOUNT_CODE = `
  onMount(() => {
    if (dev) import("svelte-lens");
  });`;

const LENS_SCRIPT_IMPORTS = {
  dev: `import { dev } from "$app/environment";`,
  onMount: `import { onMount } from "svelte";`,
};

const mergeIntoExistingScript = (content: string): string => {
  const scriptMatch = content.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
  if (!scriptMatch) return content;

  const openTag = scriptMatch[1] ?? "<script>";
  const scriptBody = scriptMatch[2] ?? "";
  const closeTag = scriptMatch[3] ?? "</script>";

  // If already has lens import, return unchanged
  if (fileContainsLensImport(scriptBody)) return content;

  const importsToAdd: string[] = [];
  const bodyLines: string[] = [];

  if (
    !scriptBody.includes('from "$app/environment"') &&
    !scriptBody.includes("from '$app/environment'")
  ) {
    importsToAdd.push(LENS_SCRIPT_IMPORTS.dev);
  }
  if (!scriptBody.includes('from "svelte"') && !scriptBody.includes("from 'svelte'")) {
    importsToAdd.push(LENS_SCRIPT_IMPORTS.onMount);
  }
  bodyLines.push(LENS_ONMOUNT_CODE.trim());

  // Build the new script body
  const existingLines = scriptBody.trim().split("\n");
  // Find where imports end and code begins
  let importEndIndex = 0;
  for (let i = 0; i < existingLines.length; i++) {
    const line = existingLines[i];
    if (line && !line.trim().startsWith("import ")) {
      importEndIndex = i;
      break;
    }
    if (i === existingLines.length - 1) importEndIndex = i + 1;
  }

  const existingImports = existingLines.slice(0, importEndIndex);
  const existingBody = existingLines.slice(importEndIndex);

  const newImports = [...existingImports, ...importsToAdd];
  const newBody = [...bodyLines, ...existingBody];

  const newScriptBody = [...newImports, "", ...newBody].join("\n");

  return content.replace(
    /<script[^>]*>[\s\S]*?<\/script>/,
    `${openTag}\n${newScriptBody}\n  ${closeTag}`,
  );
};

const transformSvelteKit = (projectRoot: string, force: boolean): TransformResult => {
  const layoutPath = findFirst(projectRoot, ROOT_LAYOUT_PATHS);

  if (!layoutPath || !layoutPath.endsWith(".svelte")) {
    const fallbackPath = join(projectRoot, "src/routes/+layout.svelte");
    return {
      success: true,
      filePath: fallbackPath,
      message: "Will create src/routes/+layout.svelte",
      originalContent: "",
      newContent: `${SVELTEKIT_LAYOUT_BLOCK}\n\n<slot />\n`,
    };
  }

  const originalContent = readFileSync(layoutPath, "utf-8");
  if (fileContainsLensImport(originalContent) && !force) {
    return {
      success: true,
      filePath: layoutPath,
      message: "svelte-lens already imported in layout",
      noChanges: true,
    };
  }

  // If layout has an existing <script> block, merge into it
  if (/<script[^>]*>/.test(originalContent)) {
    const newContent = mergeIntoExistingScript(originalContent);
    return {
      success: true,
      filePath: layoutPath,
      message: "Merges svelte-lens dev import into existing layout script",
      originalContent,
      newContent,
    };
  }

  // No existing script — prepend the full block
  const newContent = `${SVELTEKIT_LAYOUT_BLOCK}\n\n${originalContent}`;

  return {
    success: true,
    filePath: layoutPath,
    message: "Adds svelte-lens dev import to root layout",
    originalContent,
    newContent,
  };
};

const transformViteSvelte = (projectRoot: string, force: boolean): TransformResult => {
  const entryPath = findFirst(projectRoot, VITE_ENTRY_PATHS);

  if (!entryPath) {
    return {
      success: false,
      filePath: "",
      message:
        "Could not find a Vite entry file. Add `if (import.meta.env.DEV) import('svelte-lens');` to your entry yourself.",
    };
  }

  const originalContent = readFileSync(entryPath, "utf-8");
  if (fileContainsLensImport(originalContent) && !force) {
    return {
      success: true,
      filePath: entryPath,
      message: "svelte-lens already imported",
      noChanges: true,
    };
  }

  const newContent = `${VITE_SVELTE_IMPORT}\n\n${originalContent}`;

  return {
    success: true,
    filePath: entryPath,
    message: "Adds svelte-lens dev import to entry",
    originalContent,
    newContent,
  };
};

export const previewTransform = (
  projectRoot: string,
  framework: Framework,
  force = false,
): TransformResult => {
  if (framework === "sveltekit") return transformSvelteKit(projectRoot, force);
  if (framework === "vite-svelte") return transformViteSvelte(projectRoot, force);
  return {
    success: false,
    filePath: "",
    message: "Unsupported framework. svelte-lens supports SvelteKit and Vite + Svelte projects.",
  };
};

export const applyTransform = (result: TransformResult): void => {
  if (!result.success || result.noChanges || !result.newContent) return;
  writeFileSync(result.filePath, result.newContent);
};
