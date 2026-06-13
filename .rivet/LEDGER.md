# LEDGER — generated from the journal; do not edit

> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven

## Progress board

**35/35 done (100%)**

- ✅ **REQUIREMENT_CLI-01** the verb surface 🟢
  📋 Evidence — REQUIREMENT_CLI-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::help lists every verb; unknown verb exits 1` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:07.842Z |

- ✅ **REQUIREMENT_CLI-02** verbs work end to end on a real project 🟢
  📋 Evidence — REQUIREMENT_CLI-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:09.727Z |

- ✅ **REQUIREMENT_CLI-03** watch, global, prs 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CLI-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::rebuilds on change (initial build, then incremental)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:10.696Z |
  | `test/cli.test.ts::global merges repos with repo: prefixes` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:11.822Z |
  | `test/cli.test.ts::prs reports diff impact in a git repo` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:13.179Z |

- ✅ **REQUIREMENT_CONTRACT-01** the three artifacts, default revitify-out/ 🟢
  📋 Evidence — REQUIREMENT_CONTRACT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:14.423Z |

- ✅ **REQUIREMENT_CONTRACT-02** Rivet's call shape stays supported forever 🟢
  📋 Evidence — REQUIREMENT_CONTRACT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:15.647Z |

- ✅ **REQUIREMENT_CONTRACT-03** graph fields are additive-only 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CONTRACT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:16.880Z |
  | `test/contract.test.ts::a canonical symbol node carries exactly the contract fields` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:18.103Z |
  | `test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:19.336Z |

- ✅ **REQUIREMENT_CONTRACT-04** refactors never change output bytes 🟢🟢
  📋 Evidence — REQUIREMENT_CONTRACT-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:20.578Z |
  | `test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:21.749Z |

- ✅ **REQUIREMENT_INTEL-01** symbol→symbol call edges 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:22.977Z |
  | `test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:24.216Z |

- ✅ **REQUIREMENT_INTEL-02** tiered resolution precedence 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:25.437Z |
  | `test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:26.678Z |

- ✅ **REQUIREMENT_INTEL-03** near-duplicate doc nodes merge; code never does 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:27.916Z |
  | `test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:28.913Z |

- ✅ **REQUIREMENT_INTEL-04** structural communities, deterministic 🟢🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::separates the two clusters; deterministic across runs` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:30.130Z |
  | `test/intelligence.test.ts::isolated nodes get their own communities` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:31.366Z |
  | `test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:33.368Z |

- ✅ **REQUIREMENT_MOD-01** registry dispatch, not switches 🟢
  📋 Evidence — REQUIREMENT_MOD-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:34.555Z |

- ✅ **REQUIREMENT_MOD-02** the lazy boundary 🟢🟢
  📋 Evidence — REQUIREMENT_MOD-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:35.735Z |
  | `test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:36.926Z |

- ✅ **REQUIREMENT_LANG-01** deep member extraction per language 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_LANG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:38.186Z |
  | `test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:39.431Z |
  | `test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:40.689Z |
  | `test/multilang.test.ts::'from pkg.helpers import slugify' references slugify only — never a phantom 'helpers'` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:41.930Z |

- ✅ **REQUIREMENT_LANG-02** the sync facade is frozen and deterministic 🟢🟢🟢
  📋 Evidence — REQUIREMENT_LANG-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:43.198Z |
  | `test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:44.397Z |
  | `test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:45.597Z |

- ✅ **REQUIREMENT_CACHE-01** per-file cache with honest invalidation 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CACHE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:46.836Z |
  | `test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:48.069Z |
  | `test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:49.345Z |

- ✅ **REQUIREMENT_PAR-01** parallel extraction changes nothing but wall-clock 🟢
  📋 Evidence — REQUIREMENT_PAR-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:50.675Z |

- ✅ **REQUIREMENT_MM-01** the offline gate is absolute 🟢
  📋 Evidence — REQUIREMENT_MM-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:51.926Z |

- ✅ **REQUIREMENT_MM-02** backend autodetection mirrors llm.py 🟢🟢🟢
  📋 Evidence — REQUIREMENT_MM-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::anthropic → gemini → openai → ollama → none` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:53.162Z |
  | `test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:54.430Z |
  | `test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:55.672Z |

- ✅ **REQUIREMENT_MM-03** offline schema/deps ingestion 🟢🟢
  📋 Evidence — REQUIREMENT_MM-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:56.905Z |
  | `test/multimodal.test.ts::crate + dependency edges from Cargo.toml` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:58.148Z |

- ✅ **REQUIREMENT_MM-04** local tools never become hard dependencies 🟢🟢
  📋 Evidence — REQUIREMENT_MM-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:02:59.389Z |
  | `test/multimodal.test.ts::detect + available are honest` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:00.643Z |

