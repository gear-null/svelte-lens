# sv-lens

## 1.0.0

### Major Changes

- [`b318a82`](https://github.com/gear-null/svelte-lens/commit/b318a82cc20944bfc3543771c68699ff089d8599) Thanks [@DoisKoh](https://github.com/DoisKoh)! - Initial v1.0.0 release of svelte-lens
  - Core library: hover any Svelte 5 UI element, copy source context for AI agents
  - Shadow-DOM overlay with selection highlight, element label, toolbar
  - Cmd+Alt+G activation toggle, Escape to deactivate
  - Cmd+C copies element context (HTML preview + source stack)
  - Source resolution via element-source + Svelte 5 `__svelte_meta`
  - Plugin system with 8 hooks (onActivate, onDeactivate, onElementSelect, onBeforeCopy, transformCopyContent, onAfterCopy, onCopyError, onContextMenu)
  - Built-in copy and open plugins
  - CLI for SvelteKit/Vite-Svelte project setup
  - MCP server with HTTP + stdio transport for AI agent integration

### Patch Changes

- Updated dependencies [[`b318a82`](https://github.com/gear-null/svelte-lens/commit/b318a82cc20944bfc3543771c68699ff089d8599)]:
  - svelte-lens@1.0.0
