# Architecture & design

How revitify is built, and why. The guiding constraints: **stay lean** (importing the library pulls
in nothing heavy), **stay offline** (code-only needs no network), **stay modular** (adding a
language is a new file, not an edit to a switch), and **never break the output contract**.

## The pipeline: three passes

A build is a small, ordered pipeline. The same shape runs whether you call the sync or async entry:

```
walk files
   │
   ▼
┌──────────┐   per file, the matching extractor/ingestor emits a fragment
│ extract  │   { nodes, links }  — symbols, members, calls, imports, comments
└──────────┘
   │ merge fragments (first-seen node wins; links appended in walk order)
   ▼
┌──────────┐   resolve  — name: references → real symbols, tiered + confidence-tagged
│  infer   │   dedup    — minhash + Jaro-Winkler merge of near-duplicate doc nodes
│          │   summarize— copy docstrings onto their symbols
└──────────┘
   │
   ▼
┌──────────┐   Louvain + Leiden-refinement community detection → community per node
│ cluster  │
└──────────┘
   │
   ▼
graph { nodes, links, built_at_commit }  →  export (json / html / report / …)
```

Merge order is deterministic and pinned by a contract test, so the JSON output is byte-stable: the
same code always produces the same graph.

## Layered, and enforced

The source is organized into layers, each allowed to import only from layers beneath it:

```
cli      ── the revitify command; every verb lazy-loaded
serve    ── HTTP server + MCP server (the SDK loads only here, dynamically)
export   ── graph.json / graph.html / report / callflow / tree / wiki / mermaid
query    ── adjacency index, search, path, affected, communities, centrality
enrich   ── god nodes, surprising connections, suggested questions
passes   ── the 3-pass pipeline: resolve · dedup · cluster · summarize
ingest   ── per-content-type ingestors (code, markdown, sql, cargo, json, …)
extract  ── per-language extractors (TS compiler + tree-sitter) behind one registry
model    ── pure types + the contract validator; imports nothing (not even node:*)
```

This isn't a convention — it's **enforced by dependency-cruiser** in CI. The rules forbid
cross-layer imports, circular dependencies, orphan modules, and `node:*` inside `model/`. A forbidden
edge fails the build, naming the violation. (There's a regression test that creates a forbidden
import and asserts the gate catches it.) This is what makes "modular" a checkable property rather
than an aspiration.

## The registry pattern

Adding a language, ingestor, or exporter is adding a **data entry**, never editing a `switch`:

```ts
interface Registration<T> {
  id: string;
  extensions?: readonly string[];   // fast pre-filter
  detect?(file: FileRef): boolean;
  load(): Promise<T>;               // THE lazy boundary — a dynamic-import thunk
  loadSync?(): T;                   // only on zero-heavy-dep entries
}
```

Dispatch is an ordered-array match (`registry.match(file)`), so the order is explicit and adding a
language is one literal in `extract/index.ts`. There's no side-effect self-registration, so import
order is never load-bearing and unused registrations tree-shake away.

## The lazy boundary

`load()` is a dynamic-import thunk. Heavy modules — every tree-sitter grammar, the MCP SDK, the LLM
backends — sit behind one, so they're only reached when a matching file appears (or an opt-in command
runs). The sync path uses `loadSync()` only, which exists exclusively on zero-heavy-dep entries (the
TypeScript compiler, the regex extractors). The net effect:

> `import { revitify }` provably loads neither web-tree-sitter, nor a grammar, nor the MCP SDK, nor
> any LLM SDK.

"Provably" is literal: a test spawns a child process with a module-resolution hook that records every
resolved specifier, runs the sync path, and asserts none of those modules were loaded — with a
**positive control** that runs the async path through the same hook and confirms they *do* load, so a
silently-broken hook can't fake a pass. dependency-cruiser also forbids static imports into the lazy
zones, so the boundary can't be crossed by accident.

## The sync / async dual API

There are two public entry points, by design:

| | `revitify` / `buildGraph` | `revitifyAsync` / `buildGraphAsync` |
|---|---|---|
| sync? | ✅ synchronous | returns a Promise |
| languages | TS/JS full depth; Python/Java shallow regex fallback | all 12 via tree-sitter |
| heavy deps | none | tree-sitter (lazy), workers, cache |
| stability | **frozen signature, forever** | the full-power, evolving API |

The sync API is a deliberate product promise — a lean, always-available, zero-dependency call that a
consumer (like Rivet) can embed without inheriting a WASM toolchain. The async API is the superset.
The CLI always uses async, so `revitify build` gives you full depth everywhere.

## The output contract

The graph shape — `nodes[].{id,name,label,kind,source_file,source_location,community,summary}`,
`links[].{source,target,relation,confidence}`, top-level `built_at_commit` — is the contract.
**Fields may be added; none may be renamed or removed.** It's guarded three ways:

1. A runtime validator (`assertGraphContract`) that fails loud, naming the first offending node index
   and field — also exposed as `revitify validate`.
2. An exact-key + inline-snapshot test plus a byte-identity pin on a committed fixture.
3. A type-level test that the graph type stays assignable to what consumers read.

## Cache & parallelism

- **Per-file cache** (`.revitify/cache/`): each file's fragment is keyed on
  `sha256(version | file-set hash | relPath | content)`, with a stat-index (size + mtime) fastpath
  that skips re-reading unchanged files entirely. The file-set hash is in the key because fragments
  embed import resolution against the walked set, so adding/removing a file invalidates honestly. A
  corrupt index or evicted fragment recovers, never crashes.
- **Worker pool**: above ~50 files the async pipeline fans extraction across `worker_threads`
  (sized to your cores), reassembling fragments in walk order so output stays byte-identical to the
  sequential path — verified by a test.

## Opt-in, key-gated multimodal

Beyond code, revitify can ingest docs/PDFs/images (concepts via an LLM backend), audio/video (via a
local whisper CLI), SCIP indexes, SQL schemas, and Cargo manifests. These are **opt-in and
key-gated**: with no API key and no local tool, the run makes zero network calls and produces a graph
byte-identical to a code-only build (the file still gets a node; nothing is fabricated). LLM backends
are plain `fetch` against Anthropic/Gemini/OpenAI/Ollama — no SDKs — auto-detected from environment
keys.

## Why a graphify port?

[graphify](https://github.com/safishamsi/graphify) is a Python code-knowledge-graph tool. Revitify is
a from-scratch TypeScript implementation of the same concepts and the **same output contract**, so
TypeScript projects get a native, dependency-light, offline engine with no Python in the loop — plus
enforced modularity, confidence on every edge, and deeper Java extraction than the original. The
upstream pin and attribution live in `.track`.
