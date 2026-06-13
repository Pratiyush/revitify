# Contributing

Revitify is built to be extended — adding a language or an exporter is a new module, not a rewrite.
This page is the working contract for contributors.

## Setup

```sh
git clone <repo> revitify && cd revitify
pnpm install
pnpm run build      # tsc + copy the viewer assets into dist/
pnpm test           # vitest
pnpm run check      # the full gate (below)
```

Requirements: **Node 20+** and **pnpm**. The tree-sitter grammars are optional dependencies; a
`pnpm install --no-optional` still produces a working core (the languages with regex fallbacks keep
working, the rest emit file nodes).

## The quality gate

`pnpm run check` must be green before any PR. It runs, in order:

| Step | What it enforces |
|---|---|
| `build` | strict TypeScript compiles (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, …) |
| `lint` | Biome — formatting + lint, one fast tool |
| `knip` | no dead exports, no unused dependencies |
| `depcruise` | the layer-boundary matrix — no cross-layer or circular imports |
| `test:coverage` | vitest with a ratcheted coverage floor (raise it as you add tests, never lower) |

The `depcruise` step is the one people hit first: if you import "upward" across a layer (say,
`model/` importing from `export/`), the build fails naming the edge. That's intentional — the layering
is the product. See [Architecture](/guide/architecture#layered-and-enforced).

## Test discipline: rule → test → proof

Revitify is developed test-first, and it dogfoods **Rivet** (a spec-driven traceability tool) on
itself. The loop for any behavior change:

1. Write or update the spec criterion in `.rivet/specs/*.md` (an EARS sentence + an `@check` ref).
2. Write the **failing test first** (`pnpm test` red).
3. Implement until green.
4. The check is evidence-bound: a test name in an `@check` must exactly match an `it(...)`/`test(...)`
   string. `rivet trace` proves every requirement is backed by a passing check.

You don't need Rivet installed to contribute — plain vitest test-first is fine — but **every new
behavior needs a test**, and ideally a negative one (assert the failure mode, not just the happy
path). The strongest tests in the suite assert *behavior*, not smoke: the offline gate proves
byte-identity with `fetch` asserted never called; the lazy-boundary test uses a positive control so a
broken hook can't fake a pass. Aim for that bar.

::: warning Two gotchas the test runner hit
- A test name **must not start with `--`** — `vitest -t <name>` swallows it as a flag.
- Tests that spawn the built CLI use `describe.skipIf(!existsSync(dist))`, so run `pnpm build`
  before `pnpm test` or they silently skip.
:::

## Add a language

This is the common contribution. Say you want to add **Lua**:

**1. Add the grammar** as an optional dependency:

```sh
pnpm add -O tree-sitter-lua
```

Add it to `pnpm-workspace.yaml`'s `allowBuilds` as `false` (the grammar ships prebuilt WASM; its
native build must not run).

**2. Map the extension** in `src/model/languages.ts`:

```ts
".lua": "lua",
```

**3. Write the `LanguageConfig`** — pure data describing the grammar's node types. Add it to
`src/extract/treesitter/widened.ts` (or its own module):

```ts
const LUA: LanguageConfig = {
  id: "treesitter-lua",
  language: "lua",
  wasm: "tree-sitter-lua/tree-sitter-lua.wasm",
  extensions: [".lua"],
  definitions: [
    { type: "function_declaration", kind: "function" },
    { type: "function_definition", kind: "function" },
  ],
  calls: [{ type: "function_call", calleeField: "name" }],
  comments: { types: ["comment"] },
};
```

The fields: `definitions` (AST node type → emitted kind; `container: true` makes its children
`Container.member`; `nameField`/`nameChildType`/`nameStrategy` handle where the name lives), `calls`
(call-site node types + the callee field), `imports` (file-resolvable module paths and/or imported
names), `comments`/`docstrings`. The generic walker in `factory.ts` does the rest.

**4. Register it** in `src/extract/index.ts`:

```ts
{ id: "treesitter-lua", extensions: extensionsFor("lua"),
  load: () => import("./treesitter/widened.js").then((m) => m.create("lua")) },
```

**5. Test it** — add a `LuaConfig` fixture to `test/widened.test.ts` asserting the symbols, a call,
and a comment are extracted. Run the gate.

To find a grammar's exact node-type names, parse a sample with the grammar and walk the tree (the
existing language modules show the pattern), or read the grammar's `node-types.json`.

## Add an exporter

Implement `Exporter` (`{ id, filename, render(graph): string }`) and add it to `extraExporters` in
`src/export/index.ts`. It becomes available via `revitify export <id>`. Keep it a pure
`graph → string`; the caller writes the file.

## The output contract is sacred

The `graph.json` shape is consumed by downstream tools. You may **add** node/link fields; you may not
rename or remove `id`, `label`, `source_file`, `source`, `target`, `relation`, `confidence`,
`community`, or `built_at_commit`. The contract test (`test/contract.test.ts`) will fail loudly if you
drift — that's working as intended. If you add a field, extend `CONTRACT` in `src/model/contract.ts`
and the validator together.

## PR checklist

- [ ] `pnpm run check` green (build · lint · knip · depcruise · coverage).
- [ ] A test for the new behavior, including a negative case.
- [ ] The contract test green (or, if you added a field, the contract + validator updated together).
- [ ] If you added a language: it's an optional dependency, it degrades gracefully when absent, and
      `revitify diagnose` lists it.
- [ ] Commit messages describe the *why*. (This project authors commits without AI co-author
      trailers.)

There's a full code-review writeup at [`docs/REVIEW.md`](https://github.com/pratiyushkumar/revitify/blob/main/docs/REVIEW.md)
with the current known-issues backlog and effort estimates — a good place to find a first task.
