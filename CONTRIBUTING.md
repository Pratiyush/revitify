# Contributing to revitify

Thanks for your interest! revitify is a native-TypeScript code-knowledge-graph engine with a frozen
output contract and a hard quality gate. This is the quick on-ramp; the **full contributor guide**
(architecture, the add-a-language and add-an-exporter recipes, the PR checklist) lives at
[`website/contributing.md`](website/contributing.md).

## Setup

Requires **Node 20+** and **pnpm**.

```sh
git clone https://github.com/Pratiyush/revitify.git
cd revitify
pnpm install
pnpm run build
pnpm test
```

## The quality gate (what CI enforces)

Every PR must pass `pnpm check`, which runs the full bar:

```sh
pnpm check   # = build · lint (biome) · knip · depcruise · test:coverage
```

- **build** — strict TypeScript (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, …).
- **lint** — Biome (format + lint). `pnpm format` auto-fixes.
- **knip** — no dead exports or unused dependencies.
- **depcruise** — the enforced layer matrix (`model → extract → ingest → passes → enrich → query →
  export → serve → cli`). Cross-layer imports fail CI.
- **test:coverage** — vitest with a ratcheted coverage floor.

## Two rules that are non-negotiable

1. **The output contract is sacred.** `graph.json` field names are frozen and changes must be
   **additive only** — every downstream consumer (including dev-spec-kit) reads this exact shape.
   `assertGraphContract` and the contract tests guard it.
2. **Determinism / byte-stability.** The same code must produce byte-identical `graph.json`. Walk order
   is sorted, merges are first-seen-wins, and the worker pool reassembles in walk order. Don't
   introduce ordering nondeterminism.

## Adding a language or an exporter

Both are a **new module, not a switch edit** (that's what the layered architecture buys). Step-by-step
recipes — grammar package, extension map, `LanguageConfig` / `Exporter` shape, registration, test —
are in [`website/contributing.md`](website/contributing.md) and the
[architecture guide](website/guide/architecture.md).

## Pull requests

- **Open an issue first.** Describe the change in a GitHub issue before you start; reference it from
  the PR (`Closes #NN`). This keeps work traceable.
- Branch from `main` (protected — PR + green CI required). Keep PRs scoped. Fill in the template.
- CI must be green; we **squash-merge** to keep history linear.
- New behavior needs a test that asserts behavior (rule → test → proof), not just executes lines.
- **Conventional Commit titles are required** — they drive the automated release (see below).

## Releases

Releases are automated. On every push to `main`, the `release` workflow computes the next version
from [Conventional Commits](https://www.conventionalcommits.org/) and creates a git tag + GitHub
Release:

- `feat:` → **minor** · `fix:` → **patch** · `feat!:` / `BREAKING CHANGE:` → **major**
- `chore:` / `docs:` / `refactor:` / `test:` / `ci:` alone → **no release**

Don't create tags by hand — the workflow owns versioning. Because the squash-merge title becomes the
commit on `main`, **the PR title is what the release reads**, so make it a clean Conventional Commit.

For security issues see [SECURITY.md](SECURITY.md) — do not open a public issue. By contributing you
agree your contributions are licensed under the [MIT License](LICENSE).
