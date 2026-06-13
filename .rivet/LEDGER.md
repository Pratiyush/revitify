# LEDGER — generated from the journal; do not edit

> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven

## Progress board

**35/35 done (100%)**

- ✅ **REQUIREMENT_CLI-01** the verb surface 🟢
  📋 Evidence — REQUIREMENT_CLI-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::help lists every verb; unknown verb exits 1` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:31.541Z |

- ✅ **REQUIREMENT_CLI-02** verbs work end to end on a real project 🟢
  📋 Evidence — REQUIREMENT_CLI-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:33.562Z |

- ✅ **REQUIREMENT_CLI-03** watch, global, prs 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CLI-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli.test.ts::rebuilds on change (initial build, then incremental)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:34.612Z |
  | `test/cli.test.ts::global merges repos with repo: prefixes` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:35.825Z |
  | `test/cli.test.ts::prs reports diff impact in a git repo` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:37.255Z |

- ✅ **REQUIREMENT_CONTRACT-01** the three artifacts, default revitify-out/ 🟢
  📋 Evidence — REQUIREMENT_CONTRACT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:38.531Z |

- ✅ **REQUIREMENT_CONTRACT-02** Rivet's call shape stays supported forever 🟢
  📋 Evidence — REQUIREMENT_CONTRACT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:39.810Z |

- ✅ **REQUIREMENT_CONTRACT-03** graph fields are additive-only 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CONTRACT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:41.091Z |
  | `test/contract.test.ts::a canonical symbol node carries exactly the contract fields` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:42.377Z |
  | `test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:43.666Z |

- ✅ **REQUIREMENT_CONTRACT-04** refactors never change output bytes 🟢🟢
  📋 Evidence — REQUIREMENT_CONTRACT-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:44.952Z |
  | `test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:46.156Z |

- ✅ **REQUIREMENT_INTEL-01** symbol→symbol call edges 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:47.434Z |
  | `test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:48.721Z |

- ✅ **REQUIREMENT_INTEL-02** tiered resolution precedence 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:49.997Z |
  | `test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:51.287Z |

- ✅ **REQUIREMENT_INTEL-03** near-duplicate doc nodes merge; code never does 🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:52.528Z |
  | `test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:53.529Z |

- ✅ **REQUIREMENT_INTEL-04** structural communities, deterministic 🟢🟢🟢
  📋 Evidence — REQUIREMENT_INTEL-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/intelligence.test.ts::separates the two clusters; deterministic across runs` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:54.740Z |
  | `test/intelligence.test.ts::isolated nodes get their own communities` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:55.942Z |
  | `test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:57.932Z |

- ✅ **REQUIREMENT_MOD-01** registry dispatch, not switches 🟢
  📋 Evidence — REQUIREMENT_MOD-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:30:59.103Z |

- ✅ **REQUIREMENT_MOD-02** the lazy boundary 🟢🟢
  📋 Evidence — REQUIREMENT_MOD-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:00.281Z |
  | `test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:01.457Z |

- ✅ **REQUIREMENT_LANG-01** deep member extraction per language 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_LANG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:02.692Z |
  | `test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:03.927Z |
  | `test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:05.153Z |
  | `test/multilang.test.ts::'from pkg.helpers import slugify' references slugify only — never a phantom 'helpers'` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:06.377Z |

- ✅ **REQUIREMENT_LANG-02** the sync facade is frozen and deterministic 🟢🟢🟢
  📋 Evidence — REQUIREMENT_LANG-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:07.609Z |
  | `test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:08.789Z |
  | `test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:09.974Z |

- ✅ **REQUIREMENT_CACHE-01** per-file cache with honest invalidation 🟢🟢🟢
  📋 Evidence — REQUIREMENT_CACHE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:11.183Z |
  | `test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:12.395Z |
  | `test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:13.611Z |

- ✅ **REQUIREMENT_PAR-01** parallel extraction changes nothing but wall-clock 🟢
  📋 Evidence — REQUIREMENT_PAR-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:14.884Z |

- ✅ **REQUIREMENT_MM-01** the offline gate is absolute 🟢
  📋 Evidence — REQUIREMENT_MM-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:16.102Z |

- ✅ **REQUIREMENT_MM-02** backend autodetection mirrors llm.py 🟢🟢🟢
  📋 Evidence — REQUIREMENT_MM-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::anthropic → gemini → openai → ollama → none` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:17.316Z |
  | `test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:18.527Z |
  | `test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:19.753Z |

- ✅ **REQUIREMENT_MM-03** offline schema/deps ingestion 🟢🟢
  📋 Evidence — REQUIREMENT_MM-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:20.987Z |
  | `test/multimodal.test.ts::crate + dependency edges from Cargo.toml` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:22.213Z |

- ✅ **REQUIREMENT_MM-04** local tools never become hard dependencies 🟢🟢
  📋 Evidence — REQUIREMENT_MM-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:23.435Z |
  | `test/multimodal.test.ts::detect + available are honest` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:24.661Z |

