import type { Plugin } from "../../types.js";
import { openFileInEditor } from "../../utils/open-file-in-editor.js";

export const openPlugin: Plugin = {
  name: "open",
  actions: [
    {
      id: "open",
      label: "Open",
      shortcut: "O",
      enabled: (context) => Boolean(context.filePath),
      onAction: async (context) => {
        if (!context.filePath) return;
        await openFileInEditor(context.filePath, context.lineNumber);
        context.hideContextMenu();
        context.cleanup();
      },
    },
  ],
};
