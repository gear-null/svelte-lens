const tryDevServerOpen = async (
  filePath: string,
  lineNumber: number | undefined,
): Promise<boolean> => {
  if (typeof fetch === "undefined") return false;
  const params = new URLSearchParams({ file: filePath });
  if (lineNumber) params.set("line", String(lineNumber));
  params.set("column", "1");
  try {
    const response = await fetch(`/__open-in-editor?${params}`);
    return response.ok;
  } catch {
    return false;
  }
};

export const openFileInEditor = async (filePath: string, lineNumber?: number): Promise<boolean> => {
  return tryDevServerOpen(filePath, lineNumber);
};
