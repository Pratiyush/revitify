# Revitify — Modular Graphify-Parity Plan

> Companion to [FEATURE-PARITY-PROMPT.md](../FEATURE-PARITY-PROMPT.md). That file is the mandate;
> this is the approved execution plan (decisions locked 2026-06-12). Work one phase at a time,
> tick the gate checkbox only when every gate condition is green, then stop and show the gate.

## Phase checklist

- [x] **Phase 0** — Parity baseline (graphify in isolated venv, run on a copy of llm-dev-kit) +
      `scripts/compare-parity.mjs` + `PARITY.md` + QA scaffold (Biome, knip, dependency-cruiser,
      strict tsc, coverage, CI) + `rivet init` and first spec — gate passed 2026-06-12
      (PARITY: 2/6 bands at baseline, gaps mapped to phases; check chain green)
- [x] **Phase 1a** — Modularize: pure move into `src/{model,extract,ingest,passes,enrich,export}/`,
      graph.json byte-identical on the committed fixture; contract tests (runtime + type-level)
      — gate passed 2026-06-12 (byte-identical on fixture AND the 492-node corpus; 27 tests;
      layer matrix live with 0 violations)
- [ ] **Phase 1b** — Behavior fixes: confidence-tagged reference resolution (AMBIGUOUS/INFERRED/
      EXTRACTED), dangling-import resolution against the walked-file set
- [ ] **Phase 2** — Multi-language: web-tree-sitter + tree-sitter-wasms (optional, lazy),
      detect.ts, sha256+stat cache, worker-pool parallel, `buildGraphAsync`/`revitifyAsync`
- [ ] **Phase 3** — Three-pass intelligence: symbol resolution, minhash dedup, Louvain+Leiden-
      refinement clustering with re-splits (zero new deps)
- [ ] **Phase 4** — Report parity: god-nodes, surprise scoring, suggested questions (betweenness),
      confidence summary, why-nodes (NOTE/WHY/HACK + docstrings)
- [ ] **Phase 5** — Queries + exports: query/path/explain/communities/cohesion/affected, JSONL
      query log; callflow-html, tree-html, wiki, mermaid exporters
- [ ] **Phase 6** — CLI (`bin`), watch (chokidar, lazy), global multi-repo graph, PR impact
- [ ] **Phase 7** — HTTP serve + MCP server (query_graph et al.), validate/diagnose, /revitify
      skill + install
- [ ] **Phase 8** — Multimodal (opt-in, key-gated): fetch-based LLM backends, whisper.cpp CLI,
      SCIP, SQL, cargo

## Context

Revitify (`~/Github/revitify`, 4 files, ~440 lines, dep: `typescript` only) is a native TS
code-knowledge-graph engine consumed by Rivet (`~/Github/llm-dev-kit`) via `link:` —
`refreshCodeGraphVia` calls `revitify(projectDir, outDir)` in-process and `loadCodeGraph` reads
`graphify-out/graph.json`: `nodes[].{id,name,label,source_file,source_location,community}`,
`links[].{source,target,relation}`, `built_at_commit`. FEATURE-PARITY-PROMPT.md mandates evolving it
into a modular, feature-parity copy of graphify (Python reference pinned @ 0.8.38 in `.track`, at
`~/Github/llm-dev-kit/_ref/reference/graphify`), phase by phase, test-first, without ever breaking
the Rivet contract, fully offline for code-only runs.

### Empirical comparison snapshot (llm-dev-kit corpus, measured 2026-06-12)

| Metric | revitify (today) | graphify py (Jun 11 run) |
|---|---|---|
| nodes / links | 492 / 1101 | graph.json overwritten — unknown |
| node kinds | 8 (function 219, file 125, interface 71, doc 33, type 14, const 12, method 11, class 7) | richer (per-language kinds, why-nodes) |
| relations | 3 (references 430, contains 367, imports 304) | many (calls, inherits, why, …) |
| communities | 6 (directory-based) | **37 (Leiden)** — from `.graphify_labels.json` |
| files indexed | 125 file nodes | 107 (manifest.json) |
| confidence tags / dedup / surprise | none | yes |

Python graphify is **not installed**; its leftover `manifest.json` + AST cache + labels survive. A
fresh baseline run is Phase 0. Revitify self-graph: 27 nodes / 36 links.

### Decisions (locked)
- **Baseline**: install graphify in an isolated venv (`uv tool install graphifyy`), run offline on a
  **copy** of llm-dev-kit (never clobber the live graphify-out/), commit `PARITY.md` + a reusable
  compare script in revitify.
