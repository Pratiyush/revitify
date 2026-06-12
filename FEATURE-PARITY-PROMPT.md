# Revitify — Modular + Graphify Feature-Parity Master Prompt

> Paste the block below into a FRESH Claude Code session whose working directory is
> `~/Github/revitify`. It drives revitify from its current 4-file core to a modular,
> graphify-feature-complete TypeScript engine, in phases, test-first. Locations are exact for this
> machine. Do NOT do it all in one shot — work phase by phase, showing me each phase's gate.

---

I'm building **revitify** — a native TypeScript code-knowledge-graph engine that is a **modular,
exact-feature copy of graphify** (the Python tool). Make it modular first, then reach feature
parity. Work test-first, phase by phase; stop at each phase gate and show me.

## Locations (exact)
- **Revitify (this repo):** `~/Github/revitify` — standalone, MIT, currently: `src/{index,ingest,html,types}.ts`,
  `test/revitify.test.ts`, `.track`, builds with `pnpm build`, tests with `pnpm test` (vitest).
- **Graphify reference (read-only, study it):** `~/Github/llm-dev-kit/_ref/reference/graphify` —
  the Python original. Its `graphify/*.py` modules ARE the feature inventory; `docs/how-it-works.md`
  and `README.md` explain the passes. Read the real code to copy behavior, not guess it.
- **Consumed by Rivet:** `~/Github/llm-dev-kit` imports revitify via `link:/Users/pratiyush/Github/revitify`
  as its default `graphify.provider`. Rivet's `src/engine/graphify/index.ts::loadCodeGraph` reads
  revitify's `graph.json`. **Breaking that contract breaks Rivet — it is the #1 invariant below.**

## HARD INVARIANTS (never violate — every phase must keep these green)
1. **Output contract is sacred.** Keep emitting `graphify-out/{graph.json, graph.html, GRAPH_REPORT.md}`
   with the graph.json shape Rivet already consumes: `nodes[{id,name,label,source_file,
   source_location,community,...}]`, `links[{source,target,relation,...}]`, `built_at_commit`.
   Additive fields are fine; renaming/removing these is not. A test must assert the contract holds.
2. **`revitify(rootDir)` and `buildGraph(rootDir)` keep working** — Rivet calls them. Grow the API
   around them; don't replace them out from under the consumer.
3. **Code-only runs fully OFFLINE, zero API key, zero network** — exactly like graphify. Multimodal
   / LLM features are opt-in and degrade gracefully when no key is present.
4. **Free / open-source only.** tree-sitter (WASM), local whisper, OSS libs. No paid SaaS in the core.
5. **Lean core deps.** The code-graph core stays near-zero-runtime-dependency (today: just
   `typescript`). Heavy/optional features (whisper, LLM SDKs, tree-sitter grammars) load lazily,
   behind their command, never required to `import { revitify }`.
6. **Upstream pin discipline.** `.track` pins graphify @ 0.8.38 / PR #1271. When you copy a feature,
   note which upstream module it came from; update `.track` only when you re-sync.
7. **MIT attribution.** Concepts adapted from graphify (MIT, github.com/safishamsi/graphify);
   original TypeScript implementation. Keep the note in README + .track.

## Target modular architecture (refactor the current core into this)
```
src/
  model/        graph types, node/link kinds, confidence enum, the output-contract schema (+ a
                contract test that fails loudly if the shape Rivet reads ever changes)
  extract/      per-language symbol+reference extractors behind ONE interface
                (Extractor: detect(file) -> bool, extract(file) -> {nodes,links}); register
                tree-sitter grammars here, one module per language, plus the TS-compiler extractor
                that already exists
  ingest/       per-content-type ingestors behind ONE interface (code, markdown, docs/PDF, images,
                video/audio, SQL schema, cargo/deps) — each declares what it needs (offline vs key)
  passes/       the three-pass pipeline: 1) extract  2) infer/resolve (symbol resolution, dedup via
                minhash, confidence tagging)  3) cluster (Leiden community detection)
  enrich/       report intelligence: god-nodes, surprising-connections, the "why" extraction
                (NOTE/WHY/HACK comments + docstrings as linked nodes), suggested questions
  query/        in-memory graph queries: query, path (bfs/dfs), explain, communities, cohesion,
                affected/blast-radius; query logging
  export/       graph.html (interactive), GRAPH_REPORT.md, callflow-html, tree-html, wiki, mermaid
  cache/        SHA256 per-file cache; parallel extraction; incremental re-index
  serve/        local HTTP server + MCP server (query_graph tool)
  cli/          the `revitify` command dispatching all verbs; `index.ts` stays the library entry
```
Each interface gets a registry so adding a language/ingestor/exporter is a new module, not an edit
to a switch. This modularity IS the first deliverable — graphify parity rides on top of it.

## Feature-parity checklist (grouped by graphify's real modules — copy behavior, verify against the reference)
**Pass 1 — extraction (`extract.py`, `detect.py`, `ingest.py`):**
- [ ] tree-sitter extractors for graphify's languages: Python, TypeScript/JS, Java, Go, Rust, Ruby,
      C/C++, C#, Kotlin, Swift, PHP, Scala, Bash, SQL (start with TS+Python+Go+Rust, then widen).
