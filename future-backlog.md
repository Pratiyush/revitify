# Future backlog — revitify

> What's left, after the REVIEW.md depth-needed roadmap shipped (C1 fix · hardening pass · **D2** ids ·
> **D1** finalize/extract · **#4** GraphIndex.adj · **#5** contract/scale docs + cohesion test).
> Compiled 2026-06-14 from `docs/REVIEW.md`, `PARITY.md`, `FEATURE-COVERAGE.md`, `docs/PLAN.md`.
>
> **Nothing here blocks use.** `graph.json` is byte-stable, the output contract holds, the Rivet trace
> is 35/35 proven, and every gate (build · biome · knip · dependency-cruiser · 118 tests) is green.
> Priority: **P1** = real friction / latent bug · **P2** = hardening & polish · **—** = by design / external.

## 1. Open code backlog (optional — quality, not correctness-blocking)

| # | Item | Pri | Effort | Where | Fix |
|---|---|---|---|---|---|
| **P1·dup** | HTTP & MCP reimplement the same 7-op query surface twice and have **drifted** — `god_nodes` returns **5** via HTTP vs **10** via MCP; search limit **8** vs **10**. The one latent inconsistency bug. | P1 | M | `serve/http.ts`, `serve/mcp.ts` | Extract `serve/handlers.ts` (protocol-agnostic, returns plain data); HTTP→JSON, MCP→`text()`; centralize the limits. |
| **P2·cluster** | Louvain re-split is the only **uncapped** algorithm — quadratic corner on one giant weakly-connected community. | P2 | M | `passes/cluster.ts` | Cap rounds or memoize `cohesion()`. |
| **P2·html-esc** | Three inline HTML-escape strategies across exporters + the `<!doctype>`/dark-theme boilerplate duplicated twice. | P2 | S | `export/*` | One shared escape helper + one shell. |
| **P2·html-guard** | `html.ts` asset injection is unguarded → a missing viewer dep kills the **contract artifact** `graph.html`. | P2 | S | `export/html.ts` | Wrap in try/catch → emit a minimal stub. |
| **P2·ssrf** | Ollama / `WHISPER_CPP` honor an unvalidated env host/binary (SSRF-shaped, operator-controlled). | P2 | S | `ingest/llm/backends.ts`, `ingest/tools/local.ts` | Validate scheme / binary. |
| **P2·log-leak** | Gemini key rides the URL querystring (latent log-leak; an upstream API constraint). | P2 | S | `ingest/llm/backends.ts` | Audit that no code logs request URLs. |
| **P2·minhash** | Permutation coefficients drawn via `rand()*2^61` — above `MAX_SAFE_INTEGER`, so 127/128 lose their low ~9 bits → noisier Jaccard estimate on borderline pairs (LSH still correct; identical inputs still collide). | P2 | S | `passes/dedup/minhash.ts` | Draw 61-bit BigInt coefficients directly. |
| **P2·ts-calls** | `collectCalls` misses element-access calls (`obj["x"]()`) and tagged templates → widens the sync/async gap (S1). | P2 | S | `extract/typescript.ts` | Handle `ElementAccessExpression` + `TaggedTemplateExpression` callees. |
| **P2·docs** | Help text says "9 exporters" (it's 8); `graph-lite` missing from `export` help; the hidden multi-verb dispatch (query/serve own 5+2 verbs) lacks header comments. | P2 | S | `cli/*` | Cosmetic. |

## 2. Human-gated (needs you — I can't do these)

| # | Item | Status | Notes |
|---|---|---|---|
| **HG-1** | GitHub push | Blocked | Permission policy: an agent-created remote needs explicit user action — `gh repo create revitify --private --source . --push`. |
| **HG-2** | npm publish | Prep ✅, publish pending | LICENSE, files allowlist, exports map, and `pack` dry-run are all green. Publishing is your call. |

## 3. Deferred by decision / by design (rationale recorded — not bugs)

| # | Item | Why deferred |
|---|---|---|
| **parity-nodes** | Node count 528 vs 900 (59%) — the one red PARITY band | Deliberate divergence: graphify fabricates nodes for referenced out-of-project types (`String` etc.); revitify links references instead. Every other band passes (links 84%, relation types, communities, god-node overlap, contract). |
| **rivet-async** | Rivet → `revitifyAsync` migration | "Add the learning later." The sync facade is frozen for Rivet; the async migration is a recorded follow-up in `llm-dev-kit`. |
| **excludes** | Configurable excludes | Arrives with `buildGraphAsync` options. |
| **pdf-binary** | Binary PDF/image semantic extraction | 🟡 path-context only; printable docs ride along (first 4k). Real binary extraction punted. |
| **psql-live** | Live Postgres introspection | 🟡 offline DDL parsing only — a DB connection is not a file walk. |
| **cargo-meta** | `cargo metadata` enrichment | 🟡 Cargo.toml parse already gives the full edge set; metadata would add only version strings. |
| **swift** | Swift extraction | ⏳ its npm grammar package ships no `.wasm`. |
| **mcp-ingest** | `mcp_ingest.py` / Google Workspace ingestion | ⏳ niche upstream surface; revisit on demand. |
| **html-overhaul** | graph.html renderer overhaul | Largely addressed by the Cytoscape redesign; not separately planned. |

---

**Suggested next pickup:** **P1·dup** — it's the only remaining item with an actual behavior bug (the
HTTP/MCP drift), and the `serve/handlers.ts` extraction also kills a real duplication. Everything else
in §1 is independent, low-risk polish that can be done in any order or batched into one hardening pass.
