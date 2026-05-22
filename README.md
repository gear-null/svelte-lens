# svelte-lens

**Hover any UI element, copy its source context for AI agents. Built for Svelte 5.**

svelte-lens gives your AI coding agent eyes inside your running app. Activate it, hover any DOM element, and press Cmd+C to copy the element's HTML preview and component source stack straight to your clipboard. Your agent gets precise, grounded context about what's on screen instead of guessing from file listings.

Inspired by [react-grab](https://github.com/aidenybai/react-grab) by [Aiden Bai](https://github.com/aidenybai) — the same "hover and copy" concept, adapted for Svelte 5 with source resolution via `__svelte_meta`, a plugin system, and built-in MCP + CLI.

## How it works

1. **Activate** — press `Cmd+Alt+G` (macOS) or `Ctrl+Alt+G` (Linux/Windows)
2. **Hover** — a shadow-DOM overlay highlights any element on the page
3. **Copy** — press `Cmd+C` / `Ctrl+C` to copy the element's context to your clipboard

The copied context includes:

- The element's rendered HTML preview
- The component source stack (file path, line number, component name) resolved via Svelte 5's `__svelte_meta` through [element-source](https://github.com/nicolo-ribaudo/element-source)
- Any additional context injected by plugins

## Install

```bash
npm install @gear-null/svelte-lens
```

## Quick start

Add to your root layout — it auto-initializes in dev mode:

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { dev } from "$app/environment";
  import { onMount } from "svelte";

  onMount(() => {
    if (dev) {
      void import("@gear-null/svelte-lens");
    }
  });
</script>
```

Or use the CLI to scaffold it automatically:

```bash
npx @gear-null/svelte-lens init
```

## MCP server

Connect svelte-lens directly to your AI agent via the built-in MCP server:

```json
{
  "mcpServers": {
    "svelte-lens": {
      "command": "npx",
      "args": ["-y", "@gear-null/svelte-lens", "--mcp"]
    }
  }
}
```

Works with Claude Code, Cursor, Windsurf, and any MCP-compatible agent.

## Keyboard shortcuts

| Action               | macOS       | Linux/Windows |
| -------------------- | ----------- | ------------- |
| Toggle on/off        | `Cmd+Alt+G` | `Ctrl+Alt+G`  |
| Deactivate           | `Escape`    | `Escape`      |
| Copy element context | `Cmd+C`     | `Ctrl+C`      |

## API

```ts
import { init } from "@gear-null/svelte-lens";

const api = init();

api.activate(); // Turn on the overlay
api.deactivate(); // Turn off and clean up
api.setEnabled(false); // Disable entirely
api.dispose(); // Tear down everything

// Plugin system — 8 hooks
api.registerPlugin({
  name: "my-plugin",
  onElementSelect: (ctx) => {
    /* element was hovered */
  },
  transformCopyContent: (content) => {
    // Modify what gets copied to clipboard
    return content;
  },
  onAfterCopy: (content) => {
    /* content was copied */
  },
  onCopyError: (err) => {
    /* copy failed */
  },
  onContextMenu: (ctx, actions) => {
    /* right-click menu */
  },
});
```

Available hooks: `onActivate`, `onDeactivate`, `onElementSelect`, `onBeforeCopy`, `transformCopyContent`, `onAfterCopy`, `onCopyError`, `onContextMenu`.

Built-in plugins: `copyPlugin` (clipboard copy), `openPlugin` (open source in editor).

## Architecture

- **Shadow DOM overlay** — isolated from your app's styles, zero CSS leaks
- **Svelte 5 runes** — built with `$state`, `$derived`, `$props` throughout
- **Source resolution** — uses `__svelte_meta` via [element-source](https://github.com/nicolo-ribaudo/element-source) to trace any element back to its component, file, and line
- **Plugin system** — extend copy behavior, add context menu actions, or transform content before it reaches the clipboard
- **CLI** — `npx @gear-null/svelte-lens init` auto-detects SvelteKit or Vite+Svelte and wires the import into your layout
- **MCP server** — HTTP + stdio transport so AI agents can query the latest element context programmatically

## Acknowledgements

svelte-lens is a Svelte 5 port of [react-grab](https://github.com/aidenybai/react-grab) by [Aiden Bai](https://github.com/aidenybai). React-grab introduced the idea of hovering a UI element to grab its source context for AI agents — svelte-lens brings that same workflow to the Svelte ecosystem with Svelte 5-specific source resolution, a plugin architecture, and native MCP + CLI support.

## License

MIT
