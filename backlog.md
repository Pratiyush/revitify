# Backlog — revitify

Pending technical work that an agent or contributor can pick up. Maintainer-only actions live in
[human-backlog.md](human-backlog.md); fuller rationale is in `future-backlog.md` and `docs/REVIEW.md`.
**Nothing here blocks use** — `graph.json` is byte-stable, the contract holds, CI (`pnpm check`) is green.

## Now / next

- [ ] **Triage open Dependabot PRs** (several open) — confirm `pnpm check` is green on each before merge.
  The TypeScript major bump especially: verify build + tests on its PR first.

## Quality / hardening (optional — P2/P3, none correctness-blocking)

- [ ] **P2·cluster** — cap Louvain re-split rounds or memoize `cohesion()` (the only uncapped algorithm;
  quadratic corner on one giant community). `passes/cluster.ts`
- [ ] **P2·html-guard** — wrap `html.ts` asset injection in try/catch → emit a minimal stub so a missing
  viewer dep can't kill the contract artifact `graph.html`. `export/html.ts`
- [ ] **P2·log-leak** — audit that no code logs request URLs (the Gemini key rides the querystring).
  `ingest/llm/backends.ts`
- [ ] **P2·minhash** — draw 61-bit BigInt permutation coefficients (current `rand()*2^61` loses the low
  ~9 bits → noisier Jaccard on borderline pairs). `passes/dedup/minhash.ts`
- [ ] **P3·html-esc** — share the display-escape helper across the TS/browser boundary. `export/*`

## Larger / deferred (see `future-backlog.md` §3)

- [ ] Adopt `buildGraphAsync` in dev-spec-kit (the async-migration follow-on).
- [ ] Configurable excludes (arrives with `buildGraphAsync` options).
- [ ] Binary PDF/image semantic extraction; live Postgres introspection; Swift grammar (when its npm
  package ships a `.wasm`).
