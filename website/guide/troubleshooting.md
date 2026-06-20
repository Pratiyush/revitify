# Troubleshooting

Start here when the graph isn't what you expected. The first move is almost always:

```sh
revitify diagnose
```

It reports which tree-sitter grammars loaded, whether the cache and `graph.json` exist, and the
reason behind any fallback — most questions below are answered by its output.

## My symbols are missing / too shallow

Almost always the **sync vs async** distinction. `buildGraph` and `revitify` (the synchronous API)
extract **TypeScript and JavaScript at full depth** but only do a shallow regex pass for every other
language. Full multi-language depth needs the async engine — which is what the CLI always uses.

- Using the **CLI** (`revitify build`)? You're already on the async path. If a language is still
  shallow, its grammar probably didn't load — see below.
- Using the **library**? Switch `buildGraph` → `buildGraphAsync` (or `revitify` → `revitifyAsync`).
  See [Use as a library → sync vs async](./library#sync-vs-async-the-one-decision).

## A tree-sitter grammar failed to load

Grammars ship as **optional** dependencies and load lazily. If your registry blocked one, or a
platform prebuild is missing, revitify **degrades gracefully**: that language falls back to the regex
extractor (top-level symbols) or a bare file node, and every other language is unaffected.

```sh
revitify diagnose          # shows exactly which grammars are loadable
```

To fix, reinstall so the optional grammar packages are present (`pnpm install` with optional deps
enabled). See [Languages → graceful degradation](./languages#graceful-degradation).

## The graph looks stale after I edited code

Revitify caches per file (`.revitify/cache/`, keyed on a SHA-256 of the content plus a stat-index
fastpath), so a rebuild only re-reads what changed. If you suspect a stale cache:

```sh
rm -rf .revitify/cache      # force a cold rebuild
revitify build .
```

While actively editing, run `revitify watch .` — it rebuilds incrementally on every save, and a
running `revitify serve` reloads automatically when `graph.json` changes.

## Node count differs from graphify

That's **deliberate**, not a bug. graphify fabricates a node for every referenced out-of-project type
(`String`, `Map`, …); revitify *links the reference* instead of inventing a node for it. So revitify
reports fewer nodes while every other parity band (links, relation types, communities, god-node
overlap, the output contract) matches. The full comparison is in
[`PARITY.md`](https://github.com/Pratiyush/revitify/blob/main/PARITY.md).

## Re-indexing a large repo is slow

The first build is always cold. After that the cache makes re-indexing proportional to your edit, not
your repo. Above ~50 files revitify fans extraction across worker threads automatically; the result is
reassembled in walk order so the output stays byte-identical to a sequential run. If a single build is
still slow, `revitify diagnose` will show the cache hit/miss ratio.

## `EXTRACTED` vs `INFERRED` vs `AMBIGUOUS`

Every link is confidence-tagged by how it was resolved:

- **EXTRACTED** — read directly from the AST (a `contains`, an `import`). Trust it.
- **INFERRED** — a name resolved to exactly one definition (same file → same dir → globally unique).
- **AMBIGUOUS** — a name matched more than one candidate; revitify picked deterministically but is
  telling you it guessed. Filter these out when you need certainty
  (`links.filter(l => l.confidence === "EXTRACTED")`).

See [How nodes work → confidence](./concepts).

## Where are my queries logged?

Every `query` / `explain` / `path` / `affected` (from the CLI, the HTTP API, or MCP) is appended to
`.revitify/query-log.jsonl` — an audit trail of what was asked of the graph. Delete the file to reset
it; it's regenerated on the next query.

## `serve` / `mcp` aren't available

Those load the HTTP and MCP machinery lazily. If `revitify serve` or `revitify mcp` errors on a fresh
install, run `pnpm install` to ensure the (optional) `@modelcontextprotocol/sdk` is present, then
`revitify diagnose`.

## Still stuck?

Open an issue with your `revitify diagnose` output attached — it captures the environment, grammar
status, and cache state that explain most surprises:
[github.com/Pratiyush/revitify/issues](https://github.com/Pratiyush/revitify/issues).