- [ ] language auto-detection; SHA256 per-file cache; parallel extraction across files.
- [ ] the "why" nodes: `# NOTE:`/`# WHY:`/`# HACK:` comments + docstrings extracted as linked nodes.
**Pass 2 — inference (`symbol_resolution.py`, `dedup.py`, `_minhash.py`, `semantic_cleanup.py`):**
- [ ] cross-file symbol resolution (a reference resolves to its definition's node).
- [ ] minhash-based dedup of near-duplicate nodes; confidence tagging on every inferred edge:
      `EXTRACTED` / `INFERRED` / `AMBIGUOUS`.
**Pass 3 — clustering (`cluster.py`):**
- [ ] Leiden (or faithful equivalent) community detection → `community` on each node.
**Report intelligence (`report.py`, `analyze.py`):**
- [ ] god-nodes (most-connected), surprising connections (cross-module links ranked by surprise),
      suggested questions (4–5), confidence summary — all in GRAPH_REPORT.md.
**Queries (`querylog.py`, `affected.py`, query verbs):**
- [ ] `query`, `path` (bfs/dfs), `explain`, `communities`, `cohesion`, `affected`; JSONL query log.
**Exports (`export.py`, `callflow_html.py`, `tree_html.py`, `wiki.py`):**
- [ ] interactive `graph.html` (already exists — keep), `callflow-html`, `tree-html`, `wiki`, mermaid.
**Multimodal ingest (`transcribe.py`, `llm.py`, `mcp_ingest.py`, `scip_ingest.py`) — opt-in, key-gated:**
- [ ] docs/PDF/image semantic extraction via a pluggable LLM backend (Claude/OpenAI/Gemini/Ollama;
      auto-detect by env key; `--backend ollama` fully local). Video/audio via local whisper.
- [ ] SCIP index ingest; SQL/Postgres schema introspection; cargo dependency introspection.
**Scale & corpus (`global_graph.py`, `watch.py`, `prs.py`, `cache.py`):**
- [ ] multi-corpus global graph; `watch` for incremental re-index; PR/diff impact analysis.
**Server & integration (`serve.py`, `hooks.py`, `manifest.py`, `install.py`, `security.py`, `validate.py`, `diagnostics.py`):**
- [ ] local HTTP server + **MCP server** exposing a `query_graph` tool; `validate`, `diagnose`,
      `security` self-checks; the `/revitify` assistant skill + `install` for Claude Code (others later).

## Build discipline (test-first, phased)
- **Recommended: dogfood Rivet.** `rivet init` this repo (`rivet() { node ~/Github/llm-dev-kit/dist/cli/index.js "$@"; }`),
  `rivet init --platforms typescript`, write `.rivet/specs/*.md` with `REQUIREMENT_<AREA>-NN` Gherkin
  criteria (one negative/failure scenario each — the floor), and drive every feature through the loop:
  spec → `rivet spec tasks` → failing test → `rivet check run … --expect-red` → implement → green →
  `rivet task done` → `rivet verify`. This dogfoods Rivet on a real TS library AND keeps revitify
  honest. If you skip Rivet, still TDD with vitest: failing test first, always.
- One PHASE at a time. After each phase: `pnpm build && pnpm test` green, the **output-contract test**
  green, and `revitify(rootDir)` still produces all three artifacts. Show me the phase gate, then stop.
- Every feature copied from graphify: add a test that runs it on a small fixture AND (where sane)
  compares the shape/spirit against what the reference produces. Note the source module in the test.

## Suggested phase order (smallest risk first; reorder if you see better)
1. **Modularize** the current core into the layout above (pure refactor; all existing tests stay green;
   contract test added). Gate: same outputs, new structure.
2. **Multi-language extraction** via tree-sitter (TS+Python+Go+Rust first), language detection, cache,
   parallel. Gate: graphs a mixed-language fixture; node counts sane; offline.
3. **Three-pass intelligence**: symbol resolution, minhash dedup, confidence tags, Leiden communities.
4. **Report parity**: god-nodes, surprising connections, the "why" nodes, suggested questions.
5. **Queries + exports**: query/path/explain/affected + callflow-html/tree-html/wiki.
6. **CLI + watch + global graph + PR analysis.**
7. **Server + MCP + the `/revitify` skill + install.**
8. **Multimodal (opt-in, key-gated): LLM doc/PDF/image extraction, whisper transcription, SCIP/DB/cargo.**

## Verify at the very end
- `pnpm build && pnpm test` green; the output-contract test green.
- In `~/Github/llm-dev-kit`: `pnpm build && node dist/cli/index.js graph build` still fuses revitify's
  nodes (Rivet's consumption unbroken) — run it and confirm a green graph.
- `revitify ~/Github/revitify` graphs ITSELF; open `graphify-out/graph.html`; GRAPH_REPORT.md shows
  god-nodes + suggested questions; code-only run used NO network/API key.
- `.track` updated if you re-synced upstream; README feature list matches what actually ships
  (tooling honesty — mark partial features partial).

## Out of scope / honesty
- Don't claim a feature works until a test proves it on a fixture. Mark partial parity as partial in
  the README — never imply graphify-complete before it is.
- Keep the core dependency-light; never make `import { revitify }` pull in whisper or an LLM SDK.
