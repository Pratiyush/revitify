---
name: revitify
description: Query this project's code knowledge graph (built by revitify — graphify's output contract, native TypeScript). Use when the user asks how code hangs together, what breaks if something changes, where a concept lives, or wants the graph rebuilt/visualized.
---

# Revitify — code knowledge graph

The project graph lives in `revitify-out/` (`graph.json` · `graph.html` · `GRAPH_REPORT.md`).
Build or refresh it with `npx revitify build` (or `node node_modules/revitify/dist/cli/main.js build`).

## Answering questions with the graph

- **Where does X live / what is X?** → `revitify query <terms>` (idf-ranked), then
  `revitify explain <terms>` for a narrated subgraph with neighbors.
- **What breaks if X changes?** → `revitify affected <label-or-id>` — the transitive blast
  radius over imports/calls/references.
- **How do A and B connect?** → `revitify path <from> <to>`.
- **What are the modules really?** → `revitify communities` (size + cohesion), and read the
  god-nodes + surprising-connections sections of `revitify-out/GRAPH_REPORT.md`.
- **Visuals** → `revitify export` writes callflow.html, graph-lite.html, tree.html, WIKI.md, graph.mmd; open
  `revitify-out/graph.html` for the interactive map.

## Live serving

- `revitify serve` → http://127.0.0.1:7077 with /api/{query,explain,node,neighbors,path,communities,stats}.
- `revitify mcp` → stdio MCP server exposing query_graph, get_node, get_neighbors,
  get_community, god_nodes, graph_stats, shortest_path.

## Tips

- Edges carry `confidence`: EXTRACTED (AST-certain) > INFERRED (unique resolution) >
  AMBIGUOUS (tied candidates — treat as a hint). The report's Confidence section is the ledger.
- `revitify watch` keeps the graph fresh while editing; `revitify validate` checks the
  contract; `revitify diagnose` checks grammars/cache.
