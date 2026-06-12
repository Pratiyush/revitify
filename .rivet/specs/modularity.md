# Feature: Modular engine with enforced layer boundaries

> User story: As the maintainer, I want the engine split into registry-backed layers with
> machine-enforced import boundaries, so that adding a language/ingestor/exporter is a new module
> — never an edit to a switch — and modularity is measurable, not claimed (graphify has no
> boundary enforcement; revitify's is CI-fatal).
> Intake: docs/PLAN.md Phase 1 (decisions locked 2026-06-12).

## Requirement REQUIREMENT_MOD-01 — registry dispatch, not switches

WHEN a file is ingested THEN the system SHALL pick its extractor via the ordered registration
array (extension pre-filter, then detect()), and WHEN no registration matches (e.g. `.d.ts`,
unknown extensions) THEN the system SHALL skip the file rather than fail.

@check kind=unit ref=test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files

## Requirement REQUIREMENT_MOD-02 — the lazy boundary

WHEN a registration provides only `load()` (a heavy/lazy module) THEN `resolveSync` SHALL return
undefined (sync facade skips it) and `resolve()` SHALL load it once and memoize.

@check kind=unit ref=test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync

Scenario: a forbidden cross-layer import fails CI, not code review (negative floor)
  Given a source file in src/model/ importing from src/export/
  When `pnpm depcruise` runs (the layer matrix in .dependency-cruiser.cjs)
  Then the build fails naming the violating edge
  And the same gate forbids circular imports, orphans, and node:* inside src/model/
