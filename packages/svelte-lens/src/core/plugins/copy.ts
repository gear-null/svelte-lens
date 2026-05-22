import type { Plugin } from "../../types.js";
import { isMac } from "../../utils/is-mac.js";

export const copyPlugin: Plugin = {
  name: "copy",
  actions: [
    {
      id: "copy",
      label: "Copy",
      shortcut: isMac() ? "Cmd+C" : "Ctrl+C",
      onAction: () => {
        // copy is the default action - handled directly by the orchestrator
      },
    },
  ],
};
