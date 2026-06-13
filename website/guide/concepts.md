# How nodes work

The whole point of revitify is one idea: **your codebase is a graph.** Files contain symbols,
symbols call and import each other, comments explain why, and clusters of tightly-connected code
form natural modules. Revitify extracts that graph so you — or your tools, or an AI assistant — can
query it instead of grepping.

This page is the mental model. Once you have it, everything else (the CLI, the viewer, the API) is
just different ways to ask the same graph questions.

## The shape

Every build produces a single JSON object with three top-level keys:

```json
{
  "nodes": [ /* the things */ ],
  "links": [ /* the relationships between things */ ],
  "built_at_commit": "8ad54b1…"
}
```

That's the entire contract. `nodes` and `links` are arrays; `built_at_commit` stamps the git commit
the graph was built from (omitted outside a git repo). Everything below describes what goes in those
two arrays.

## A node

A node is one "thing" in your code — a file, a function, a class, a doc heading, a comment that
explains a decision. Every node has this shape:

```ts
interface RevitifyNode {
  id: string;            // unique, structured — see "Node ids" below
  label: string;         // the human name: "AuthService", "login", "README.md"
  name?: string;         // same as label (kept for consumers that expect it)
  kind?: string;         // "class" | "method" | "file" | "doc" | …
  source_file: string;   // "src/auth.ts"
  source_location?: string; // "src/auth.ts:42"  (file:line)
  community?: number;    // which cluster this node belongs to (see "Communities")
  summary?: string;      // first line of its docstring, if any
}
```

The only required fields are `id`, `label`, and `source_file`. Everything else is additive — a
consumer can ignore fields it doesn't understand, and revitify can add new ones without breaking
anyone.

### Node ids are structured

The `id` is not random — it encodes what the node is and where it lives, so you can reason about a
node from its id alone:

| Id pattern | What it is | Example |
|---|---|---|
| `file:<rel>` | a source file | `file:src/auth.ts` |
| `sym:<rel>#<name>` | a top-level symbol | `sym:src/auth.ts#AuthService` |
| `sym:<rel>#<Type>.<member>` | a member of a container | `sym:src/auth.ts#AuthService.login` |
| `doc:<rel>#<heading>` | a markdown heading | `doc:README.md#Architecture` |
| `why:<rel>#L<line>` | a NOTE/WHY/HACK comment | `why:src/cache.ts#L12` |
| `docstring:<rel>#<sym>` | a Python docstring | `docstring:lib/jobs.py#Runner` |
| `table:` / `column:` (as `sym:`) | a SQL table / column | `sym:db/schema.sql#users` |

Members nest their full path — `Billing.Invoice.audit`, not just `Invoice.audit` — so a deeply
nested method has a globally unique, readable id.

### Node kinds

`kind` tells you what category of thing a node is. The set grows as languages are added, but the
common ones:

- **Structural:** `file`, `module`, `directory`
- **Types:** `class`, `interface`, `enum`, `record`, `struct`, `trait`, `impl`, `type`, `annotation`
- **Callables & data:** `function`, `method`, `constructor`, `field`, `const`, `object`
- **Docs & intent:** `doc` (markdown heading), `docstring`, `why` (a NOTE/WHY/HACK comment)
- **Beyond code:** `table`, `column`, `crate`, `dependency`, `concept` (from an LLM doc pass),
  `transcript`, `scip-symbol`, `json-key`

A node with no recognized kind falls back to `node`.

## A link

A link is a directed, typed relationship between two nodes (by id):

```ts
interface RevitifyLink {
  source: string;        // a node id
  target: string;        // a node id
  relation?: string;     // "contains" | "calls" | "imports" | …
  confidence?: Confidence; // how sure the graph is — see below
}
```

### Relations

The relation is the *kind* of relationship. Revitify uses graphify's vocabulary so the two are
interchangeable for downstream tools:

| Relation | Meaning | Typical source → target |
|---|---|---|
| `contains` | structural ownership | `file:` → `sym:`, or a type → its non-callable members |
| `method` | a container owns a callable | `class` → its `method`/`constructor` |
| `imports` | a file imports another file | `file:` → `file:` |
| `imports_from` | a named import resolves to a definition | `file:` → `sym:` |
| `re_exports` | a barrel file re-exports another | `file:` → `file:` |
| `calls` | a symbol calls another symbol | `sym:` → `sym:` |
| `references` | a use that isn't a call | `sym:`/`file:` → `sym:` |
| `rationale_for` | a why-comment explains a symbol | `sym:` → `why:` |
| `documents` | a docstring documents a symbol | `sym:` → `docstring:` |
| `depends_on` | a crate depends on a package | `crate` → `dependency` |

### Confidence — what the graph is sure about

This is revitify's most useful, least obvious feature. Not every edge is equally certain, so every
edge carries a confidence tag:

- **`EXTRACTED`** — structurally certain. The AST literally said so: a file *contains* this class;
  this class *has* this method; this file *imports* that file. No guessing.
- **`INFERRED`** — a reference that resolved to exactly one definition. `login()` calls `hash()`,
  and there is exactly one `hash` in scope, so the edge points there with confidence.
- **`AMBIGUOUS`** — a reference with several candidate definitions. Revitify still picks one
  **deterministically** (nearest by directory, then lexicographic id) so builds are reproducible,
  but it flags the edge so you treat it as a hint, not a fact.

```
contains / imports / method      → EXTRACTED   (the AST is the source of truth)
a call that resolves uniquely     → INFERRED    (one candidate, high confidence)
a call with 3 candidates named X  → AMBIGUOUS   (picked deterministically, flagged)
```

The `GRAPH_REPORT.md` ends with a **confidence ledger** — a one-glance count of how much of your
graph is certain vs. inferred vs. ambiguous.

## How a reference becomes an edge

Resolution is tiered, mirroring how a human reads code. When `render()` in `b/caller.ts` uses
`helper`, revitify looks for a definition of `helper`:

1. **same file** — is there a `helper` in `b/caller.ts`? If exactly one, link it, `INFERRED`.
2. **same directory** — else, is there one in `b/`? If exactly one, link it, `INFERRED`.
3. **globally** — else, any `helper` in the repo. One → `INFERRED`; several → deterministic pick,
   `AMBIGUOUS`; none → no edge at all (revitify never invents a target).

This is why a call to a local helper resolves with confidence while a call to a common name like
`render` across a big repo is honestly flagged ambiguous.

## Communities — the modules you didn't draw

After extraction, revitify runs **Louvain community detection with Leiden-style refinement** over
the graph. The result is an integer `community` on every node: tightly-connected clusters get the
same number. These are the *de facto* modules — the way your code actually groups, which often
differs from how the directories are laid out.

Communities power the **god nodes** (most-connected symbols within and across communities) and the
**surprising connections** (edges that cross community boundaries unexpectedly) in the report. The
clustering is deterministic — no randomness — so the same code always yields the same communities.

## Why-nodes & docstrings — capturing intent

Code says *what*; comments say *why*. Revitify treats decision-bearing comments as first-class:

- A comment starting `NOTE:`, `WHY:`, or `HACK:` becomes a **why-node**, linked `rationale_for`
  from the symbol declared just beneath it.
- A Python docstring becomes a **docstring node** (`documents` edge) and its first line is also
  copied onto the symbol as `summary`, so the viewer's detail panel can show it inline.

```python
class Runner:
    """Coordinates the worker pool."""   # → docstring node + summary on Runner
    def run(self):
        # HACK: retry twice, the scheduler drops the first tick   # → why-node on run()
        ...
```

This means a search for "retry" can surface the *reasoning*, not just code that happens to contain
the word.

## Putting it together

A two-file TypeScript project becomes, roughly:

```
file:src/auth.ts ──contains──▶ sym:src/auth.ts#AuthService        (EXTRACTED)
sym:#AuthService ──method────▶ sym:#AuthService.login             (EXTRACTED)
file:src/auth.ts ──imports───▶ file:src/crypto.ts                 (EXTRACTED)
sym:#AuthService.login ─calls▶ sym:src/crypto.ts#hash             (INFERRED)
```

Four nodes, four links, each typed and confidence-tagged — and that's a graph you can search,
traverse, and reason about. Next: see what this looks like [across languages](./languages), or jump
straight to the [tutorial](./getting-started).
