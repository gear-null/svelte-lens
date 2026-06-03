# AGENTS.md — svelte-lens

## Org conventions

<https://github.com/gear-null/.github/blob/main/AGENTS.md> is the
cross-repo source of truth. Key rules reproduced here for locality:

### Branching

GitHub Flow: `main` is the canonical branch. Cut feature branches from
`main`; PRs target `main`. Use `type/short-description` branch names
(`feat/…`, `fix/…`, etc.).

### Commits

Conventional Commits: `type(scope): description`.

### Pull requests

All changes land via PR — never commit directly to `main`. Keep PRs
scoped to one logical change. PRs are lightweight: a short description
of intent and key design decisions is sufficient — no template required.

### Verify before commit

Run every check the repo configures — lint, type-check, build, and
tests — and make them all pass. Do not skip checks or bypass hooks
(`--no-verify`, etc.) to push past failures; fix the underlying issue.

### Agent autonomy & pre-merge review

When working at high autonomy, every PR you cut MUST pass an
agent-driven pre-merge review loop before it's presented to a developer:

1. Author the change on a feature branch; run all checks green.
2. Spawn separate agent code reviews — as many as the change warrants
   (parallel specialists across code, tests, behavior).
3. Analyze every review's findings; fix all important issues on the
   same branch.
4. Re-run all tests and checks after the fixes.
5. Repeat steps 2–4 iteratively until a review pass surfaces no
   important issues.
6. Only then present the work back to the developer for review.

CI green is necessary but not sufficient — the review loop catches what
CI and self-review miss. Do not surface a PR for human review mid-loop.

### Tracked work

Track non-trivial work in GitHub Issues before writing code; keep the
issue updated as work progresses. Trivial changes (typos, automated
bumps, single-line fixes) are exempt.

### Defaults

- Stay in scope. No files created unless asked, no refactors, and no
  speculative error handling beyond the task.

---

## Project-specific conventions

### Monorepo layout

```
packages/svelte-lens/     → @gear-null/svelte-lens (npm package)
  src/
    index.ts              → main library entry (init, plugins, API)
    mcp/                  → MCP server (stdio + HTTP)
    cli/                  → CLI (svelte-lens init, detect)
apps/e2e-app/             → Playwright E2E test harness
```

### Key commands

```bash
pnpm install --frozen-lockfile   # install (CI uses --ignore-scripts too)
pnpm build                       # build all packages
pnpm test                        # unit tests (vitest)
pnpm typecheck                   # svelte-check
pnpm format:check                # prettier
pnpm --filter @svelte-lens/e2e-app test:e2e   # E2E
```

### Security posture

This package is intended for enterprise use. All security audit findings
are tracked in `SECURITY_AUDIT.md`. Changes touching MCP, CLI, plugin
system, or the browser runtime must be reviewed with extra care for:

- Injection vectors (CWE-77/78/79)
- Supply-chain risks (CWE-426/829)
- Prototype pollution (CWE-1321)
- Cross-origin / CORS issues

### Agent context

`AGENTS.md` is the cross-tool source of truth for agent context.
`CLAUDE.md` is a one-line `@AGENTS.md` import. Edit `AGENTS.md` — never
`CLAUDE.md` directly.
