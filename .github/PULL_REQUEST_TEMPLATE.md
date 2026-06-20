<!-- Thanks for contributing to revitify! Keep this PR scoped to one change. -->

## What & why

<!-- What does this change do, and why? Link any issue: Closes #123 -->

## Type of change

- [ ] Bug fix
- [ ] New language / exporter
- [ ] New feature
- [ ] Refactor (no behavior change)
- [ ] Docs / website

## Checklist

- [ ] `pnpm check` passes (build · lint · knip · depcruise · test:coverage)
- [ ] New behavior has a behavior-asserting test (rule → test → proof)
- [ ] **Output contract** unchanged, or changed **additively only** (`graph.json` field names are frozen)
- [ ] **Determinism** preserved — output stays byte-stable (no new ordering nondeterminism)
- [ ] Layer boundaries respected (`pnpm depcruise` clean)
- [ ] Docs / website updated if user-facing

## Notes for the reviewer

<!-- Anything non-obvious: trade-offs, follow-ups, parity impact. -->
