# Revitify — 3-pass code review

> Three independent, adversarial review passes (correctness · design/maintainability ·
> performance/security/tests), each verified by executing the code against constructed inputs,
> not by inspection alone. Findings are prioritised P0 → P2 with effort (S/M/L) and the **depth
> needed**. Run 2026-06-13 against `main` @ the rivet-realign tip.

## Verdict

Unusually disciplined for its size. **No externally-exploitable bugs; the security primitives the
design leans on all hold under test** (path-traversal allowlist, the offline/key gate, the lazy
boundary — each verified empirically). The real leverage is in two structural refactors (P0) and a
cluster of small, high-value hardening items. One genuine data-correctness bug was found and is
fixed in this branch.

---

## P0 — fix or decide

| # | Finding | File | Fix | Effort |
|---|---|---|---|---|
| **C1** | **Python `from a.b import c` leaks the module-path tail as a phantom `name:b` reference** → fabricates `imports_from` edges. Root cause: `current === moduleNode` compares web-tree-sitter *wrapper objects* (always `!==` even for the same node). | `extract/treesitter/factory.ts` collectImport | `current.id === moduleNode?.id` (node identity). **✅ fixed + tested in this branch.** | S |
| **D1** | **Four extraction-orchestration paths** (`pipeline`, `pipeline-async`, `worker`, `worker-pool`) copy-paste the detect→read→ingest→merge loop, and the 8-line resolve→dedup→summarize→cluster→gitHead *tail* is duplicated **verbatim** between the two pipelines. The contract test pins byte-stable order, but nothing structurally keeps them in lockstep (and the worker path is excluded from coverage → most likely to rot). | `passes/pipeline.ts:39-48`, `pipeline-async.ts:84-93`, `worker.ts`, `worker-pool.ts` | Extract `finalizeGraph(refs, fragments)` + a shared `extractOne` (worker = `extractOne` minus cache, via a param). Collapses 4 bodies to walk + strategy + shared finalize. Also shrinks the dual-API "duplication." | M |
| **D2** | **Node-id scheme is hand-concatenated at ~14 sites with no source of truth** — 11+ prefixes (`sym:`/`file:`/`name:`/`why:`/`doc:`/`concept:`/`jsonkey:`/`crate:`/`transcript:`/`scip:`…), parsed with magic offsets (`id.slice(4,…)` = `"sym:".length`, uncommented). A malformed id is a silent off-by-one, not an error. This is the data-format coupling dependency-cruiser can't see. | builders in `extract/*`, `ingest/*`; parsers in `passes/resolve.ts` | Add `src/model/ids.ts` (`sym()/file()/name()/why()/relOf()/prefixOf()`), migrate. **The single best maintainability investment.** | L (mechanical) |
| **S1** | **Sync vs async pipelines return structurally different graphs for any non-TS/JS repo** — sync falls back to regex (top-level symbols only) or a bare file node; async runs full tree-sitter. *Documented as intentional*, but both are public frozen API, so callers get different answers. | `index.ts`, `code.ts`, `registry.ts` | Decide the contract: document loudly that sync = TS/JS-depth only, async = all languages; or make `buildGraph` skip rather than silently degrade tree-sitter-only files. | M |

---

## P1 — real friction / real cost

| # | Finding | File | Fix | Effort |
|---|---|---|---|---|
| **P1·perf** | **Brandes betweenness runs on *every* build** (report → suggested questions), with a fresh `Set`+spread allocated per node-visit and `queue.shift()` (O(n) shift) — GC pressure that dominates on a 50k-node graph. Correctly capped at 500 sources, so not O(V·E); the allocation is the cost. No size guard. | `query/centrality.ts`, `query/graph.ts:23` | Precompute `GraphIndex.adj` (undirected adjacency) **once** in the constructor (helps 5 callers); head-cursor instead of `shift()`; skip/downsample above ~20k nodes. | M |
| **P1·dup** | **HTTP and MCP servers reimplement the same 7-op query surface twice — and have already drifted** (search limit 10 vs 8; god-nodes 5 vs 10). | `serve/http.ts`, `serve/mcp.ts` | Extract `serve/handlers.ts` (protocol-agnostic `queryGraph/statsOf/pathBetween…` returning plain data); HTTP→JSON, MCP→`text()`. Centralise limits. | M |
| **P1·err** | `loadOrBuild` (+ an inline twin in `global.ts`) does un-guarded `JSON.parse`+assert → a corrupt `graph.json` surfaces as raw `SyntaxError` with no "delete revitify-out and rebuild" hint. | `cli/load.ts`, `cli/verbs/global.ts` | One `loadGraph()` with a `try/catch` rethrow naming the path + remedy; both callers reuse it. | S |
| **P1·api** | `ExportContext` is a **dead parameter** on all 8 exporters — none read it; both call sites build+discard `{rootDir,outDir}`. | `export/exporter.ts` + all exporters | Remove `ctx` (exporters are pure `graph → string`). | S |

