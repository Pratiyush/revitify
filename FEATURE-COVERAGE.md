# Feature coverage — revitify vs graphify 0.8.38 (module by module)

> The closing audit FEATURE-PARITY-PROMPT.md asked for: every graphify module vs where (and how
> deeply) revitify covers it, plus dry-run differences on real corpora. Verified 2026-06-12
> against graphify 0.8.37 (PyPI; `.track` pins 0.8.38) running side by side on two corpora.
> Statuses: ✅ ported · 🟡 partial (honest gaps listed) · ⏳ not ported (and why).

## Pass 1 — extraction

| graphify module | status | revitify home | notes |
|---|---|---|---|
| extract.py (TS/JS) | ✅ | extract/typescript.ts | compiler API: symbols, members, imports, calls, why-comments |
| extract.py (Python/Java/Go/Rust) | ✅ | extract/treesitter/* | official grammar wasm, lazy; **Java deeper than upstream: constructors, fields, enum constants, records, nested types** |
| extract.py (Ruby/C/C++/C#/Kotlin/Swift/PHP/Scala/Bash…) | ⏳ | — | LanguageConfig pattern makes each ≈30 lines + grammar dep; add on demand |
| detect.py | 🟡 | model/languages.ts | extension map; shebang sniffing not yet |
| "why" nodes (NOTE/WHY/HACK + docstrings) | ✅ | extract/fragment-builder.ts | relation `explains` (upstream: `rationale_for`); python docstrings → `documents` |
| ingest.py (markdown) | ✅ | ingest/markdown.ts | h1/h2 headings, fence-aware |
| cache.py | ✅ | cache/ast.ts | sha256 content keys + stat-index fastpath; honest whole-set invalidation |
| parallel extraction | ✅ | passes/worker-pool.ts | worker_threads ≥50 files; byte-identical to sequential |

## Pass 2 — inference

| graphify module | status | revitify home | notes |
|---|---|---|---|
| symbol_resolution.py | ✅ | passes/resolve.ts | tiers same-file→same-dir→global; EXTRACTED/INFERRED/AMBIGUOUS on every edge |
| dedup.py + _minhash.py | ✅ | passes/dedup/* | 128 perms, 2⁶¹-1, 3-grams, 16×8 LSH (~0.7), Jaro-Winkler 0.92; doc nodes only — code symbols never merge |
| semantic_cleanup.py | 🟡 | passes/dedup/index.ts | label-level cleanup; LLM-side semantic merge is out of core scope |

## Pass 3 — clustering

| graphify module | status | revitify home | notes |
|---|---|---|---|
| cluster.py | ✅ | passes/cluster.ts | Louvain + Leiden connectivity refinement; re-splits >25%/min-10 and cohesion<0.05/min-50; deterministic without RNG |

## Report intelligence

| graphify module | status | revitify home | notes |
|---|---|---|---|
| analyze.py god_nodes | ✅ | enrich/god-nodes.ts | symbols only (file/doc excluded, mirroring upstream) |
| analyze.py surprise | ✅ | enrich/surprise.ts | +2 cross-file/+2 cross-community/+1 peripheral→hub/+1 cross-language/+1 inferred |
| report.py | ✅ | export/report.ts | god nodes, surprises with reasons, confidence ledger, why-nodes, ≥4 questions |
| suggested questions | ✅ | enrich/questions.ts | Brandes betweenness seeds (stride-sampled >500) |

## Queries & exports

| graphify | status | revitify | notes |
|---|---|---|---|
| query/path/explain/communities/cohesion/affected | ✅ | query/* + cli verbs | explain ports serve.py's idf scoring |
| querylog.py | ✅ | query/querylog.ts | JSONL, never breaks a query |
| export.py / callflow_html.py / tree_html.py / wiki.py | ✅ | export/* | + mermaid; `revitify export` |
| graph.html | ✅ | export/html.ts | self-contained canvas viewer (pre-dates parity work) |

## Scale, server, integration

| graphify | status | revitify | notes |
|---|---|---|---|
| watch.py | ✅ | cli/verbs/watch.ts | chokidar, debounced, cache-backed |
| global_graph.py | ✅ | cli/verbs/global.ts | repo:-prefixed merge |
| prs.py | ✅ | cli/verbs/prs.ts | git diff → blast radius |
| serve.py HTTP | ✅ | serve/http.ts | viewer + 7 API routes; artifact-allowlist traversal guard (security.py) |
| serve.py MCP | ✅ | serve/mcp.ts | the 7 tools incl. query_graph; stdio; InMemoryTransport-tested |
| validate.py / diagnostics.py | ✅ | cli/verbs/{validate,diagnose}.ts | contract validator; grammar/cache self-check |
| install.py + skill | ✅ | cli/verbs/install.ts + skills/revitify | Claude Code target; other assistants later |
| hooks.py / manifest.py | ⏳ | — | git-hook automation + manifest bookkeeping; cache/stat-index covers the freshness need |

## Multimodal (opt-in, key-gated)

| graphify | status | revitify | notes |
|---|---|---|---|
| llm.py backends | ✅ | ingest/llm/backends.ts | fetch-only (no SDKs); Anthropic→Gemini→OpenAI→Ollama |
| docs/PDF/image semantic extraction | 🟡 | ingest/llm/docs.ts | concept nodes via backend; no local PDF text extraction (upstream sends content; we send the path context) |
| transcribe.py | 🟡 | ingest/tools/local.ts | whisper.cpp CLI detection + transcript nodes; no python-whisper |
| scip_ingest.py | 🟡 | ingest/tools/local.ts | via `scip print --json` CLI |
| SQL/Postgres | 🟡 | ingest/tools/sql.ts | offline DDL parsing (tables/columns/REFERENCES); no live psql introspection |
| cargo | 🟡 | ingest/tools/cargo.ts | Cargo.toml parse; no `cargo metadata` enrichment |
| mcp_ingest.py / Google Workspace | ⏳ | — | niche upstream surface; revisit on demand |

## Dry-run differences (both tools, same corpora, offline)

**Corpus A — llm-dev-kit copy** (TS-heavy, 157 files): revitify 490 nodes/1455 links/34
communities vs graphify 893/1788/65. Bands: link count ✅ (81%), god-node top-5 overlap ✅ (4/5),
contract ✅; node count ❌ (55% — graphify nodes more file types and referenced types),
relation types ❌ (4 vs 7), communities ❌ (34 vs 65, tracks the node gap).

**Corpus B — multi-language shop sample** (Java/Python/Go/Rust/TS/SQL/Cargo, 11 files):
**revitify 63 nodes vs graphify 45 — revitify extracts more**, 7 relation types each, 4/6 bands ✅.
Java head-to-head: both find classes/constructors/methods; **only revitify finds fields
(stock/capacity/inventory), enum constants, the record, and all 3 why-comments**; only graphify
emits referenced-type nodes (`String`).

**Vocabulary differences (cosmetic, documented):** graphify labels callables `.name()` and files
by basename; uses relations `method` (we fold into `contains`), `imports_from`, `re_exports`,
`rationale_for` (ours: `explains`). Rivet's reader treats relations as opaque — both vocabularies
flow through unchanged.

**Where revitify exceeds upstream:** enforced layer boundaries (dependency-cruiser, CI-fatal),
confidence on every edge from day one, Java member depth, offline SQL/cargo ingestion in the
core, lazy-boundary proofs, byte-stable deterministic builds (no RNG anywhere).