- **QA toolchain**: Biome (lint+format) + knip + **dependency-cruiser (enforced layer boundaries)** +
  strict tsc + vitest coverage + GitHub Actions CI — all devDeps. The boundary enforcement is the
  "measurably more modular than graphify" claim (graphify has none).
- **Workflow**: dogfood Rivet — `.rivet/specs/*.md` with `REQUIREMENT_<AREA>-NN` Gherkin criteria
  (≥1 negative scenario each), spec → failing test (`--expect-red`) → green → `rivet verify`.
- **Rivet stays untouched**: no llm-dev-kit changes now. `revitifyAsync` migration for Rivet is a
  recorded follow-up. Sync `revitify()`/`buildGraph()` frozen forever.
- **Regex extractors kept** as graceful fallback when tree-sitter grammars are missing/fail.
- **Parity bar = structural bands**: counts/kinds/relations within ±30%, community count in band vs
  the 37 baseline, god-node top-5 overlap ≥3, contract fields exact. Not bit-identical.
- **Output layout**: `graphify-out/` belongs to Python graphify; revitify's **default outDir flips
  to `revitify-out/`** so both graphs coexist in one corpus for direct diffing. Rivet is unaffected:
  it passes `outDir: "graphify-out"` explicitly in `refreshCodeGraphVia` (llm-dev-kit
  src/engine/graphify/index.ts:161-170), and that call shape stays supported forever. Both dirs
  gitignored.
- **Commit authorship**: commits are authored by Pratiyush only — no AI co-author trailers.

## Hard invariants (every phase gate re-checks)
1. The contract shape is sacred: `{graph.json, graph.html, GRAPH_REPORT.md}` with the exact
   node/link/`built_at_commit` field names above; additive fields only. Rivet's `graphify-out/` path
   keeps working because Rivet passes that outDir explicitly; revitify's own default is
   `revitify-out/` (decision above). Contract test must fail loudly on drift, on both call shapes.
2. `revitify(rootDir)` / `buildGraph(rootDir)` signatures unchanged (sync, same returns).
3. Code-only = fully offline, zero keys. 4. FOSS only. 5. Core runtime dep stays `typescript` only;
   heavy deps behind lazy dynamic-import thunks. 6. `.track` pin discipline + MIT attribution.

## Phase 0 — Baseline + QA scaffold
- `uv tool install graphifyy` (isolated); copy llm-dev-kit (minus graphify-out) to a temp corpus
  dir; there, Python graphify writes `graphify-out/graph.json` (offline `graphify update .`) and
  revitify writes `revitify-out/graph.json` — side by side, directly diffable.
- Flip revitify's default outDir to `revitify-out` (additive: `revitify(dir, "graphify-out")` keeps
  working and is what Rivet calls); gitignore `revitify-out/`.
- `scripts/compare-parity.mjs`: reads `graphify-out/graph.json` vs `revitify-out/graph.json` →
  table of nodes/links/kinds/relations/community count/top god-nodes + band pass/fail →
  regenerates `PARITY.md`. Re-run at every gate.
- QA scaffold: `biome.json`, `knip.json`, `.dependency-cruiser.cjs` (matrix below), strict
  `tsconfig`, vitest coverage thresholds, `.github/workflows/ci.yml` (build, test, lint, knip,
  depcruise, `--no-optional` matrix job), `pnpm check` aggregator script.
- `rivet init --platforms typescript`; first spec: `.rivet/specs/contract.md`.
- Gate: PARITY.md committed with real numbers; CI green locally; existing tests untouched and green.

## Phase 1 — Modularize (two commits)

**1a — pure move, graph.json byte-identical on the fixture** (proved by comparing against a
committed `expected-graph.json`, `built_at_commit` excluded). **1b — small behavior fixes** (below).

Target tree (move map from current 4 files):
```
src/index.ts                 # frozen facade: revitify, buildGraph, renderReport, walkFiles re-export
src/model/{graph,confidence,fragment,contract,index}.ts
  # graph.ts ← types.ts verbatim; confidence.ts: const-object EXTRACTED|INFERRED|AMBIGUOUS;
  # fragment.ts: FileRef/SourceFile/GraphFragment; contract.ts: assertGraphContract() zero-dep
  # `asserts value is RevitifyGraph` naming first offending index+field (later backs `validate` verb)
src/extract/{extractor,registry,typescript,python,java,index}.ts
  # typescript.ts ← ingest.ts:90-164 (ingestTs+normalizeImport); python/java ← ingestLines split
src/ingest/{ingestor,walk,code,markdown,index}.ts        # walk.ts ← walkFiles+DEFAULT_EXCLUDES
src/passes/{pipeline,resolve,cluster,git}.ts
  # pipeline.ts ← ingest():196-227 orchestration; resolve.ts ← name-ref resolution 211-225;
  # cluster.ts ← communityOf (dir-based; Leiden swaps in behind same assignCommunities() signature)
src/enrich/report-data.ts                                # degree/hub calc ← index.ts:27-39
src/export/{exporter,json,html,report,index}.ts          # html.ts moved unchanged; json = exact bytes
test/fixtures/contract/      # committed fixture (auth.ts, crypto.ts, indicators.py, README.md)
test/contract.test.ts        # loud contract test;  test/contract.test-d.ts  # type-level pin
```
`query/ cache/ serve/ cli/` are created in their own phases (knip flags empty dirs).