---

## P2 — hardening & polish (an afternoon, high value)

**Perf (all S unless noted):** report rebuilds `GraphIndex` ~5× per render → thread one through (`enrich/*`); `explain()` does O(E) `links.find()` per neighbor → use `index.out`/`in` (also it's on `/api/explain`); `minhash.signature()` has no label-length cap → truncate to 512; Louvain re-split is the only uncapped algorithm (quadratic corner on one giant weak community) → cap or memoise `cohesion` (M).

**Security hardening (localhost-only, so hardening not exploit):** HTTP server has no method check and reflects `String(err)` (can leak a filesystem path) → reject non-GET, generic 500, cap param length; Ollama/`WHISPER_CPP` honor unvalidated env host/binary (SSRF-shaped, operator-controlled) → validate scheme; Gemini key rides the URL querystring (latent log-leak — upstream API constraint) → audit that no code logs request URLs.

**Maintainability (all S):** centralise HTML escaping (3 inline strategies across exporters) + the `<!doctype>` dark-theme boilerplate (dup'd twice); `html.ts` asset injection is unguarded → a missing viewer dep kills the *contract artifact* `graph.html`, so wrap in try/catch + emit a minimal stub; `querylog` swallows every error silently → one guarded breadcrumb; shared `cli/args.ts` (the `--out`/`--port` parsers have no bounds check → `--out` last = `undefined`); header comments on the hidden multi-verb dispatch (`query.ts`/`serve.ts` own 5 and 2 verbs); fix "9 exporters" (it's 8) and add `graph-lite` to the export help text.

**Minhash precision (S, P1-ish):** permutation coefficients are drawn via `rand() * Number(2^61-1)` — above `MAX_SAFE_INTEGER`, so 127/128 lose their low ~9 bits (multiples of 512). LSH still works and identical inputs still collide, but the Jaccard *estimate* on borderline pairs is noisier. Draw 61-bit BigInt coefficients directly.

**TS call recall (S):** `collectCalls` misses element-access calls (`obj["x"]()`) and tagged templates — widens the sync/async gap (S1).

---

## What's genuinely solid (verified, don't touch)

- **Louvain** modularity-gain is the exact Blondel-2008 form; **self-loops correctly survive aggregation** (the comment shows real understanding of the failure mode); deterministic with no RNG — communities identical under reversed link order.
- **Jaro-Winkler** matches canonical references exactly (MARTHA/MARHTA 0.9611, DWAYNE/DUANE 0.84).
- **LSH banding is genuinely O(items), not O(items²)** — the headline perf claim holds.
- **Path-traversal guard** is allowlist-by-construction (3 filenames), beaten against `../`, `%2f`, `//`, embedded `..` — all 404.
- **Offline gate** proven byte-identical to a code-only build with `fetch` asserted never called.
- **Lazy-boundary proof** uses a module-resolution hook with a *positive control* — a broken hook can't fake a pass. Best test in the suite.
- **`Registry<T>`**, the **dependency-cruiser layer enforcement**, **`GraphIndex`**, and **`assertGraphContract`** are the architectural standouts. The modularity claim is structurally real.
- **`spawnSync` of whisper/scip is argv-form** — file paths can't inject commands. Cargo/SQL parsing is bounded regex, no ReDoS.

## Depth-needed roadmap (recommended order)

1. ✅ **DONE.** **Quick hardening pass (½ day, all S):** P1·err, P1·api, the P2 perf trio (index reuse, explain, signature cap), HTTP method/error hardening, querylog breadcrumb, `cli/args.ts`. High value, low risk, no behavior change.
2. ✅ **DONE.** **D2 — `model/ids.ts` (mechanical L):** all 11 prefixes now have builders + parsers in one module; the magic offsets (`id.slice(4,…)`) are gone, replaced by `relOf`/`isSym`/`nameRefTarget`. Migrated all 12 construction/parse sites; output stayed byte-identical (contract test green). The id scheme is now discoverable in one place.
3. ← **NEXT. D1 — `finalizeGraph` + shared `extractOne` (M):** removes the verbatim pipeline dup and the worker-rot risk; also shrinks the dual-API duplication.
4. **P1·perf — `GraphIndex.adj` (M):** the one real scale fix; subsumes part of the explain/communities work.
5. **Decisions, not code:** S1 (sync/async contract wording), P2-6 (whole-graph-in-memory is the scale ceiling — name it; streaming output only if someone hits OOM), the incohesive-cluster branch + a large-graph fixture (the `COHESION_MIN=50` path is currently untested).
