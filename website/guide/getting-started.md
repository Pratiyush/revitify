# Getting started

A complete tour: install, build your first graph, open the viewer, ask the graph questions, serve it
over HTTP/MCP, and use it as a library. About ten minutes end to end.

## Install

::: code-group
```sh [npx (no install)]
npx revitify build .
```
```sh [project dependency]
pnpm add -D revitify
# or: npm i -D revitify
```
```sh [global CLI]
pnpm add -g revitify
```
:::

Revitify needs **Node 20+**. The code-only path needs no API keys and no network. The tree-sitter
grammars (for non-TS languages) are optional dependencies installed automatically; if your registry
blocks them, revitify degrades gracefully (see [Languages](./languages#graceful-degradation)).

## 1. Build the graph

From the root of any repo:

```sh
revitify build .
```

```
revitify: 426 nodes, 1183 links in 286ms (cache: 0 hits, 125 misses)
→ /your/repo/revitify-out/graph.json
```

This writes `revitify-out/`:

| File | What it is |
|---|---|
| `graph.json` | every node + link — the data your tools consume |
| `graph.html` | a **self-contained** interactive viewer (no network needed) |
| `GRAPH_REPORT.md` | god nodes, surprising connections, a confidence ledger, suggested questions |

Run it again and watch the cache work — the second build re-reads only what changed.

## 2. Open the viewer

```sh
open revitify-out/graph.html      # macOS — or just double-click it
```

The viewer is a full Cytoscape graph with a legend-as-filter sidebar, fuzzy search (`/`), four views
(Graph / Focus / List / Hubs), a node detail panel, and live physics (`M`). It's one self-contained
HTML file — all libraries inlined — so it works offline and can be emailed or embedded in an iframe.
It's mobile-friendly and opens in light mode.

## 3. Read the report

`GRAPH_REPORT.md` is the one-glance summary:

- **God nodes** — the most-connected symbols (your load-bearing walls).
- **Surprising connections** — edges that cross community boundaries unexpectedly, scored by how
  unexpected they are.
- **Confidence** — how much of the graph is `EXTRACTED` vs `INFERRED` vs `AMBIGUOUS`.
- **Suggested questions** — starting points seeded from graph centrality.

## 4. Ask the graph questions

These all work against `revitify-out/graph.json` (building it first if needed):

```sh
revitify query "auth"                 # idf-ranked search across labels, paths, kinds
revitify explain "auth service"       # the top matches, narrated with their neighbors
revitify path AuthService hash        # shortest path between two symbols
revitify affected AuthService         # transitive blast radius — what breaks if this changes
revitify communities                  # the detected clusters, with cohesion scores
```

`query`, `path`, and `affected` accept either a node id (`sym:src/auth.ts#login`) or a bare label
(`login`). Every query is appended to `.revitify/query-log.jsonl` for an audit trail.

## 5. Keep it fresh while you work

```sh
revitify watch .
```

Rebuilds incrementally on every save (cache-backed, so it's fast). Leave it running in a terminal
while you code and the graph — and any served view — stays current.

## 6. Serve it

```sh
revitify serve                 # http://127.0.0.1:7077 — the viewer + a JSON API
```

The HTTP server (localhost-only) serves the viewer at `/` and a JSON API:

```sh
curl 'http://127.0.0.1:7077/api/query?q=auth'
curl 'http://127.0.0.1:7077/api/affected?id=sym:src/auth.ts%23AuthService'  # %23 = #
curl 'http://127.0.0.1:7077/api/stats'
```

Routes: `/api/{query,explain,node,neighbors,path,communities,stats}`. It reloads automatically when
`graph.json` changes — pair it with `revitify watch`.

## 7. Give it to an AI assistant (MCP)

```sh
revitify mcp                   # a stdio MCP server
```

Exposes seven tools — `query_graph`, `get_node`, `get_neighbors`, `get_community`, `god_nodes`,
`graph_stats`, `shortest_path` — so an assistant can interrogate your codebase's structure directly.
`revitify install` drops a `/revitify` skill into `.claude/skills/` that teaches the assistant how
to use them.

## Use it as a library

```ts
import { revitify, buildGraphAsync } from "revitify";

// Synchronous, lean, TypeScript/JS at full depth (the frozen, always-available API):
const result = revitify(process.cwd());           // → writes revitify-out/, returns counts

// The full engine — all 12 languages via tree-sitter, cache, worker parallelism:
const graph = await buildGraphAsync(process.cwd());
for (const node of graph.nodes) {
  if (node.kind === "class") console.log(node.label, node.source_location);
}
```

`import { revitify }` never pulls in tree-sitter, the MCP SDK, or any LLM backend — those load only
when you reach for them. See [Architecture](./architecture) for why that matters and how it's
enforced.

## Next

- [How nodes work](./concepts) — the node/link/confidence model in full.
- [Languages](./languages) — Java and the other eleven, what each extracts.
- [CLI & queries](./cli) — every verb and flag.
- [Architecture](./architecture) — the design under the hood.