Key interfaces:
- `Extractor { id; languages; detect(FileRef): boolean; extract(SourceFile, ctx): GraphFragment }`
- `Ingestor { id; mode: "offline"|"key-gated"|"local-tool"; available(env); ingest(); ingestSync? }`
- `Exporter { id; filename; render(graph, ctx): string }`
- One generic `Registry<T>` with `Registration<T>{ id; extensions?; detect?; load(): Promise<T>;
  loadSync?(): T }` — dispatch = ordered-array match (no switch edits to add a language); laziness =
  `load: () => import("./treesitter/python.js")` thunks; **no side-effect self-registration** (keeps
  tree-shaking and import order safe). Default arrays are plain data in each layer's `index.ts`.
- Sync facade rule: `buildGraph`/`revitify` use `loadSync`/`ingestSync` only (today's capability);
  `buildGraphAsync`/`revitifyAsync` arrive Phase 2 as the full-power additive API.

Contract test (fails loudly): exact `Object.keys(...).sort()` assertion on a canonical node+link;
`toMatchInlineSnapshot`; whole-graph `assertGraphContract`; 3-artifact existence + self-contained
html — asserted for both call shapes (default → `revitify-out/`; Rivet's
`revitify(dir, "graphify-out")` → `graphify-out/`); type-level
`expectTypeOf<RevitifyGraph>().toMatchTypeOf<RivetGraph>()` where `RivetGraph` is
copied verbatim from Rivet's reader (comment pointing at llm-dev-kit/src/engine/graphify/index.ts).
Do **not** touch package.json `types`/`main`/add `exports` map in Phase 1 (protects Rivet's `link:`).

**1b behavior fixes** (additive, contract-safe; re-baseline PARITY snapshot after):
- Ambiguous name resolution (`candidates[0]` today): deterministic pick (same-dir first) +
  `confidence: "AMBIGUOUS"`; unique match ⇒ `INFERRED`; structural contains/imports ⇒ `EXTRACTED`.
- Dangling imports: resolve import specs against the walked-file set (as-written, then ext swaps,
  then `/index.*`); drop unresolvable `file:` link targets (today they're emitted unchecked).

Gate: build+tests+check green; byte-identical proof (1a); Rivet smoke: `pnpm build && node
dist/cli/index.js graph build` in llm-dev-kit (read-only use of revitify via link:).

## dependency-cruiser layer matrix (enforced in CI)
may-import →: model | extract→model | ingest→model,extract | cache→model |
passes→model,extract,ingest,cache | query→model | enrich→model,query | export→model,enrich,query |
serve→model,passes,enrich,query,export,cache | cli→everything | index.ts→model,ingest,passes,enrich,export.
Global: no-circular, no-orphans; `model` may not import `node:*`; `extract/treesitter/**`,
`serve/mcp*`, `ingest/llm/**` reachable **only** via `dynamic-import` edges (mechanical lazy-boundary
enforcement); src may never import test.

## Phases 2–8 (each: spec → failing test → implement → gate → PARITY refresh → stop & show)

- **P2 multi-language**: `web-tree-sitter` + `tree-sitter-wasms` (prebuilt grammars,
  **optionalDependency**, pinned as a pair); `extract/detect.ts` (ext map + shebang, port detect.py);
  data-driven `LanguageConfig` per language (TS+Python+Go+Rust first); regex fallback on load
  failure. `cache/`: sha256(content+relPath) fragments in `<root>/.revitify/cache/` + mtime
  stat-index fastpath (port cache.py). Parallel via `node:worker_threads`,
  `os.availableParallelism()`, in-process <50 files. Gate: mixed-language fixture; cache-hit counter
  on 2nd run; child-process lazy test proves `import { revitify }` loads no tree-sitter.
- **P3 three-pass intelligence** (zero new deps): port symbol_resolution.py (label index, same-file >
  same-dir > unique-global, confidence tagging, (source,target,relation) dedup); minhash TS port
  (num_perm=128, 2^61−1 Mersenne hash via BigInt, sha1, 3-gram shingles, LSH threshold 0.7,
  Jaro-Winkler 0.92 confirm); clustering = original Louvain + Leiden refinement (seed 42, stable
  ordering — graphify's own fallback is Louvain) + ported re-splits (size >25%/min 10; cohesion
  <0.05/min 50) behind `assignCommunities()`. Gate: cluster/dedup/AMBIGUOUS fixtures; determinism
  (run twice); community count vs 37-baseline band.
- **P4 report parity**: port analyze.py god-nodes (with exclusions), surprise score (confidence
  bonus +2 cross-file +2 cross-community +1 peripheral→hub, constants from analyze.py:194-265),
  suggested questions (Brandes betweenness in query/centrality.ts), confidence summary; why-nodes
  (NOTE:/WHY:/HACK: + docstrings) in extractors using graphify's exact relation names. Gate: report
  sections + a fixture `// WHY:` comment becomes a linked node.
- **P5 queries+exports** (zero deps): query/{graph,traverse,path,explain,communities,affected,
  querylog(.revitify/query-log.jsonl)}; explain ports serve.py's idf/scoring so P7 reuses it.
  export/{callflow-html,tree-html,wiki,mermaid} as registered Exporters. Gate: one fixture test per
  verb, upstream module noted per .track discipline.
- **P6 CLI/watch/global/PR**: `node:util` parseArgs dispatcher (~50 lines), verbs lazy via
  `await import`; `bin` added to package.json (first export-surface change — re-verify Rivet link:);
  chokidar v4 (dep, but loaded only by watch verb); global graph merge with `repo:` prefixes; prs =
  `git diff --name-only` → affected closure → impact md. Gate: spawnSync smoke per verb; watch test.
- **P7 serve+MCP+skill**: bare `node:http` (graph.html + /api/* reusing query/, mtime reload,
  path-traversal guard from security.py); `@modelcontextprotocol/sdk` dynamic-import-only, stdio,
  tools: query_graph, get_node, get_neighbors, get_community, god_nodes, graph_stats, shortest_path
  (each → JSONL log); validate/diagnose verbs reuse model/contract.ts; skills/revitify/SKILL.md +
  `install --claude-code`. Gate: InMemoryTransport MCP test; HTTP smoke; lazy test extended to SDK.
- **P8 multimodal (opt-in)**: NO LLM SDKs — native fetch backends (autodetect ANTHROPIC_API_KEY →
  GEMINI → OPENAI → Ollama probe, mirroring llm.py); PDFs/images as base64 to backend; whisper.cpp
  CLI detection (+ffmpeg) for audio/video; SCIP via `scip print --json`; SQL DDL parse + optional
  psql; cargo metadata JSON. All as Ingestors with honest `available()`; missing key/tool ⇒ skip with
  notice, code graph byte-identical. Gate: no-keys run identical to P7 output; mocked-fetch
  autodetect-order test.

## Top risks
1. tree-sitter WASM in Node ESM/pnpm-link — pin pair, `createRequire().resolve` for .wasm, CI smoke
   loads every grammar, regex fallback (never fatal).
2. Leiden fidelity — structural-band judging (locked), seed+stable order determinism, exact re-split
   constants; reference's own fallback is Louvain.
3. Contract drift — triple lock (runtime validator, exact-keys+snapshot, type-level pin) + Rivet
   smoke at every gate; additive-only fields.
4. Perf at scale — LSH prefilter, betweenness sampling >5k nodes, worker pool + cache; benchmark
   script with budgets (llm-dev-kit cold <10s, warm <1.5s) in PARITY.md from P2.
5. Optional-dep install failures — `--no-optional` CI job must stay green; `diagnose` lists loadable
   grammars.

## Deferred (recorded, not planned now)
- Rivet migration to `revitifyAsync` ("add the learning later"); npm publish/exports map;
  graph.html renderer overhaul; configurable excludes (arrives with buildGraphAsync options, P2).

## Verification (end-to-end)
- Every gate: `pnpm build && pnpm test` + `pnpm check` (lint/knip/depcruise/coverage) green;
  contract test green; `node scripts/compare-parity.mjs` bands pass; in llm-dev-kit:
  `pnpm build && node dist/cli/index.js graph build` green (Rivet unmodified).
- Final: `revitify ~/Github/revitify` self-graph; GRAPH_REPORT.md shows god-nodes + questions;
  code-only run offline (assert no network); README parity table marks partial features partial;
  `.track` updated only on re-sync.