- ✅ **REQUIREMENT_QUERY-01** path, neighborhood, affected 🟢🟢
  📋 Evidence — REQUIREMENT_QUERY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::finds the shortest path between symbols across files` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:01.919Z |
  | `test/query.test.ts::walks reverse dependencies transitively` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:03.201Z |

- ✅ **REQUIREMENT_QUERY-02** search, explain, communities, log 🟢🟢🟢
  📋 Evidence — REQUIREMENT_QUERY-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::idf-ranks matches and explains with neighbors` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:04.487Z |
  | `test/query.test.ts::lists communities with size and cohesion in [0,1]` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:05.739Z |
  | `test/query.test.ts::appends JSONL entries` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:07.007Z |

- ✅ **REQUIREMENT_EXPORT-01** the graphify export family 🟢🟢
  📋 Evidence — REQUIREMENT_EXPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:08.298Z |
  | `test/query.test.ts::exporters survive an empty graph` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:09.573Z |

- ✅ **REQUIREMENT_REPORT-01** why-nodes 🟢🟢
  📋 Evidence — REQUIREMENT_REPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:10.824Z |
  | `test/report.test.ts::python: docstrings and HACK comments via tree-sitter` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:12.084Z |

- ✅ **REQUIREMENT_REPORT-02** god nodes are symbols, not containers 🟢
  📋 Evidence — REQUIREMENT_REPORT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:13.307Z |

- ✅ **REQUIREMENT_REPORT-03** the report carries its intelligence 🟢🟢
  📋 Evidence — REQUIREMENT_REPORT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:14.521Z |
  | `test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:15.755Z |

- ✅ **REQUIREMENT_RESOLVE-01** every edge carries its confidence 🟢🟢
  📋 Evidence — REQUIREMENT_RESOLVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::structural contains/imports edges are EXTRACTED` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:16.980Z |
  | `test/resolution.test.ts::a uniquely-resolved reference is INFERRED` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:18.210Z |

- ✅ **REQUIREMENT_RESOLVE-02** ambiguity is tagged, never hidden 🟢🟢🟢
  📋 Evidence — REQUIREMENT_RESOLVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:19.448Z |
  | `test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:20.666Z |
  | `test/resolution.test.ts::the pick is stable across runs` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:21.897Z |

- ✅ **REQUIREMENT_RESOLVE-03** imports resolve against reality 🟢
  📋 Evidence — REQUIREMENT_RESOLVE-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:24.386Z |

- ✅ **REQUIREMENT_RESOLVE-04** never ingest your own output 🟢
  📋 Evidence — REQUIREMENT_RESOLVE-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:25.610Z |

- ✅ **REQUIREMENT_SERVE-01** HTTP viewer + API, traversal-proof 🟢🟢🟢
  📋 Evidence — REQUIREMENT_SERVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:26.917Z |
  | `test/serve.test.ts::answers the API routes` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:28.255Z |
  | `test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:29.552Z |

- ✅ **REQUIREMENT_SERVE-02** the 7 MCP tools 🟢
  📋 Evidence — REQUIREMENT_SERVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:30.875Z |

- ✅ **REQUIREMENT_SERVE-03** skill + self-checks 🟢
  📋 Evidence — REQUIREMENT_SERVE-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::install drops the skill; diagnose reports grammars` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:32.313Z |

- ✅ **REQUIREMENT_VIEWER-01** the redesigned graph.html stays offline 🟢🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_VIEWER-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:33.556Z |
  | `test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:34.789Z |
  | `test/viewer.test.ts::escapes </script> sequences in data` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:36.028Z |
  | `test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:37.270Z |
  | `test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)` | unit | ✅ green | tree ff84a280* | 2026-06-13T08:03:38.529Z |


## Approvals & governance

- _none recorded yet_

## Recent activity

- [2m2026-06-13 08:04:04[22m  🧾 task done REQUIREMENT_RESOLVE-04  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:04:04[22m  🏁 task REQUIREMENT_RESOLVE-04 → done
- [2m2026-06-13 08:04:05[22m  🧾 task done REQUIREMENT_SERVE-01  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:04:05[22m  🏁 task REQUIREMENT_SERVE-01 → done
- [2m2026-06-13 08:04:05[22m  🧾 task done REQUIREMENT_SERVE-02  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:04:06[22m  🏁 task REQUIREMENT_SERVE-02 → done
- [2m2026-06-13 08:04:06[22m  🧾 task done REQUIREMENT_SERVE-03  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:04:06[22m  🏁 task REQUIREMENT_SERVE-03 → done
- [2m2026-06-13 08:04:07[22m  🧾 task done REQUIREMENT_VIEWER-01  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:04:07[22m  🏁 task REQUIREMENT_VIEWER-01 → done
