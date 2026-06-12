# Revitify

Native TypeScript code-knowledge-graph engine — a modular, test-first port of
[graphify](https://github.com/safishamsi/graphify)'s feature set with its exact output contract:

```
revitify-out/
├── graph.json       nodes + links (id/label/source_file/community · source/target/relation/confidence)
├── graph.html       self-contained interactive viewer (canvas force layout, search, filters)
└── GRAPH_REPORT.md  god nodes, surprising connections, confidence ledger, why-nodes, questions
```

`revitify-out/` is the default so a Python-graphify run (`graphify-out/`) can sit alongside it for
direct comparison (see `PARITY.md` + `FEATURE-COVERAGE.md`). Rivet passes `outDir: "graphify-out"`
explicitly — both call shapes are contract-tested.

## What ships (verified, per-feature tests; honesty map in FEATURE-COVERAGE.md)

- **Extraction** — TS/JS via the compiler API; Python/Java/Go/Rust/Ruby/C/C++/C#/Bash/PHP/Scala/Kotlin via lazy tree-sitter WASM
  (official grammar packages, `optionalDependencies`; regex fallback if absent). Java goes deep:
  classes, interfaces, enums + constants, records, **constructors, methods, fields**, nested
  types. NOTE:/WHY:/HACK: comments and Python docstrings become linked why-nodes. Offline SQL DDL
  (tables/columns/REFERENCES) and Cargo.toml (crate/depends_on) ingestion.
- **Intelligence** — symbol→symbol `calls` edges; tiered resolution (same-file → same-dir →
  global) tagging every edge EXTRACTED/INFERRED/AMBIGUOUS; minhash+Jaro-Winkler doc dedup;
  Louvain+Leiden-refinement communities with graphify's re-split constants — all deterministic.
- **Report** — god nodes (symbols only), surprise-scored cross-cutting connections, confidence
  summary, betweenness-seeded questions.
- **Queries** — `query/explain/path/affected/communities` (+ JSONL query log), `export`
  (callflow.html, tree.html, WIKI.md, graph.mmd), `watch`, `global`, `prs`, `validate`, `diagnose`.
- **Serve** — HTTP viewer + JSON API; **MCP server** (`revitify mcp`) with query_graph, get_node,
  get_neighbors, get_community, god_nodes, graph_stats, shortest_path. `revitify install` drops
  the `/revitify` skill into `.claude/skills/`.
- **Multimodal (opt-in, key-gated)** — LLM doc/image concepts via fetch-only backends
  (Anthropic → Gemini → OpenAI → Ollama autodetect; no SDKs); whisper.cpp/scip via local CLI
  detection. **No key, no tool → identical code graph, zero network — tested.**

## Use

```ts
import { revitify, buildGraphAsync } from "revitify";
revitify(process.cwd());                  // sync classic — what Rivet calls (frozen forever)
await buildGraphAsync(process.cwd());     // full engine: tree-sitter, cache, workers
```

```sh
revitify build         # graph + artifacts (cached: ~15ms warm on a 157-file repo)
revitify query auth    # then: explain · path · affected · communities · export · serve · mcp
```

- Zero Python; core runtime dep is `typescript` only — heavy pieces load lazily and
  `import { revitify }` provably never touches them (child-process hook test).
- Quality gates: Biome, knip, dependency-cruiser **enforced layer matrix**, strict tsc, coverage
  ratchet, 105 tests incl. byte-stability and contract pins. Consumed by Rivet as the default
  `graphify.provider`.
- Concepts adapted from graphify (MIT, YC S26); original implementation. Upstream pin: `.track`.
