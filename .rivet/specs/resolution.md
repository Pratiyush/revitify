# Feature: Confidence-tagged reference & import resolution

> User story: As a graph consumer, I want every edge to declare how it was derived
> (EXTRACTED/INFERRED/AMBIGUOUS) and import edges to point only at files that exist, so that I can
> weight what I trust and never chase dangling targets.
> Upstream: graphify symbol_resolution.py + extract.py (pin 0.8.38 in .track) — ported at
> revitify's current file→symbol granularity; symbol→symbol call resolution lands in Phase 3.

## Requirement REQUIREMENT_RESOLVE-01 — every edge carries its confidence

WHEN the graph is built THEN structural contains/imports edges SHALL carry
`confidence: "EXTRACTED"`, and WHEN a `name:` reference resolves to exactly one symbol THEN the
edge SHALL carry `confidence: "INFERRED"`.

@check kind=unit ref=test/resolution.test.ts::structural contains/imports edges are EXTRACTED
@check kind=unit ref=test/resolution.test.ts::a uniquely-resolved reference is INFERRED

## Requirement REQUIREMENT_RESOLVE-02 — ambiguity is tagged, never hidden

WHEN a reference has multiple candidate definitions THEN the system SHALL pick deterministically
(same-directory candidates first, then lexicographic id — never insertion order) AND tag the edge
`confidence: "AMBIGUOUS"`.

@check kind=unit ref=test/resolution.test.ts::multiple candidates → AMBIGUOUS, picked deterministically with same-dir preference
@check kind=unit ref=test/resolution.test.ts::the pick is stable across runs

## Requirement REQUIREMENT_RESOLVE-03 — imports resolve against reality

WHEN a relative import spec is extracted THEN the system SHALL resolve it against the walked-file
set (as-written, then runtime-extension swaps, then extensionless completion, then /index.*).

IF a relative import resolves to nothing on disk THEN the system SHALL emit NO edge for it.

@check kind=unit ref=test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets

## Requirement REQUIREMENT_RESOLVE-04 — never ingest your own output

IF a project contains a previous `revitify-out/` (or `graphify-out/`) run THEN the walker SHALL
exclude it, so the graph never ingests its own report.

@check kind=unit ref=test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph
