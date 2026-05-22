# svelte-lens

Hover any UI element in your browser, copy its source context for AI agents. Built for Svelte 5.

## Install

```bash
npm install svelte-lens
```

## Quick Start

```svelte
<script>
  import { dev } from "$app/environment";

  let { init } = $state();

  onMount(() => {
    if (dev) {
      const lens = init();
      // lens is auto-enabled in dev mode
    }
  });
</script>
```

## Features

- **Hover-to-select** — shadow-DOM overlay highlights any element
- **Cmd/Ctrl+C to copy** — copies HTML preview + source stack to clipboard
- **Source resolution** — uses `__svelte_meta` via [element-source](https://github.com/nicolo-ribaudo/element-source) to pinpoint component/file/line
- **Plugin system** — 8 hooks: `onActivate`, `onDeactivate`, `onElementSelect`, `onBeforeCopy`, `transformCopyContent`, `onAfterCopy`, `onCopyError`, `onContextMenu`
- **CLI** — `npx svelte-lens init` to scaffold into SvelteKit or Vite-Svelte projects
- **MCP server** — expose element context to AI coding agents

## Activation

- **Toggle**: `Cmd+Alt+G` (macOS) / `Ctrl+Alt+G` (Windows/Linux)
- **Deactivate**: `Escape`
- **Copy**: `Cmd+C` / `Ctrl+C` while hovering

## API

```ts
import { init } from "svelte-lens";

const api = init();

api.activate();
api.deactivate();
api.registerPlugin({ name: "my-plugin", ... });
api.setEnabled(false);
api.dispose();
```

## License

MIT
