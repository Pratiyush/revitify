# PARITY — revitify vs graphify (reference)

> Generated 2026-06-12 by `scripts/compare-parity.mjs`.
> Reference: graphify 0.8.37 (PyPI; .track pins 0.8.38) run OFFLINE on a copy of llm-dev-kit; revitify run on the same copy.
> Bar (docs/PLAN.md, locked): structural bands, not bit-identity. Re-run at every phase gate.

| Metric | revitify | graphify (reference) |
|---|---|---|
| nodes | 490 | 893 |
| links | 1455 | 1788 |
| relation types | 4 | 7 |
| relations | references 430, contains 367, calls 357, imports 301 | contains 693, imports 428, calls 302, imports_from 300, re_exports 26, references 23, method 16 |
| communities | 34 | 65 |
| source files | 125 | 157 |
| god nodes (top 5 by degree) | `src/cli/index.ts` (49), `src/cli/tasks.ts` (49), `src/cli/workflow.ts` (48), `src/engine/state/tasks.ts` (44), `TaskStore` (40) | `index.ts` (56), `tasks.ts` (49), `workflow.ts` (48), `tasks.ts` (45), `Rivet learnings — append-only; a lesson counts once PROMOTED or HARDENED` (41) |
| built_at_commit | yes | yes |

## Bands

| Band | Status | Detail | Closed by |
|---|---|---|---|
| node count within ±30% | ❌ gap | 490 vs 893 (55%) | P2 multi-language + P4 why-nodes |
| link count within ±30% | ✅ pass | 1455 vs 1788 (81%) | P2-P3 (calls/imports_from/re_exports) |
| relation types within ±30% | ❌ gap | 4 vs 7 | P2-P3 |
| community count within ±30% | ❌ gap | 34 vs 65 | P3 Leiden |
| god-node top-5 file overlap ≥ 3 | ✅ pass | 4/5 | P3-P4 |
| contract fields exact (revitify) | ✅ pass | ok | always |

## Shape notes (measured, for the port)

- graphify graph.json top-level: `directed, multigraph, graph, nodes, links, hyperedges, built_at_commit`.
- graphify nodes: `label, file_type, source_file, source_location ("L14"), _origin, id, community,
  norm_label` — **no `name`/`kind`**; callables get `()` in the label.
- graphify links: `relation, confidence (EXTRACTED/INFERRED/AMBIGUOUS), source_file,
  source_location, weight, source, target, confidence_score`.
- revitify nodes additionally carry `name` and `kind`, and `source_location` is `file:line` —
  additive differences Rivet's tolerant reader accepts; keep them.
- revitify links carry `confidence` (same EXTRACTED/INFERRED/AMBIGUOUS vocabulary) since
  Phase 1b: EXTRACTED 668, INFERRED 783, AMBIGUOUS 4 — graphify also scores `confidence_score`/`weight` (Phase 3).

Gaps are the roadmap, not failures: each ❌ names the phase that closes it.
