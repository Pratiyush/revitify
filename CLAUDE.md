# CLAUDE.md — working in the revitify repo

Guidance for Claude Code (and other AI assistants) contributing to **revitify** — a native-TypeScript
code-knowledge-graph engine. (For *using* revitify, see `README.md` and the `website/` guide.)

## Commands

```sh
pnpm run build          # tsc + copy export assets
pnpm run lint           # biome check .   (pnpm format auto-fixes)
pnpm run knip           # dead exports / unused deps
pnpm run depcruise      # enforced layer matrix
pnpm run test:coverage  # vitest + ratcheted floor
pnpm check              # ALL of the above — the CI gate
pnpm run docs:build     # build the VitePress site (fails on dead links)
```

## Non-negotiables

- **The output contract is frozen.** `graph.json` field names never change; additions are
  **additive-only**. `assertGraphContract` + the contract tests guard the shape every consumer
  (including dev-spec-kit) depends on. Do not reshape nodes/links.
- **Determinism / byte-stability.** Same code → byte-identical `graph.json`. Walk order is sorted,
  fragment merges are first-seen-wins, the worker pool reassembles in walk order. Never introduce
  ordering nondeterminism (no `Date.now()`/`Math.random()` in the build path).
- **Enforced layers.** Imports must respect `model → extract → ingest → passes → enrich → query →
  export → serve → cli`. `pnpm depcruise` fails CI on a cross-layer import. Adding a language or
  exporter is a **new module + a registry entry**, not a switch edit.
- **Offline by default.** A code-only build needs no network and no API keys; heavy pieces
  (tree-sitter grammars, MCP SDK, LLM backends) load lazily. `import { revitify }` must never pull
  them in.
- **Issue-first + protected `main`** — open a GitHub issue before working (reference it with
  `Closes #NN`), branch, open a PR, let CI (`pnpm check`) go green, then **squash-merge**. Use
  **Conventional Commit** titles: **release-please** maintains a release PR from them (`feat:` minor,
  `fix:` patch, `feat!:` major) that bumps package.json + CHANGELOG and, on merge, tags + releases.
  Never hand-bump versions or create tags.

## Provenance

revitify is an MIT port of the concepts in [graphify](https://github.com/safishamsi/graphify) — keep
the attribution in `src/index.ts` and the footer; graphify is credit, never a runtime dependency.

## Where things live

`src/`: `model/` (the graph types + contract) · `extract/` (per-language extractors) ·
`ingest/` (file walk) · `passes/` (resolve, dedup, cluster, pipeline, worker-pool) ·
`enrich/`/`export/` (report + exporters) · `serve/` (http + mcp over a shared `handlers.ts`) ·
`cli/` (verbs). Docs: `website/`. See [CONTRIBUTING.md](CONTRIBUTING.md).
