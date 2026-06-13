# LEDGER — generated from the journal; do not edit

> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven

## Progress board

**35/35 done (100%)**

- ✅ **REQUIREMENT_CLI-01** the verb surface 🟢
  📋 Evidence — REQUIREMENT_CLI-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::help lists every verb; unknown verb exits 1` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:48.010Z |

- ✅ **REQUIREMENT_CLI-02** verbs work end to end on a real project 🟢
  📋 Evidence — REQUIREMENT_CLI-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:49.946Z |

- ✅ **REQUIREMENT_CLI-03** watch, global, prs 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CLI-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::rebuilds on change (initial build, then incremental)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:50.943Z |
  | `test/cli.test.ts::global merges repos with repo: prefixes` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:52.079Z |
  | `test/cli.test.ts::prs reports diff impact in a git repo` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:53.454Z |

- ✅ **REQUIREMENT_CONTRACT-01** the three artifacts, default revitify-out/ 🟢
  📋 Evidence — REQUIREMENT_CONTRACT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:54.678Z |

- ✅ **REQUIREMENT_CONTRACT-02** Rivet's call shape stays supported forever 🟢
  📋 Evidence — REQUIREMENT_CONTRACT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:55.914Z |

- ✅ **REQUIREMENT_CONTRACT-03** graph fields are additive-only 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CONTRACT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:57.143Z |
  | `test/contract.test.ts::a canonical symbol node carries exactly the contract fields` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:58.375Z |
  | `test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:40:59.613Z |

- ✅ **REQUIREMENT_CONTRACT-04** refactors never change output bytes 🟢🟢
  📋 Evidence — REQUIREMENT_CONTRACT-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:00.839Z |
  | `test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:01.994Z |

- ✅ **REQUIREMENT_INTEL-01** symbol→symbol call edges 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:03.300Z |
  | `test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:04.598Z |

- ✅ **REQUIREMENT_INTEL-02** tiered resolution precedence 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:05.913Z |
  | `test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:07.223Z |

- ✅ **REQUIREMENT_INTEL-03** near-duplicate doc nodes merge; code never does 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:08.526Z |
  | `test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:09.598Z |

- ✅ **REQUIREMENT_INTEL-04** structural communities, deterministic 🟢🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::separates the two clusters; deterministic across runs` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:10.891Z |
  | `test/intelligence.test.ts::isolated nodes get their own communities` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:12.158Z |
  | `test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:14.183Z |

- ✅ **REQUIREMENT_MOD-01** registry dispatch, not switches 🟢
  📋 Evidence — REQUIREMENT_MOD-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:15.361Z |

- ✅ **REQUIREMENT_MOD-02** the lazy boundary 🟢🟢
  📋 Evidence — REQUIREMENT_MOD-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:16.547Z |
  | `test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:17.745Z |

- ✅ **REQUIREMENT_LANG-01** deep member extraction per language 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_LANG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:19.004Z |
  | `test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:20.255Z |
  | `test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:21.509Z |
  | `test/multilang.test.ts::'from pkg.helpers import slugify' references slugify only — never a phantom 'helpers'` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:22.746Z |

- ✅ **REQUIREMENT_LANG-02** the sync facade is frozen and deterministic 🟢🟢🟢
  📋 Evidence — REQUIREMENT_LANG-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:23.998Z |
  | `test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:25.195Z |
  | `test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:26.393Z |

- ✅ **REQUIREMENT_CACHE-01** per-file cache with honest invalidation 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CACHE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:27.638Z |
  | `test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:28.870Z |
  | `test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:30.106Z |

- ✅ **REQUIREMENT_PAR-01** parallel extraction changes nothing but wall-clock 🟢
  📋 Evidence — REQUIREMENT_PAR-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:31.413Z |

- ✅ **REQUIREMENT_MM-01** the offline gate is absolute 🟢
  📋 Evidence — REQUIREMENT_MM-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:32.657Z |

- ✅ **REQUIREMENT_MM-02** backend autodetection mirrors llm.py 🟢🟢🟢
  📋 Evidence — REQUIREMENT_MM-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::anthropic → gemini → openai → ollama → none` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:33.892Z |
  | `test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:35.129Z |
  | `test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:36.371Z |

- ✅ **REQUIREMENT_MM-03** offline schema/deps ingestion 🟢🟢
  📋 Evidence — REQUIREMENT_MM-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:37.613Z |
  | `test/multimodal.test.ts::crate + dependency edges from Cargo.toml` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:38.841Z |

- ✅ **REQUIREMENT_MM-04** local tools never become hard dependencies 🟢🟢
  📋 Evidence — REQUIREMENT_MM-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:40.075Z |
  | `test/multimodal.test.ts::detect + available are honest` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:41.311Z |

