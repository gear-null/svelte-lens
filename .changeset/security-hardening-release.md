---
"@gear-null/svelte-lens": patch
---

Security hardening release. This is the first release published from CI with an npm provenance attestation.

- `init()` must now be called explicitly; importing the package no longer auto-initializes. Migration: `import("@gear-null/svelte-lens").then((m) => m.init())` (the CLI generates this pattern).
- `init()` is a no-op in production builds unless `window.__SVELTE_LENS_FORCE_ENABLE__ = true` is set, preventing the inspector from shipping to end users when misconfigured.
- `window.__SVELTE_LENS__` is locked against overwrite by third-party scripts; the `svelte-lens:init` event only fires from explicit `init()`.
- HTML previews escape `&`, `"`, `<`, `>`; `setOptions()` filters prototype-pollution keys.
- MCP server: loopback-only origin checks, 1 MiB body limit, session cap with leak-free lifecycle, and untrusted-content framing of page-derived context passed to agents.
- CLI templates and detection use the scoped `@gear-null/svelte-lens` package name; custom `activationKey` option is wired through with exact modifier matching.
