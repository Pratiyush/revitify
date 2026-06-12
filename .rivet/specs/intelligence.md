# Feature: Three-pass intelligence (Phase 3)

> User story: As a graph consumer, I want call edges between symbols, proximity-ranked
> resolution, duplicate-free doc nodes, and structural communities, so the graph reflects how
> the code actually hangs together. Upstream: symbol_resolution.py, dedup.py + _minhash.py
> (num_perm=128, 3-gram, 0.7 LSH, Jaro-Winkler 0.92), cluster.py (Louvain fallback path +
> connectivity refinement + >25%/min-10 and <0.05-cohesion/min-50 re-splits) @ 0.8.38.

## Requirement REQUIREMENT_INTEL-01 — symbol→symbol call edges

WHEN a callable's body calls another in-project symbol THEN a `calls` edge SHALL connect the
two symbols (not their files), confidence-tagged by resolution; built-ins and externals SHALL
leave no edge.

@check kind=unit ref=test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged
@check kind=unit ref=test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge

## Requirement REQUIREMENT_INTEL-02 — tiered resolution precedence

WHEN a name has multiple candidate definitions THEN resolution SHALL prefer same-file, then
same-directory, then global; a unique candidate in the winning tier is INFERRED, ties within
it are AMBIGUOUS with a lexicographic pick.

@check kind=unit ref=test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED
@check kind=unit ref=test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick

## Requirement REQUIREMENT_INTEL-03 — near-duplicate doc nodes merge; code never does

WHEN two doc nodes' normalized labels are minhash-near (≥0.7) AND Jaro-Winkler-confirmed
(≥0.92) THEN they SHALL merge into the first-seen node with links rewritten and exact
(source, target, relation) duplicates dropped; identical CODE labels SHALL never merge.

@check kind=unit ref=test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols
@check kind=unit ref=test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop

## Requirement REQUIREMENT_INTEL-04 — structural communities, deterministic

WHEN the graph clusters THEN dense subgraphs SHALL separate at their bridges (Louvain +
connectivity refinement), isolated nodes SHALL keep singleton communities, oversized
communities (>25%, ≥10) SHALL re-split, and two runs SHALL produce identical assignments.

@check kind=unit ref=test/intelligence.test.ts::separates the two clusters; deterministic across runs
@check kind=unit ref=test/intelligence.test.ts::isolated nodes get their own communities
@check kind=unit ref=test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)

Scenario: a structureless giant cannot be force-split (negative floor)
  Given a 12-node clique holding >25% of the graph
  When the oversized re-split runs Louvain on its subgraph
  Then the clique stays one community — re-splitting requires real substructure, never fiat
