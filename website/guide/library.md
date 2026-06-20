# Use revitify as a library

Everything the CLI does is the public API underneath. Import `revitify`, get a graph — in memory or
written to disk — and do whatever you like with it. The entry points in `src/index.ts` are a **frozen
facade**: their signatures will not change.

## Install

::: code-group
```sh [pnpm]
pnpm add revitify
```
```sh [npm]
npm i revitify
```
:::

Revitify needs **Node 20+**. `import { revitify }` pulls in **zero heavy dependencies** — no
tree-sitter, no MCP SDK, no LLM backend. Those load lazily, only when you reach for the async engine
or the server.

## The four entry points

| Function | Returns | Writes files? | Depth |
|---|---|---|---|
| `buildGraph(rootDir)` | `RevitifyGraph` | no | TS/JS full; other langs shallow |
| `revitify(rootDir, outDir?)` | `RevitifyResult` | yes → `outDir` | same as `buildGraph` |
| `buildGraphAsync(rootDir, options?)` | `Promise<RevitifyGraph>` | no | **all** languages (tree-sitter) |
| `revitifyAsync(rootDir, outDir?, options?)` | `Promise<RevitifyResult>` | yes → `outDir` | all languages |

```ts
import { buildGraph, revitify, buildGraphAsync, revitifyAsync } from "revitify";

// In-memory, synchronous — no disk writes:
const graph = buildGraph(process.cwd());
console.log(graph.nodes.length, "nodes");

// Write the full output contract (graph.json + graph.html + GRAPH_REPORT.md):
const { graphJsonPath, counts } = revitify(process.cwd());
console.log("wrote", graphJsonPath, counts); // { nodes, links }

// The full engine — every language, cache, worker parallelism:
const full = await buildGraphAsync(process.cwd());
```

`outDir` defaults to `revitify-out`. dev-spec-kit passes `outDir: "graphify-out"` explicitly so a
Python-graphify run can sit beside it; that call shape is supported forever.

## Sync vs async — the one decision

This is the only thing you must understand to use the library well:

- **`buildGraph` / `revitify` (sync)** extract **TypeScript and JavaScript at full compiler-API
  depth**, and fall back to a shallow regex pass (top-level symbols only) for every other language.
  They pull in **no** native grammars. Use them when your target is TS/JS, or when you want a
  dependency-light embed.
- **`buildGraphAsync` / `revitifyAsync` (async)** load **tree-sitter** grammars lazily and extract
  **all twelve languages** at full depth, with a per-file cache and worker-thread parallelism. The
  CLI always uses this path.

Both return the **same contract shape**. For a non-TS/JS repo they can legitimately differ in
*detail* — that is the deliberate sync/async contract, not a bug.

::: tip
Indexing a polyglot repo programmatically? Use the **async** path. Reserve the sync path for TS/JS
targets or when import-weight matters (e.g. embedding revitify inside another tool, as dev-spec-kit
does).
:::

## The graph shape

The return value — and the `nodes`/`links` of `graph.json` — is exactly this (it is graphify's output
contract; changing it breaks every consumer, so it is held stable):

```ts
interface RevitifyGraph {
  built_at_commit?: string;   // git HEAD at build time (omitted outside a repo)
  nodes: RevitifyNode[];
  links: RevitifyLink[];
}

interface RevitifyNode {
  id: string;               // structured: "sym:src/auth.ts#login" | "file:…" | "doc:…"
  label: string;            // human name
  name?: string;            // compatibility alias of label
  kind?: string;            // "class" | "method" | "file" | "doc" | "concept" | …
  source_file: string;      // relative path
  source_location?: string; // "file:line"
  community?: number;       // cluster id (Louvain + Leiden)
  summary?: string;         // first line of the symbol's docstring
}

interface RevitifyLink {
  source: string;           // node id
  target: string;           // node id
  relation?: string;        // "contains" | "calls" | "imports" | "imports_from" | "re_exports" | "references" | …
  confidence?: Confidence;  // "EXTRACTED" | "INFERRED" | "AMBIGUOUS"
}
```

`Confidence` is exported as a value too: `import { Confidence } from "revitify"` →
`Confidence.EXTRACTED`, `.INFERRED`, `.AMBIGUOUS`.

## Walk the graph

The graph is plain data — no accessor ceremony. A few patterns:

```ts
import { buildGraph } from "revitify";

const g = buildGraph(process.cwd());

// All classes and where they live:
const classes = g.nodes.filter((n) => n.kind === "class");

// Degree (the "god nodes" the report surfaces):
const degree = new Map<string, number>();
for (const l of g.links) {
  degree.set(l.source, (degree.get(l.source) ?? 0) + 1);
  degree.set(l.target, (degree.get(l.target) ?? 0) + 1);
}
const hubs = [...degree].sort((a, b) => b[1] - a[1]).slice(0, 10);

// One-hop neighbors of a node, with the relation:
const id = "sym:src/auth.ts#AuthService";
const neighbors = g.links
  .filter((l) => l.source === id || l.target === id)
  .map((l) => ({ to: l.source === id ? l.target : l.source, via: l.relation }));

// Trust only what was structurally extracted:
const certain = g.links.filter((l) => l.confidence === "EXTRACTED");
```

## Consume `graph.json` from another tool

`graph.json` is the integration boundary. Read it and validate it against the shipped contract before
you trust it:

```ts
import { readFileSync } from "node:fs";
import { assertGraphContract, CONTRACT } from "revitify";

const data: unknown = JSON.parse(readFileSync("revitify-out/graph.json", "utf8"));
assertGraphContract(data); // throws if the shape drifted; narrows the type on success
// `data` is now a RevitifyGraph

console.log(CONTRACT.artifacts);     // the filenames revitify guarantees
console.log(CONTRACT.nodeRequired);  // required node fields — additive-only over time
```

This is exactly how dev-spec-kit ingests revitify: it runs `revitify build <dir> --out graphify-out`
(or calls `revitify()` in-process), then reads `graphify-out/graph.json` back through the same
contract. Because the shape is frozen and additive-only, an upgrade never breaks the reader.

## Render a report yourself

```ts
import { buildGraph, renderReport } from "revitify";

const report = renderReport(buildGraph(process.cwd())); // the GRAPH_REPORT.md string
```

`walkFiles(rootDir)` is also exported if you want revitify's exact file-discovery (gitignore-aware,
deterministic order, the same ignore set the build uses).

## Extending

Adding a **language** or an **exporter** is a new module, not a switch edit — the layered architecture
is enforced by dependency-cruiser. Both recipes (with the `LanguageConfig` / `Exporter` shapes) live
in [Contributing](../contributing). The [Architecture](./architecture) guide explains the registry
pattern and the lazy boundary that keep the sync path dependency-light.

## Next

- [CLI & queries](./cli) — the same surface from the command line.
- [How nodes work](./concepts) — the node / link / confidence model in depth.
- [Troubleshooting](./troubleshooting) — missing symbols, grammar fallback, the cache.
