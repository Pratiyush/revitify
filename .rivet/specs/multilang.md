# Feature: Multi-language extraction, cache, parallel (Phase 2)

> User story: As a polyglot-repo owner, I want real AST extraction for Python/Java/Go/Rust with
> caching and parallelism, without `import { revitify }` ever paying for tree-sitter.
> Upstream: graphify extract.py + detect.py + cache.py (pin 0.8.38 in .track). Grammars come from
> the official tree-sitter-<lang> npm packages (prebuilt .wasm; native scripts never run) — NOT
> tree-sitter-wasms, whose 2024-era builds are ABI-incompatible with web-tree-sitter 0.26.

## Requirement REQUIREMENT_LANG-01 — deep member extraction per language

WHEN a Java file is extracted via tree-sitter THEN classes, interfaces, enums, records,
methods, **constructors, and fields** SHALL each become symbols (members as
`sym:<rel>#<Type>.<member>`), and WHEN Python/Go/Rust files are extracted THEN
classes/functions/methods, funcs/methods/types, and fns/structs/enums/traits/impl-methods
SHALL respectively become symbols.

@check kind=unit ref=test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth
@check kind=unit ref=test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports
@check kind=unit ref=test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract

## Requirement REQUIREMENT_LANG-02 — the sync facade is frozen and deterministic

WHEN `buildGraph()` (sync) runs THEN tree-sitter SHALL NOT load — regex fallbacks serve py/java,
go/rust are skipped — and an earlier `buildGraphAsync` in the same process SHALL NOT change the
sync output (no cache-leak upgrades).

@check kind=unit ref=test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter
@check kind=unit ref=test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages

Scenario: the lazy-boundary proof cannot silently rot (negative floor)
  Given the module-resolution recorder hook in a child process
  When the async path runs on a Python file
  Then the log DOES contain web-tree-sitter — proving the hook records before we trust its silence

@check kind=unit ref=test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook

## Requirement REQUIREMENT_CACHE-01 — per-file cache with honest invalidation

WHEN a build re-runs unchanged THEN every file SHALL be a cache hit (stat fastpath, no re-read);
WHEN one file changes THEN exactly that file SHALL re-extract; WHEN the file SET changes THEN the
whole cache SHALL invalidate (fragments embed import resolution against the walked set); IF the
index corrupts or fragments are evicted THEN the build SHALL recover, never crash.

@check kind=unit ref=test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical
@check kind=unit ref=test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)
@check kind=unit ref=test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files

## Requirement REQUIREMENT_PAR-01 — parallel extraction changes nothing but wall-clock

WHEN worker-pool extraction runs THEN the graph SHALL be byte-identical to the sequential run
(fragments reassemble in walk order).

@check kind=unit ref=test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly
