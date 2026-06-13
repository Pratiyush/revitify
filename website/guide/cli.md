# CLI & queries

Every verb. The CLI dispatcher is lazy — each verb loads only what it needs, so `revitify --help` is
instant and `revitify build` never pays for the watch or server machinery.

```sh
revitify <verb> [args] [flags]
revitify --help
```

## Building

### `build` · `update`

```sh
revitify build [path] [--out <dir>]
```

Runs the full async engine (all languages, cache, worker parallelism) and writes the three artifacts
to `<path>/revitify-out/` (or `--out <dir>`). `update` is an alias. Prints node/link counts and cache
hit/miss.

### `watch`

```sh
revitify watch [path]
```

Rebuilds incrementally on file change (chokidar, debounced, cache-backed). Runs until interrupted.

## Querying

All query verbs load `revitify-out/graph.json`, building it first if absent. Targets accept a node id
**or** a bare label.

### `query`

```sh
revitify query <terms…>
```

idf-ranked search across node labels, source paths, and kinds. Prints score, label, kind, location.

### `explain`

```sh
revitify explain <terms…>
```

Like `query`, but narrates the top seeds together with their one-hop neighbors and the relations
connecting them — a quick "what is this and what's around it."

### `path`

```sh
revitify path <from> <to>
```

Shortest path (BFS, undirected) between two nodes. Prints the chain of ids, or "no path."

### `affected`

```sh
revitify affected <id|label>
```

The transitive **blast radius**: everything that depends on the target, walked backward over
`imports` / `imports_from` / `re_exports` / `calls` / `references` edges (hopping containers). Answers
"what breaks if I change this?"

### `communities`

```sh
revitify communities
```

Lists the detected clusters with size and cohesion (internal vs. boundary edge ratio).

## Exporting extra views

### `export`

```sh
revitify export [ids…]
```

Renders the opt-in exporters into `revitify-out/` (all of them if no ids given):

| Exporter id | Output | What it is |
|---|---|---|
| `callflow-html` | `callflow.html` | the viewer scoped to just `calls` edges |
| `tree-html` | `tree.html` | a collapsible directory/file/symbol tree |
| `wiki` | `WIKI.md` | one section per community |
| `mermaid` | `graph.mmd` | a Mermaid flowchart of the top symbols |
| `graph-lite` | `graph-lite.html` | the original zero-dependency canvas viewer |

The three contract artifacts (`graph.json`, `graph.html`, `GRAPH_REPORT.md`) are always written by
`build` — `export` adds these on top.

## Scaling out

### `global`

```sh
revitify global <path> <path> [...]
```

Merges several repos' graphs into one (`~/.revitify/global/graph.json`), prefixing node ids with
`<repo>:` so cross-repo collisions are impossible and communities re-offset per repo.

### `prs`

```sh
revitify prs [base]
```

Diff impact: `git diff --name-only <base>...HEAD` → each changed file's blast radius → a markdown
report. Default base `HEAD~1`.

## Serving

### `serve`

```sh
revitify serve [path] [--port <n>]
```

HTTP viewer + JSON API at `http://127.0.0.1:<port>` (default 7077, localhost-only). Reloads when
`graph.json` changes. Routes: `/`, `/graph.json`, `/api/{query,explain,node,neighbors,path,communities,stats}`.

### `mcp`

```sh
revitify mcp [path]
```

A stdio MCP server exposing `query_graph`, `get_node`, `get_neighbors`, `get_community`,
`god_nodes`, `graph_stats`, `shortest_path`. Point an MCP-capable assistant at it.

## Maintenance

### `validate`

```sh
revitify validate [graph.json]
```

Runs the contract validator against a `graph.json` (default `revitify-out/graph.json`) and reports
the first violation by node index and field. Exit 1 on failure.

### `diagnose`

```sh
revitify diagnose [path]
```

Environment self-check: which tree-sitter grammars load, whether the cache and graph exist. Tells you
why a language fell back to regex.

### `install`

```sh
revitify install [path] [--git-hook]
```

Drops the `/revitify` assistant skill into `.claude/skills/`. With `--git-hook`, also installs an
overwrite-shy `post-commit` hook that refreshes the graph after every commit.

## Output locations

| Path | Contents |
|---|---|
| `revitify-out/` | the three contract artifacts + any `export` outputs (gitignore it — it's derived) |
| `.revitify/cache/` | the per-file SHA-256 + stat-index cache (gitignore it) |
| `.revitify/query-log.jsonl` | append-only log of every query |
| `~/.revitify/global/` | the merged multi-repo graph from `global` |