- ✅ **REQUIREMENT_QUERY-01** path, neighborhood, affected 🟢🟢
  📋 Evidence — REQUIREMENT_QUERY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::finds the shortest path between symbols across files` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:42.571Z |
  | `test/query.test.ts::walks reverse dependencies transitively` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:43.836Z |

- ✅ **REQUIREMENT_QUERY-02** search, explain, communities, log 🟢🟢🟢
  📋 Evidence — REQUIREMENT_QUERY-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::idf-ranks matches and explains with neighbors` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:45.105Z |
  | `test/query.test.ts::lists communities with size and cohesion in [0,1]` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:46.385Z |
  | `test/query.test.ts::appends JSONL entries` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:47.676Z |

- ✅ **REQUIREMENT_EXPORT-01** the graphify export family 🟢🟢
  📋 Evidence — REQUIREMENT_EXPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:48.944Z |
  | `test/query.test.ts::exporters survive an empty graph` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:50.210Z |

- ✅ **REQUIREMENT_REPORT-01** why-nodes 🟢🟢
  📋 Evidence — REQUIREMENT_REPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:51.433Z |
  | `test/report.test.ts::python: docstrings and HACK comments via tree-sitter` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:52.667Z |

- ✅ **REQUIREMENT_REPORT-02** god nodes are symbols, not containers 🟢
  📋 Evidence — REQUIREMENT_REPORT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:53.888Z |

- ✅ **REQUIREMENT_REPORT-03** the report carries its intelligence 🟢🟢
  📋 Evidence — REQUIREMENT_REPORT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:55.103Z |
  | `test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:56.330Z |

- ✅ **REQUIREMENT_RESOLVE-01** every edge carries its confidence 🟢🟢
  📋 Evidence — REQUIREMENT_RESOLVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::structural contains/imports edges are EXTRACTED` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:57.557Z |
  | `test/resolution.test.ts::a uniquely-resolved reference is INFERRED` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:41:58.783Z |

- ✅ **REQUIREMENT_RESOLVE-02** ambiguity is tagged, never hidden 🟢🟢🟢
  📋 Evidence — REQUIREMENT_RESOLVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:00.001Z |
  | `test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:01.223Z |
  | `test/resolution.test.ts::the pick is stable across runs` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:02.449Z |

- ✅ **REQUIREMENT_RESOLVE-03** imports resolve against reality 🟢
  📋 Evidence — REQUIREMENT_RESOLVE-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:04.918Z |

- ✅ **REQUIREMENT_RESOLVE-04** never ingest your own output 🟢
  📋 Evidence — REQUIREMENT_RESOLVE-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:06.132Z |

- ✅ **REQUIREMENT_SERVE-01** HTTP viewer + API, traversal-proof 🟢🟢🟢
  📋 Evidence — REQUIREMENT_SERVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:07.429Z |
  | `test/serve.test.ts::answers the API routes` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:08.715Z |
  | `test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:09.992Z |

- ✅ **REQUIREMENT_SERVE-02** the 7 MCP tools 🟢
  📋 Evidence — REQUIREMENT_SERVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:11.265Z |

- ✅ **REQUIREMENT_SERVE-03** skill + self-checks 🟢
  📋 Evidence — REQUIREMENT_SERVE-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::install drops the skill; diagnose reports grammars` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:12.662Z |

- ✅ **REQUIREMENT_VIEWER-01** the redesigned graph.html stays offline 🟢🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_VIEWER-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:13.874Z |
  | `test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:15.084Z |
  | `test/viewer.test.ts::escapes </script> sequences in data` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:16.287Z |
  | `test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:17.498Z |
  | `test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)` | unit | ✅ green | tree 675351d7* | 2026-06-13T08:42:18.704Z |


## Approvals & governance

- _none recorded yet_

## Recent activity

- [2m2026-06-13 08:42:42[22m  🧾 task done REQUIREMENT_RESOLVE-04  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:42:42[22m  🏁 task REQUIREMENT_RESOLVE-04 → done
- [2m2026-06-13 08:42:42[22m  🧾 task done REQUIREMENT_SERVE-01  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:42:42[22m  🏁 task REQUIREMENT_SERVE-01 → done
- [2m2026-06-13 08:42:43[22m  🧾 task done REQUIREMENT_SERVE-02  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:42:43[22m  🏁 task REQUIREMENT_SERVE-02 → done
- [2m2026-06-13 08:42:43[22m  🧾 task done REQUIREMENT_SERVE-03  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:42:43[22m  🏁 task REQUIREMENT_SERVE-03 → done
- [2m2026-06-13 08:42:44[22m  🧾 task done REQUIREMENT_VIEWER-01  [Pratiyush Kumar Singh]
- [2m2026-06-13 08:42:44[22m  🏁 task REQUIREMENT_VIEWER-01 → done
