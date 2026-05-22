---
"svelte-lens": major
"sv-lens": major
"@svelte-lens/cli": major
"@svelte-lens/mcp": major
---

Initial v1.0.0 release of svelte-lens

- Core library: hover any Svelte 5 UI element, copy source context for AI agents
- Shadow-DOM overlay with selection highlight, element label, toolbar
- Cmd+Alt+G activation toggle, Escape to deactivate
- Cmd+C copies element context (HTML preview + source stack)
- Source resolution via element-source + Svelte 5 `__svelte_meta`
- Plugin system with 8 hooks (onActivate, onDeactivate, onElementSelect, onBeforeCopy, transformCopyContent, onAfterCopy, onCopyError, onContextMenu)
- Built-in copy and open plugins
- CLI for SvelteKit/Vite-Svelte project setup
- MCP server with HTTP + stdio transport for AI agent integration