- ✅ **REQUIREMENT_QUERY-01** path, neighborhood, affected 🟢🟢
  📋 Evidence — REQUIREMENT_QUERY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::finds the shortest path between symbols across files` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:25.912Z |
  | `test/query.test.ts::walks reverse dependencies transitively` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:27.172Z |

- ✅ **REQUIREMENT_QUERY-02** search, explain, communities, log 🟢🟢🟢
  📋 Evidence — REQUIREMENT_QUERY-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::idf-ranks matches and explains with neighbors` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:28.426Z |
  | `test/query.test.ts::lists communities with size and cohesion in [0,1]` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:29.672Z |
  | `test/query.test.ts::appends JSONL entries` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:30.941Z |

- ✅ **REQUIREMENT_EXPORT-01** the graphify export family 🟢🟢
  📋 Evidence — REQUIREMENT_EXPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:32.194Z |
  | `test/query.test.ts::exporters survive an empty graph` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:33.446Z |

- ✅ **REQUIREMENT_REPORT-01** why-nodes 🟢🟢
  📋 Evidence — REQUIREMENT_REPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:34.661Z |
  | `test/report.test.ts::python: docstrings and HACK comments via tree-sitter` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:35.880Z |

- ✅ **REQUIREMENT_REPORT-02** god nodes are symbols, not containers 🟢
  📋 Evidence — REQUIREMENT_REPORT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:37.089Z |

- ✅ **REQUIREMENT_REPORT-03** the report carries its intelligence 🟢🟢
  📋 Evidence — REQUIREMENT_REPORT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:38.294Z |
  | `test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:39.509Z |

- ✅ **REQUIREMENT_RESOLVE-01** every edge carries its confidence 🟢🟢
  📋 Evidence — REQUIREMENT_RESOLVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::structural contains/imports edges are EXTRACTED` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:40.729Z |
  | `test/resolution.test.ts::a uniquely-resolved reference is INFERRED` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:41.936Z |

- ✅ **REQUIREMENT_RESOLVE-02** ambiguity is tagged, never hidden 🟢🟢🟢
  📋 Evidence — REQUIREMENT_RESOLVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:43.149Z |
  | `test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:44.358Z |
  | `test/resolution.test.ts::the pick is stable across runs` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:45.565Z |

- ✅ **REQUIREMENT_RESOLVE-03** imports resolve against reality 🟢
  📋 Evidence — REQUIREMENT_RESOLVE-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:47.990Z |

- ✅ **REQUIREMENT_RESOLVE-04** never ingest your own output 🟢
  📋 Evidence — REQUIREMENT_RESOLVE-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:49.196Z |

- ✅ **REQUIREMENT_SERVE-01** HTTP viewer + API, traversal-proof 🟢🟢🟢
  📋 Evidence — REQUIREMENT_SERVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:50.484Z |
  | `test/serve.test.ts::answers the API routes` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:51.760Z |
  | `test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:53.034Z |

- ✅ **REQUIREMENT_SERVE-02** the 7 MCP tools 🟢
  📋 Evidence — REQUIREMENT_SERVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:54.308Z |

- ✅ **REQUIREMENT_SERVE-03** skill + self-checks 🟢
  📋 Evidence — REQUIREMENT_SERVE-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/serve.test.ts::install drops the skill; diagnose reports grammars` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:55.703Z |

- ✅ **REQUIREMENT_VIEWER-01** the redesigned graph.html stays offline 🟢🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_VIEWER-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:56.916Z |
  | `test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:58.123Z |
  | `test/viewer.test.ts::escapes </script> sequences in data` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:31:59.342Z |
  | `test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:32:00.545Z |
  | `test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)` | unit | ✅ green | tree a2d62203* | 2026-06-13T13:32:01.759Z |


## Approvals & governance

- _none recorded yet_

## Recent activity

- [2m2026-06-13 13:32:26[22m  🧾 task done REQUIREMENT_RESOLVE-04  [Pratiyush Kumar Singh]
- [2m2026-06-13 13:32:26[22m  🏁 task REQUIREMENT_RESOLVE-04 → done
- [2m2026-06-13 13:32:26[22m  🧾 task done REQUIREMENT_SERVE-01  [Pratiyush Kumar Singh]
- [2m2026-06-13 13:32:26[22m  🏁 task REQUIREMENT_SERVE-01 → done
- [2m2026-06-13 13:32:27[22m  🧾 task done REQUIREMENT_SERVE-02  [Pratiyush Kumar Singh]
- [2m2026-06-13 13:32:27[22m  🏁 task REQUIREMENT_SERVE-02 → done
- [2m2026-06-13 13:32:27[22m  🧾 task done REQUIREMENT_SERVE-03  [Pratiyush Kumar Singh]
- [2m2026-06-13 13:32:27[22m  🏁 task REQUIREMENT_SERVE-03 → done
- [2m2026-06-13 13:32:28[22m  🧾 task done REQUIREMENT_VIEWER-01  [Pratiyush Kumar Singh]
- [2m2026-06-13 13:32:28[22m  🏁 task REQUIREMENT_VIEWER-01 → done
