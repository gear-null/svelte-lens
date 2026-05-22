# @gear-null/svelte-lens

Hover any UI element in your browser, copy its source context for AI agents. Built for Svelte 5. Includes CLI and MCP server.

## Install

```bash
npm install @gear-null/svelte-lens
```

## Quick Start

```svelte
<script>
  import { dev } from "$app/environment";
  import { init } from "@gear-null/svelte-lens";

  onMount(() => {
    if (dev) init();
  });
</script>
```

## CLI

```bash
npx @gear-null/svelte-lens init
```

Detects SvelteKit and Vite+Svelte projects, and wires svelte-lens into your `+layout.svelte` automatically.

## MCP Server

For AI agent integration (Claude Code, Cursor, Windsurf):

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

Or run directly: `npx svelte-lens-mcp`

## Features

- **Hover-to-select** — shadow-DOM overlay highlights any element
- **Cmd/Ctrl+C to copy** — copies HTML preview + source stack to clipboard
- **Source resolution** — uses `__svelte_meta` via [element-source](https://github.com/nicolo-ribaudo/element-source) to pinpoint component/file/line
- **Plugin system** — 8 hooks: `onActivate`, `onDeactivate`, `onElementSelect`, `onBeforeCopy`, `transformCopyContent`, `onAfterCopy`, `onCopyError`, `onContextMenu`
- **CLI** — `npx @gear-null/svelte-lens init` to scaffold into SvelteKit or Vite-Svelte projects
- **MCP server** — expose element context to AI coding agents

## Activation

- **Toggle**: `Cmd+Alt+G` (macOS) / `Ctrl+Alt+G` (Windows/Linux)
- **Deactivate**: `Escape`
- **Copy**: `Cmd+C` / `Ctrl+C` while hovering

## API

```ts
import { init } from "@gear-null/svelte-lens";

const api = init();

api.activate();
api.deactivate();
api.registerPlugin({ name: "my-plugin", ... });
api.setEnabled(false);
api.dispose();
```

## License

MIT
