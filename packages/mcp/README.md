# @gear-null/svelte-lens-mcp

MCP server that exposes svelte-lens element context to AI coding agents.

## Usage

### With Claude Code

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "svelte-lens": {
      "command": "npx",
      "args": ["-y", "@gear-null/svelte-lens-mcp"]
    }
  }
}
```

### With Cursor / Windsurf

```bash
npx @gear-null/svelte-lens-mcp
```

## License

MIT
