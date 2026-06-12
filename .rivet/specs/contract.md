# Feature: The graphify output contract (Rivet's #1 invariant)

> User story: As Rivet (the consumer at ~/Github/llm-dev-kit), I want every revitify build to emit
> the exact graph.json shape my `loadCodeGraph` reads, so that graph features never break under me.
> Intake: FEATURE-PARITY-PROMPT.md + docs/PLAN.md (decisions locked 2026-06-12).

## Requirement REQUIREMENT_CONTRACT-01 — the three artifacts, default revitify-out/

WHEN `revitify(rootDir)` runs on any project THEN the system SHALL write `graph.json`,
`graph.html` (self-contained, no remote scripts), and `GRAPH_REPORT.md` into `<rootDir>/revitify-out/`.

@check kind=unit ref=test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)

## Requirement REQUIREMENT_CONTRACT-02 — Rivet's call shape stays supported forever

WHEN `revitify(rootDir, "graphify-out")` runs (the exact call Rivet's `refreshCodeGraphVia` makes)
THEN the system SHALL write the same three artifacts into `<rootDir>/graphify-out/` and every
symbol node SHALL carry exactly `id, name, label, kind, source_file, source_location, community`.

@check kind=unit ref=test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')

## Requirement REQUIREMENT_CONTRACT-03 — graph fields are additive-only

WHEN the graph is built THEN nodes SHALL carry `id`, `label`, `source_file`, `community` and links
SHALL carry `source`, `target`, `relation`, and the graph SHALL carry `built_at_commit` when the
project is a git checkout; new fields MAY be added but these SHALL never be renamed or removed.

@check kind=unit ref=test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes

@check kind=unit ref=test/contract.test.ts::a canonical symbol node carries exactly the contract fields

Scenario: a contract-breaking shape fails loudly, not silently (negative floor)
  Given a graph.json whose nodes lost the `source_file` field
  When the `assertGraphContract` validator (src/model/contract.ts) checks it
  Then validation throws naming the offending node index and field

@check kind=unit ref=test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)

## Requirement REQUIREMENT_CONTRACT-04 — refactors never change output bytes

WHEN the engine is restructured without intended behavior change (Phase 1a modularization)
THEN graph.json on the committed fixture SHALL be byte-identical to the committed expectation,
and the type-level pin against Rivet's reader SHALL keep compiling.

@check kind=unit ref=test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)
@check kind=unit ref=test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads
