# Revitify

Rivet's native TypeScript code-knowledge-graph engine — turn a folder of code + docs into a
queryable knowledge graph with **graphify's exact output contract**:

```
revitify-out/
├── graph.json       nodes + links (id/label/source_file/community · source/target/relation)
├── graph.html       self-contained interactive viewer (canvas force layout, search, filters)
└── GRAPH_REPORT.md  highlights: kind counts, most-connected hubs, suggested questions
```

`revitify-out/` is the default so a Python-graphify run (`graphify-out/`) can sit alongside it for
direct comparison (see `PARITY.md`). Rivet passes `outDir: "graphify-out"` explicitly — both call
shapes are covered by the contract test.

- TS/JS via the TypeScript compiler API; Python/Java best-effort grammars; markdown headings.
- Zero Python, zero pip — `revitify(rootDir)` is one in-process call.
- Consumed by [Rivet](../llm-dev-kit) as the default `graphify.provider`.
- Concepts adapted from [graphify](https://github.com/safishamsi/graphify) (MIT, YC S26);
  original implementation. Upstream sync pin lives in `.track`.

```ts
import { revitify } from "revitify";
revitify(process.cwd()); // → revitify-out/
```

Built for Claude Code first; other assistants later.
