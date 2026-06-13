window.RIVET = {
  "meta": {
    "project": "rivet",
    "tagline": "evidence-bound delivery",
    "configPath": ".rivet/config.json",
    "generatedAt": "2026-06-13T05:49:53.249Z",
    "serverMode": false,
    "refreshSeconds": 15,
    "inFlightTasks": []
  },
  "nav": [
    {
      "group": "Dashboard",
      "mode": "dashboard",
      "items": [
        {
          "id": "overview",
          "label": "Overview",
          "icon": "◎"
        },
        {
          "id": "tasks",
          "label": "Tasks",
          "icon": "✅"
        },
        {
          "id": "requirements",
          "label": "Requirements",
          "icon": "📐"
        },
        {
          "id": "graph",
          "label": "Graph",
          "icon": "🕸️"
        },
        {
          "id": "activity",
          "label": "Activity",
          "icon": "🧾"
        },
        {
          "id": "files",
          "label": "Artifacts",
          "icon": "📁"
        }
      ]
    },
    {
      "group": "Config",
      "mode": "config",
      "items": "@sections"
    }
  ],
  "dashboard": {
    "completion": {
      "done": 35,
      "total": 35
    },
    "validates": {
      "green": 73,
      "red": 0,
      "stale": 0,
      "unproven": 0
    },
    "drift": 0,
    "graphHtml": null,
    "tasks": [
      {
        "id": "REQUIREMENT_CLI-01",
        "title": "the verb surface",
        "status": "done",
        "boundChecks": [
          "test/cli.test.ts::help lists every verb; unknown verb exits 1"
        ],
        "results": {
          "test/cli.test.ts::--help lists verbs; unknown verb exits 1": {
            "passed": false,
            "at": "2026-06-13T05:42:09.901Z",
            "kind": "unit",
            "tail": "ers/pratiyush/Github/revitify/.claude/worktrees/rivet-realign/\u001b[39mnode_modules/\u001b[4m.pnpm\u001b[24m/vitest@4.1.8_@types+node@22.19.21_@vitest+coverage-v8@4.1.8_vite@8.0.16_@types+node@22.19.21_jiti@2.7.0_yaml@2.9.0_/node_modules/\u001b[4mvitest\u001b[24m/dist/chunks/cac.C9xsMMkH.js:406:17\u001b[90m)\u001b[39m\n    at CAC.runMatchedCommand \u001b[90m(file:///Users/pratiyush/Github/revitify/.claude/worktrees/rivet-realign/\u001b[39mnode_modules/\u001b[4m.pnpm\u001b[24m/vitest@4.1.8_@types+node@22.19.21_@vitest+coverage-v8@4.1.8_vite@8.0.16_@types+node@22.19.21_jiti@2.7.0_yaml@2.9.0_/node_modules/\u001b[4mvitest\u001b[24m/dist/chunks/cac.C9xsMMkH.js:606:13\u001b[90m)\u001b[39m\n    at CAC.parse \u001b[90m(file:///Users/pratiyush/Github/revitify/.claude/worktrees/rivet-realign/\u001b[39mnode_modules/\u001b[4m.pnpm\u001b[24m/vitest@4.1.8_@types+node@22.19.21_@vitest+coverage-v8@4.1.8_vite@8.0.16_@types+node@22.19.21_jiti@2.7.0_yaml@2.9.0_/node_modules/\u001b[4mvitest\u001b[24m/dist/chunks/cac.C9xsMMkH.js:547:12\u001b[90m)\u001b[39m\n    at \u001b[90mfile:///Users/pratiyush/Github/revitify/.claude/worktrees/rivet-realign/\u001b[39mnode_modules/\u001b[4m.pnpm\u001b[24m/vitest@4.1.8_@types+node@22.19.21_@vitest+coverage-v8@4.1.8_vite@8.0.16_@types+node@22.19.21_jiti@2.7.0_yaml@2.9.0_/node_modules/\u001b[4mvitest\u001b[24m/dist/cli.js:11:13\n\u001b[90m    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\u001b[39m\n\u001b[90m    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:642:26)\u001b[39m\n\u001b[90m    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\u001b[39m\n\nNode.js v26.0.0"
          },
          "test/cli.test.ts::help lists every verb; unknown verb exits 1": {
            "passed": true,
            "at": "2026-06-13T05:49:52.459Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CLI-02",
        "title": "verbs work end to end on a real project",
        "status": "done",
        "boundChecks": [
          "test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end"
        ],
        "results": {
          "test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end": {
            "passed": true,
            "at": "2026-06-13T05:45:51.369Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CLI-03",
        "title": "watch, global, prs",
        "status": "done",
        "boundChecks": [
          "test/cli.test.ts::rebuilds on change (initial build, then incremental)",
          "test/cli.test.ts::global merges repos with repo: prefixes",
          "test/cli.test.ts::prs reports diff impact in a git repo"
        ],
        "results": {
          "test/cli.test.ts::rebuilds on change (initial build, then incremental)": {
            "passed": true,
            "at": "2026-06-13T05:45:52.320Z",
            "kind": "unit"
          },
          "test/cli.test.ts::global merges repos with repo: prefixes": {
            "passed": true,
            "at": "2026-06-13T05:45:53.402Z",
            "kind": "unit"
          },
          "test/cli.test.ts::prs reports diff impact in a git repo": {
            "passed": true,
            "at": "2026-06-13T05:45:54.689Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CONTRACT-01",
        "title": "the three artifacts, default revitify-out/",
        "status": "done",
        "boundChecks": [
          "test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)"
        ],
        "results": {
          "test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)": {
            "passed": true,
            "at": "2026-06-13T05:45:55.853Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CONTRACT-02",
        "title": "Rivet's call shape stays supported forever",
        "status": "done",
        "boundChecks": [
          "test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')"
        ],
        "results": {
          "test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')": {
            "passed": true,
            "at": "2026-06-13T05:45:57.020Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CONTRACT-03",
        "title": "graph fields are additive-only",
        "status": "done",
        "boundChecks": [
          "test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes",
          "test/contract.test.ts::a canonical symbol node carries exactly the contract fields",
          "test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)"
        ],
        "results": {
          "test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes": {
            "passed": true,
            "at": "2026-06-13T05:45:58.197Z",
            "kind": "unit"
          },
          "test/contract.test.ts::a canonical symbol node carries exactly the contract fields": {
            "passed": true,
            "at": "2026-06-13T05:45:59.359Z",
            "kind": "unit"
          },
          "test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)": {
            "passed": true,
            "at": "2026-06-13T05:46:00.525Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CONTRACT-04",
        "title": "refactors never change output bytes",
        "status": "done",
        "boundChecks": [
          "test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)",
          "test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads"
        ],
        "results": {
          "test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)": {
            "passed": true,
            "at": "2026-06-13T05:46:01.687Z",
            "kind": "unit"
          },
          "test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads": {
            "passed": true,
            "at": "2026-06-13T05:46:02.791Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_INTEL-01",
        "title": "symbol→symbol call edges",
        "status": "done",
        "boundChecks": [
          "test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged",
          "test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge"
        ],
        "results": {
          "test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged": {
            "passed": true,
            "at": "2026-06-13T05:46:03.961Z",
            "kind": "unit"
          },
          "test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge": {
            "passed": true,
            "at": "2026-06-13T05:46:05.138Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_INTEL-02",
        "title": "tiered resolution precedence",
        "status": "done",
        "boundChecks": [
          "test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED",
          "test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick"
        ],
        "results": {
          "test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED": {
            "passed": true,
            "at": "2026-06-13T05:46:06.305Z",
            "kind": "unit"
          },
          "test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick": {
            "passed": true,
            "at": "2026-06-13T05:46:07.472Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_INTEL-03",
        "title": "near-duplicate doc nodes merge; code never does",
        "status": "done",
        "boundChecks": [
          "test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols",
          "test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop"
        ],
        "results": {
          "test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols": {
            "passed": true,
            "at": "2026-06-13T05:46:08.644Z",
            "kind": "unit"
          },
          "test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop": {
            "passed": true,
            "at": "2026-06-13T05:46:09.597Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_INTEL-04",
        "title": "structural communities, deterministic",
        "status": "done",
        "boundChecks": [
          "test/intelligence.test.ts::separates the two clusters; deterministic across runs",
          "test/intelligence.test.ts::isolated nodes get their own communities",
          "test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)"
        ],
        "results": {
          "test/intelligence.test.ts::separates the two clusters; deterministic across runs": {
            "passed": true,
            "at": "2026-06-13T05:46:10.779Z",
            "kind": "unit"
          },
          "test/intelligence.test.ts::isolated nodes get their own communities": {
            "passed": true,
            "at": "2026-06-13T05:46:11.944Z",
            "kind": "unit"
          },
          "test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)": {
            "passed": true,
            "at": "2026-06-13T05:46:13.876Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_MOD-01",
        "title": "registry dispatch, not switches",
        "status": "done",
        "boundChecks": [
          "test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files"
        ],
        "results": {
          "test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files": {
            "passed": true,
            "at": "2026-06-13T05:46:15.002Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_MOD-02",
        "title": "the lazy boundary",
        "status": "done",
        "boundChecks": [
          "test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync",
          "test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule"
        ],
        "results": {
          "test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync": {
            "passed": true,
            "at": "2026-06-13T05:46:16.126Z",
            "kind": "unit"
          },
          "test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule": {
            "passed": true,
            "at": "2026-06-13T05:46:17.237Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_LANG-01",
        "title": "deep member extraction per language",
        "status": "done",
        "boundChecks": [
          "test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth",
          "test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports",
          "test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract"
        ],
        "results": {
          "test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth": {
            "passed": true,
            "at": "2026-06-13T05:46:18.425Z",
            "kind": "unit"
          },
          "test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports": {
            "passed": true,
            "at": "2026-06-13T05:46:19.619Z",
            "kind": "unit"
          },
          "test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract": {
            "passed": true,
            "at": "2026-06-13T05:46:20.808Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_LANG-02",
        "title": "the sync facade is frozen and deterministic",
        "status": "done",
        "boundChecks": [
          "test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter",
          "test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages",
          "test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook"
        ],
        "results": {
          "test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter": {
            "passed": true,
            "at": "2026-06-13T05:46:21.996Z",
            "kind": "unit"
          },
          "test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages": {
            "passed": true,
            "at": "2026-06-13T05:46:23.138Z",
            "kind": "unit"
          },
          "test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook": {
            "passed": true,
            "at": "2026-06-13T05:46:24.286Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CACHE-01",
        "title": "per-file cache with honest invalidation",
        "status": "done",
        "boundChecks": [
          "test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical",
          "test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)",
          "test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files"
        ],
        "results": {
          "test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical": {
            "passed": true,
            "at": "2026-06-13T05:46:25.465Z",
            "kind": "unit"
          },
          "test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)": {
            "passed": true,
            "at": "2026-06-13T05:46:26.640Z",
            "kind": "unit"
          },
          "test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files": {
            "passed": true,
            "at": "2026-06-13T05:46:27.812Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_PAR-01",
        "title": "parallel extraction changes nothing but wall-clock",
        "status": "done",
        "boundChecks": [
          "test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly"
        ],
        "results": {
          "test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly": {
            "passed": true,
            "at": "2026-06-13T05:46:29.045Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_MM-01",
        "title": "the offline gate is absolute",
        "status": "done",
        "boundChecks": [
          "test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph"
        ],
        "results": {
          "test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph": {
            "passed": true,
            "at": "2026-06-13T05:46:30.226Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_MM-02",
        "title": "backend autodetection mirrors llm.py",
        "status": "done",
        "boundChecks": [
          "test/multimodal.test.ts::anthropic → gemini → openai → ollama → none",
          "test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok",
          "test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes"
        ],
        "results": {
          "test/multimodal.test.ts::anthropic → gemini → openai → ollama → none": {
            "passed": true,
            "at": "2026-06-13T05:46:31.396Z",
            "kind": "unit"
          },
          "test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok": {
            "passed": true,
            "at": "2026-06-13T05:46:32.581Z",
            "kind": "unit"
          },
          "test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes": {
            "passed": true,
            "at": "2026-06-13T05:46:33.761Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_MM-03",
        "title": "offline schema/deps ingestion",
        "status": "done",
        "boundChecks": [
          "test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL",
          "test/multimodal.test.ts::crate + dependency edges from Cargo.toml"
        ],
        "results": {
          "test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL": {
            "passed": true,
            "at": "2026-06-13T05:46:34.944Z",
            "kind": "unit"
          },
          "test/multimodal.test.ts::crate + dependency edges from Cargo.toml": {
            "passed": true,
            "at": "2026-06-13T05:46:36.119Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_MM-04",
        "title": "local tools never become hard dependencies",
        "status": "done",
        "boundChecks": [
          "test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures",
          "test/multimodal.test.ts::detect + available are honest"
        ],
        "results": {
          "test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures": {
            "passed": true,
            "at": "2026-06-13T05:46:37.305Z",
            "kind": "unit"
          },
          "test/multimodal.test.ts::detect + available are honest": {
            "passed": true,
            "at": "2026-06-13T05:46:38.497Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_QUERY-01",
        "title": "path, neighborhood, affected",
        "status": "done",
        "boundChecks": [
          "test/query.test.ts::finds the shortest path between symbols across files",
          "test/query.test.ts::walks reverse dependencies transitively"
        ],
        "results": {
          "test/query.test.ts::finds the shortest path between symbols across files": {
            "passed": true,
            "at": "2026-06-13T05:46:39.701Z",
            "kind": "unit"
          },
          "test/query.test.ts::walks reverse dependencies transitively": {
            "passed": true,
            "at": "2026-06-13T05:46:40.911Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_QUERY-02",
        "title": "search, explain, communities, log",
        "status": "done",
        "boundChecks": [
          "test/query.test.ts::idf-ranks matches and explains with neighbors",
          "test/query.test.ts::lists communities with size and cohesion in [0,1]",
          "test/query.test.ts::appends JSONL entries"
        ],
        "results": {
          "test/query.test.ts::idf-ranks matches and explains with neighbors": {
            "passed": true,
            "at": "2026-06-13T05:46:42.115Z",
            "kind": "unit"
          },
          "test/query.test.ts::lists communities with size and cohesion in [0,1]": {
            "passed": true,
            "at": "2026-06-13T05:46:43.323Z",
            "kind": "unit"
          },
          "test/query.test.ts::appends JSONL entries": {
            "passed": true,
            "at": "2026-06-13T05:46:44.540Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_EXPORT-01",
        "title": "the graphify export family",
        "status": "done",
        "boundChecks": [
          "test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps",
          "test/query.test.ts::exporters survive an empty graph"
        ],
        "results": {
          "test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps": {
            "passed": true,
            "at": "2026-06-13T05:46:45.742Z",
            "kind": "unit"
          },
          "test/query.test.ts::exporters survive an empty graph": {
            "passed": true,
            "at": "2026-06-13T05:46:46.951Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_REPORT-01",
        "title": "why-nodes",
        "status": "done",
        "boundChecks": [
          "test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol",
          "test/report.test.ts::python: docstrings and HACK comments via tree-sitter"
        ],
        "results": {
          "test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol": {
            "passed": true,
            "at": "2026-06-13T05:46:48.119Z",
            "kind": "unit"
          },
          "test/report.test.ts::python: docstrings and HACK comments via tree-sitter": {
            "passed": true,
            "at": "2026-06-13T05:46:49.298Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_REPORT-02",
        "title": "god nodes are symbols, not containers",
        "status": "done",
        "boundChecks": [
          "test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded"
        ],
        "results": {
          "test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded": {
            "passed": true,
            "at": "2026-06-13T05:46:50.461Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_REPORT-03",
        "title": "the report carries its intelligence",
        "status": "done",
        "boundChecks": [
          "test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions",
          "test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity"
        ],
        "results": {
          "test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions": {
            "passed": true,
            "at": "2026-06-13T05:46:51.631Z",
            "kind": "unit"
          },
          "test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity": {
            "passed": true,
            "at": "2026-06-13T05:46:52.803Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_RESOLVE-01",
        "title": "every edge carries its confidence",
        "status": "done",
        "boundChecks": [
          "test/resolution.test.ts::structural contains/imports edges are EXTRACTED",
          "test/resolution.test.ts::a uniquely-resolved reference is INFERRED"
        ],
        "results": {
          "test/resolution.test.ts::structural contains/imports edges are EXTRACTED": {
            "passed": true,
            "at": "2026-06-13T05:46:53.987Z",
            "kind": "unit"
          },
          "test/resolution.test.ts::a uniquely-resolved reference is INFERRED": {
            "passed": true,
            "at": "2026-06-13T05:46:55.154Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_RESOLVE-02",
        "title": "ambiguity is tagged, never hidden",
        "status": "done",
        "boundChecks": [
          "test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)",
          "test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS",
          "test/resolution.test.ts::the pick is stable across runs"
        ],
        "results": {
          "test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)": {
            "passed": true,
            "at": "2026-06-13T05:46:56.329Z",
            "kind": "unit"
          },
          "test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS": {
            "passed": true,
            "at": "2026-06-13T05:46:57.494Z",
            "kind": "unit"
          },
          "test/resolution.test.ts::the pick is stable across runs": {
            "passed": true,
            "at": "2026-06-13T05:46:58.667Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_RESOLVE-03",
        "title": "imports resolve against reality",
        "status": "done",
        "boundChecks": [
          "test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets"
        ],
        "results": {
          "test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets": {
            "passed": true,
            "at": "2026-06-13T05:47:00.996Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_RESOLVE-04",
        "title": "never ingest your own output",
        "status": "done",
        "boundChecks": [
          "test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph"
        ],
        "results": {
          "test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph": {
            "passed": true,
            "at": "2026-06-13T05:47:02.166Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_SERVE-01",
        "title": "HTTP viewer + API, traversal-proof",
        "status": "done",
        "boundChecks": [
          "test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal",
          "test/serve.test.ts::answers the API routes",
          "test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)"
        ],
        "results": {
          "test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal": {
            "passed": true,
            "at": "2026-06-13T05:47:03.405Z",
            "kind": "unit"
          },
          "test/serve.test.ts::answers the API routes": {
            "passed": true,
            "at": "2026-06-13T05:47:04.647Z",
            "kind": "unit"
          },
          "test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)": {
            "passed": true,
            "at": "2026-06-13T05:47:05.875Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_SERVE-02",
        "title": "the 7 MCP tools",
        "status": "done",
        "boundChecks": [
          "test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path"
        ],
        "results": {
          "test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path": {
            "passed": true,
            "at": "2026-06-13T05:47:07.104Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_SERVE-03",
        "title": "skill + self-checks",
        "status": "done",
        "boundChecks": [
          "test/serve.test.ts::install drops the skill; diagnose reports grammars"
        ],
        "results": {
          "test/serve.test.ts::install drops the skill; diagnose reports grammars": {
            "passed": true,
            "at": "2026-06-13T05:47:08.448Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_VIEWER-01",
        "title": "the redesigned graph.html stays offline",
        "status": "done",
        "boundChecks": [
          "test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources",
          "test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes",
          "test/viewer.test.ts::escapes \u003c/script> sequences in data",
          "test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters",
          "test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)"
        ],
        "results": {
          "test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources": {
            "passed": true,
            "at": "2026-06-13T05:47:09.624Z",
            "kind": "unit"
          },
          "test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes": {
            "passed": true,
            "at": "2026-06-13T05:47:10.818Z",
            "kind": "unit"
          },
          "test/viewer.test.ts::escapes \u003c/script> sequences in data": {
            "passed": true,
            "at": "2026-06-13T05:47:11.992Z",
            "kind": "unit"
          },
          "test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters": {
            "passed": true,
            "at": "2026-06-13T05:47:13.159Z",
            "kind": "unit"
          },
          "test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)": {
            "passed": true,
            "at": "2026-06-13T05:47:14.326Z",
            "kind": "unit"
          }
        }
      }
    ],
    "requirements": [
      {
        "id": "REQUIREMENT_CLI-01",
        "title": "the verb surface",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CLI-02",
        "title": "verbs work end to end on a real project",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CLI-03",
        "title": "watch, global, prs",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CONTRACT-01",
        "title": "the three artifacts, default revitify-out/",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CONTRACT-02",
        "title": "Rivet's call shape stays supported forever",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CONTRACT-03",
        "title": "graph fields are additive-only",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CONTRACT-04",
        "title": "refactors never change output bytes",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_INTEL-01",
        "title": "symbol→symbol call edges",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_INTEL-02",
        "title": "tiered resolution precedence",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_INTEL-03",
        "title": "near-duplicate doc nodes merge; code never does",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_INTEL-04",
        "title": "structural communities, deterministic",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_MOD-01",
        "title": "registry dispatch, not switches",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_MOD-02",
        "title": "the lazy boundary",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_LANG-01",
        "title": "deep member extraction per language",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_LANG-02",
        "title": "the sync facade is frozen and deterministic",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CACHE-01",
        "title": "per-file cache with honest invalidation",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_PAR-01",
        "title": "parallel extraction changes nothing but wall-clock",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_MM-01",
        "title": "the offline gate is absolute",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_MM-02",
        "title": "backend autodetection mirrors llm.py",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_MM-03",
        "title": "offline schema/deps ingestion",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_MM-04",
        "title": "local tools never become hard dependencies",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_QUERY-01",
        "title": "path, neighborhood, affected",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_QUERY-02",
        "title": "search, explain, communities, log",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_EXPORT-01",
        "title": "the graphify export family",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_REPORT-01",
        "title": "why-nodes",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_REPORT-02",
        "title": "god nodes are symbols, not containers",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_REPORT-03",
        "title": "the report carries its intelligence",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_RESOLVE-01",
        "title": "every edge carries its confidence",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_RESOLVE-02",
        "title": "ambiguity is tagged, never hidden",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_RESOLVE-03",
        "title": "imports resolve against reality",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_RESOLVE-04",
        "title": "never ingest your own output",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_SERVE-01",
        "title": "HTTP viewer + API, traversal-proof",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_SERVE-02",
        "title": "the 7 MCP tools",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_SERVE-03",
        "title": "skill + self-checks",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_VIEWER-01",
        "title": "the redesigned graph.html stays offline",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      }
    ],
    "approvals": [],
    "governance": [],
    "activity": [
      {
        "at": "2026-06-13T05:49:52.964Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_CLI-01 → done"
      },
      {
        "at": "2026-06-13T05:49:52.903Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_CLI-01",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:52.479Z",
        "icon": "✅",
        "text": "check test/cli.test.ts::help lists every verb; unknown verb exits 1 → REQUIREMENT_CLI-01"
      },
      {
        "at": "2026-06-13T05:49:51.912Z",
        "icon": "🧾",
        "text": "check run REQUIREMENT_CLI-01 test/cli.test.ts::help lists every verb; unknown verb exits 1",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:51.720Z",
        "icon": "🔗",
        "text": "task REQUIREMENT_CLI-01 bindings synced"
      },
      {
        "at": "2026-06-13T05:49:51.716Z",
        "icon": "🧾",
        "text": "spec tasks",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:32.035Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_VIEWER-01 → done"
      },
      {
        "at": "2026-06-13T05:49:31.975Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_VIEWER-01",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:31.497Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_SERVE-03 → done"
      },
      {
        "at": "2026-06-13T05:49:31.440Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_SERVE-03",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:30.965Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_SERVE-02 → done"
      },
      {
        "at": "2026-06-13T05:49:30.908Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_SERVE-02",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:30.429Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_SERVE-01 → done"
      },
      {
        "at": "2026-06-13T05:49:30.370Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_SERVE-01",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:29.895Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_RESOLVE-04 → done"
      },
      {
        "at": "2026-06-13T05:49:29.834Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_RESOLVE-04",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:29.362Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_RESOLVE-03 → done"
      },
      {
        "at": "2026-06-13T05:49:29.304Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_RESOLVE-03",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:28.825Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_RESOLVE-02 → done"
      },
      {
        "at": "2026-06-13T05:49:28.769Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_RESOLVE-02",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:28.290Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_RESOLVE-01 → done"
      },
      {
        "at": "2026-06-13T05:49:28.232Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_RESOLVE-01",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:27.755Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_REPORT-03 → done"
      },
      {
        "at": "2026-06-13T05:49:27.696Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_REPORT-03",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:27.224Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_REPORT-02 → done"
      },
      {
        "at": "2026-06-13T05:49:27.166Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_REPORT-02",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:26.687Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_REPORT-01 → done"
      },
      {
        "at": "2026-06-13T05:49:26.630Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_REPORT-01",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-13T05:49:26.158Z",
        "icon": "🏁",
        "text": "task REQUIREMENT_EXPORT-01 → done"
      },
      {
        "at": "2026-06-13T05:49:26.099Z",
        "icon": "🧾",
        "text": "task done REQUIREMENT_EXPORT-01",
        "meta": "Pratiyush Kumar Singh"
      }
    ],
    "files": [
      {
        "name": "laws.md",
        "content": "# Project Laws\n\n> The rules Rivet must always obey for this project. Three scopes are supported (Kiro-style steering):\n> always-on (this file), file-match, and on-summon. A personal default can be inherited and overridden here.\n\n## Standards\n- (add your do's and don'ts here)\n\n## Tech & conventions\n- (stacks, libraries, naming, structure, folder layout)\n\n## Hard rules (never violate)\n- Commits are authored by the human, never co-authored by the AI.\n- A task is not \"done\" until its bound checks pass (evidence-bound completion).\n- Reuse existing code before writing new; follow the surrounding patterns.\n"
      },
      {
        "name": "laws/best-practices-quality-gates.md",
        "content": "---\ninclusion: always\n---\n# Best practices — quality gates (any platform)\n\n> Constraint: every tool below is **free or open-source** — no paid licenses, ever.\n\n## Pre-commit (the cheapest gate)\n- **Husky** runs checks before every commit; **lint-staged** scopes them to changed files —\n  fast enough that nobody bypasses it.\n\n## Central dashboards — OPTIONAL, never required\n- **SonarQube Community Edition** (free): smells, bugs, duplication for Java + TS.\n- **GitHub CodeQL** (free for public repos; check terms for private): deep SAST.\n- These are optional add-ons; Rivet's verify gate is the required floor.\n\n## Bind these as Rivet checks\n```jsonc\n// the pre-commit hook simply runs what verify runs:\n//   .husky/pre-commit → npx lint-staged   (and rivet verify before push/PR)\n```\n"
      },
      {
        "name": "laws/best-practices-typescript.md",
        "content": "---\ninclusion: fileMatch\npattern: \\.tsx?$\n---\n# Best practices — TypeScript\n\n> Constraint: every tool below is **free or open-source** — no paid licenses, ever.\n\n## Compiler is the first linter\n- `tsconfig.json` MUST set: `strict: true`, `noImplicitAny`, `noUnusedLocals`,\n  `noUncheckedIndexedAccess` — indexing returns `T | undefined`; handle it, don't assert it away.\n- ESM (`\"type\": \"module\"`); no `require` in new code.\n\n## Lint + format (free, standard)\n- **ESLint** (typescript-eslint recommended config) — correctness, not style debates.\n- **Prettier** — formatting is automated, never reviewed.\n- No silent `catch` blocks: every catch either handles, rethrows, or logs with context.\n\n## Tests & dependencies\n- **Vitest** co-located tests (`foo.test.ts` next to `foo.ts` or in `test/`); every bug fix\n  starts with the failing test.\n- **npm audit** on dependencies — runs in `rivet verify` via the audit kind below.\n\n## Bind these as Rivet checks\n```jsonc\n// .rivet/config.json → verify\n\"kindRunners\": {\n  \"lint\":  { \"cmd\": \"npx\", \"args\": [\"eslint\", \".\"] },\n  \"audit\": { \"cmd\": \"npm\", \"args\": [\"audit\", \"--audit-level=high\"] }\n}\n// spec criteria can then bind: @check kind=lint ref=eslint  ·  @check kind=audit ref=npm-audit\n```\n"
      },
      {
        "name": "specs/cli.md",
        "content": "# Feature: CLI, watch, global graph, PR impact (Phase 6)\n\n> Upstream: graphify CLI verbs + watch.py + global_graph.py + prs.py @ 0.8.38. The dispatcher\n> lazy-imports every verb (chokidar loads only for watch); bin = dist/cli/main.js.\n\n## Requirement REQUIREMENT_CLI-01 — the verb surface\n\nWHEN `revitify --help` runs THEN it SHALL list build/query/explain/path/affected/communities/\nexport/watch/global/prs/validate; IF an unknown verb is given THEN exit code SHALL be 1.\n\n@check kind=unit ref=test/cli.test.ts::help lists every verb; unknown verb exits 1\n\n## Requirement REQUIREMENT_CLI-02 — verbs work end to end on a real project\n\nWHEN build/query/path/affected/communities/export/validate run in sequence THEN each SHALL\nexit 0 with its artifact/output, and the JSONL query log SHALL record the session.\n\n@check kind=unit ref=test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end\n\n## Requirement REQUIREMENT_CLI-03 — watch, global, prs\n\nWHEN watch runs THEN it SHALL rebuild incrementally on change (cache-backed); WHEN global runs\nover N repos THEN ids SHALL prefix `repo:` (collision-proof); WHEN prs runs in a git repo THEN\nchanged files SHALL map to their transitive blast radius.\n\n@check kind=unit ref=test/cli.test.ts::rebuilds on change (initial build, then incremental)\n@check kind=unit ref=test/cli.test.ts::global merges repos with repo: prefixes\n@check kind=unit ref=test/cli.test.ts::prs reports diff impact in a git repo\n"
      },
      {
        "name": "specs/contract.md",
        "content": "# Feature: The graphify output contract (Rivet's #1 invariant)\n\n> User story: As Rivet (the consumer at ~/Github/llm-dev-kit), I want every revitify build to emit\n> the exact graph.json shape my `loadCodeGraph` reads, so that graph features never break under me.\n> Intake: FEATURE-PARITY-PROMPT.md + docs/PLAN.md (decisions locked 2026-06-12).\n\n## Requirement REQUIREMENT_CONTRACT-01 — the three artifacts, default revitify-out/\n\nWHEN `revitify(rootDir)` runs on any project THEN the system SHALL write `graph.json`,\n`graph.html` (self-contained, no remote scripts), and `GRAPH_REPORT.md` into `\u003crootDir>/revitify-out/`.\n\n@check kind=unit ref=test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)\n\n## Requirement REQUIREMENT_CONTRACT-02 — Rivet's call shape stays supported forever\n\nWHEN `revitify(rootDir, \"graphify-out\")` runs (the exact call Rivet's `refreshCodeGraphVia` makes)\nTHEN the system SHALL write the same three artifacts into `\u003crootDir>/graphify-out/` and every\nsymbol node SHALL carry exactly `id, name, label, kind, source_file, source_location, community`.\n\n@check kind=unit ref=test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')\n\n## Requirement REQUIREMENT_CONTRACT-03 — graph fields are additive-only\n\nWHEN the graph is built THEN nodes SHALL carry `id`, `label`, `source_file`, `community` and links\nSHALL carry `source`, `target`, `relation`, and the graph SHALL carry `built_at_commit` when the\nproject is a git checkout; new fields MAY be added but these SHALL never be renamed or removed.\n\n@check kind=unit ref=test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes\n\n@check kind=unit ref=test/contract.test.ts::a canonical symbol node carries exactly the contract fields\n\nScenario: a contract-breaking shape fails loudly, not silently (negative floor)\n  Given a graph.json whose nodes lost the `source_file` field\n  When the `assertGraphContract` validator (src/model/contract.ts) checks it\n  Then validation throws naming the offending node index and field\n\n@check kind=unit ref=test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)\n\n## Requirement REQUIREMENT_CONTRACT-04 — refactors never change output bytes\n\nWHEN the engine is restructured without intended behavior change (Phase 1a modularization)\nTHEN graph.json on the committed fixture SHALL be byte-identical to the committed expectation,\nand the type-level pin against Rivet's reader SHALL keep compiling.\n\n@check kind=unit ref=test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)\n@check kind=unit ref=test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads\n"
      },
      {
        "name": "specs/intelligence.md",
        "content": "# Feature: Three-pass intelligence (Phase 3)\n\n> User story: As a graph consumer, I want call edges between symbols, proximity-ranked\n> resolution, duplicate-free doc nodes, and structural communities, so the graph reflects how\n> the code actually hangs together. Upstream: symbol_resolution.py, dedup.py + _minhash.py\n> (num_perm=128, 3-gram, 0.7 LSH, Jaro-Winkler 0.92), cluster.py (Louvain fallback path +\n> connectivity refinement + >25%/min-10 and \u003c0.05-cohesion/min-50 re-splits) @ 0.8.38.\n\n## Requirement REQUIREMENT_INTEL-01 — symbol→symbol call edges\n\nWHEN a callable's body calls another in-project symbol THEN a `calls` edge SHALL connect the\ntwo symbols (not their files), confidence-tagged by resolution; built-ins and externals SHALL\nleave no edge.\n\n@check kind=unit ref=test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged\n@check kind=unit ref=test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge\n\n## Requirement REQUIREMENT_INTEL-02 — tiered resolution precedence\n\nWHEN a name has multiple candidate definitions THEN resolution SHALL prefer same-file, then\nsame-directory, then global; a unique candidate in the winning tier is INFERRED, ties within\nit are AMBIGUOUS with a lexicographic pick.\n\n@check kind=unit ref=test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED\n@check kind=unit ref=test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick\n\n## Requirement REQUIREMENT_INTEL-03 — near-duplicate doc nodes merge; code never does\n\nWHEN two doc nodes' normalized labels are minhash-near (≥0.7) AND Jaro-Winkler-confirmed\n(≥0.92) THEN they SHALL merge into the first-seen node with links rewritten and exact\n(source, target, relation) duplicates dropped; identical CODE labels SHALL never merge.\n\n@check kind=unit ref=test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols\n@check kind=unit ref=test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop\n\n## Requirement REQUIREMENT_INTEL-04 — structural communities, deterministic\n\nWHEN the graph clusters THEN dense subgraphs SHALL separate at their bridges (Louvain +\nconnectivity refinement), isolated nodes SHALL keep singleton communities, oversized\ncommunities (>25%, ≥10) SHALL re-split, and two runs SHALL produce identical assignments.\n\n@check kind=unit ref=test/intelligence.test.ts::separates the two clusters; deterministic across runs\n@check kind=unit ref=test/intelligence.test.ts::isolated nodes get their own communities\n@check kind=unit ref=test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)\n\nScenario: a structureless giant cannot be force-split (negative floor)\n  Given a 12-node clique holding >25% of the graph\n  When the oversized re-split runs Louvain on its subgraph\n  Then the clique stays one community — re-splitting requires real substructure, never fiat\n\n@check kind=unit ref=test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)\n"
      },
      {
        "name": "specs/modularity.md",
        "content": "# Feature: Modular engine with enforced layer boundaries\n\n> User story: As the maintainer, I want the engine split into registry-backed layers with\n> machine-enforced import boundaries, so that adding a language/ingestor/exporter is a new module\n> — never an edit to a switch — and modularity is measurable, not claimed (graphify has no\n> boundary enforcement; revitify's is CI-fatal).\n> Intake: docs/PLAN.md Phase 1 (decisions locked 2026-06-12).\n\n## Requirement REQUIREMENT_MOD-01 — registry dispatch, not switches\n\nWHEN a file is ingested THEN the system SHALL pick its extractor via the ordered registration\narray (extension pre-filter, then detect()), and WHEN no registration matches (e.g. `.d.ts`,\nunknown extensions) THEN the system SHALL skip the file rather than fail.\n\n@check kind=unit ref=test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files\n\n## Requirement REQUIREMENT_MOD-02 — the lazy boundary\n\nWHEN a registration provides only `load()` (a heavy/lazy module) THEN `resolveSync` SHALL return\nundefined (sync facade skips it) and `resolve()` SHALL load it once and memoize.\n\n@check kind=unit ref=test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync\n\nScenario: a forbidden cross-layer import fails CI, not code review (negative floor)\n  Given a source file in src/model/ importing from src/export/\n  When `pnpm depcruise` runs (the layer matrix in .dependency-cruiser.cjs)\n  Then the build fails naming the violating edge\n  And the same gate forbids circular imports, orphans, and node:* inside src/model/\n\n@check kind=unit ref=test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule\n"
      },
      {
        "name": "specs/multilang.md",
        "content": "# Feature: Multi-language extraction, cache, parallel (Phase 2)\n\n> User story: As a polyglot-repo owner, I want real AST extraction for Python/Java/Go/Rust with\n> caching and parallelism, without `import { revitify }` ever paying for tree-sitter.\n> Upstream: graphify extract.py + detect.py + cache.py (pin 0.8.38 in .track). Grammars come from\n> the official tree-sitter-\u003clang> npm packages (prebuilt .wasm; native scripts never run) — NOT\n> tree-sitter-wasms, whose 2024-era builds are ABI-incompatible with web-tree-sitter 0.26.\n\n## Requirement REQUIREMENT_LANG-01 — deep member extraction per language\n\nWHEN a Java file is extracted via tree-sitter THEN classes, interfaces, enums, records,\nmethods, **constructors, and fields** SHALL each become symbols (members as\n`sym:\u003crel>#\u003cType>.\u003cmember>`), and WHEN Python/Go/Rust files are extracted THEN\nclasses/functions/methods, funcs/methods/types, and fns/structs/enums/traits/impl-methods\nSHALL respectively become symbols.\n\n@check kind=unit ref=test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth\n@check kind=unit ref=test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports\n@check kind=unit ref=test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract\n\n## Requirement REQUIREMENT_LANG-02 — the sync facade is frozen and deterministic\n\nWHEN `buildGraph()` (sync) runs THEN tree-sitter SHALL NOT load — regex fallbacks serve py/java,\ngo/rust are skipped — and an earlier `buildGraphAsync` in the same process SHALL NOT change the\nsync output (no cache-leak upgrades).\n\n@check kind=unit ref=test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter\n@check kind=unit ref=test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages\n\nScenario: the lazy-boundary proof cannot silently rot (negative floor)\n  Given the module-resolution recorder hook in a child process\n  When the async path runs on a Python file\n  Then the log DOES contain web-tree-sitter — proving the hook records before we trust its silence\n\n@check kind=unit ref=test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook\n\n## Requirement REQUIREMENT_CACHE-01 — per-file cache with honest invalidation\n\nWHEN a build re-runs unchanged THEN every file SHALL be a cache hit (stat fastpath, no re-read);\nWHEN one file changes THEN exactly that file SHALL re-extract; WHEN the file SET changes THEN the\nwhole cache SHALL invalidate (fragments embed import resolution against the walked set); IF the\nindex corrupts or fragments are evicted THEN the build SHALL recover, never crash.\n\n@check kind=unit ref=test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical\n@check kind=unit ref=test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)\n@check kind=unit ref=test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files\n\n## Requirement REQUIREMENT_PAR-01 — parallel extraction changes nothing but wall-clock\n\nWHEN worker-pool extraction runs THEN the graph SHALL be byte-identical to the sequential run\n(fragments reassemble in walk order).\n\n@check kind=unit ref=test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly\n"
      },
      {
        "name": "specs/multimodal.md",
        "content": "# Feature: Multimodal ingestion — opt-in, key-gated (Phase 8)\n\n> Upstream: llm.py (backend autodetect), transcribe.py (whisper), scip_ingest.py, SQL/cargo\n> introspection @ graphify 0.8.38. NO LLM SDKs — native fetch; local tools gate on PATH.\n\n## Requirement REQUIREMENT_MM-01 — the offline gate is absolute\n\nWHEN no API key and no local tool is present THEN a build over code+PDF+audio SHALL produce a\ngraph identical to the code-only build, make ZERO network calls, and print one skip notice per\ngated ingestor.\n\n@check kind=unit ref=test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph\n\n## Requirement REQUIREMENT_MM-02 — backend autodetection mirrors llm.py\n\nWHEN keys are present THEN detection SHALL order Anthropic → Gemini → OpenAI → Ollama, each\nbackend speaking its provider's response shape over fetch, erroring loudly on non-OK.\n\n@check kind=unit ref=test/multimodal.test.ts::anthropic → gemini → openai → ollama → none\n@check kind=unit ref=test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok\n@check kind=unit ref=test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes\n\n## Requirement REQUIREMENT_MM-03 — offline schema/deps ingestion\n\nWHEN .sql DDL or Cargo.toml is walked THEN tables/columns/REFERENCES and crate/dependency\nedges SHALL extract fully offline (both pipelines — these ingestors are sync-capable).\n\n@check kind=unit ref=test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL\n@check kind=unit ref=test/multimodal.test.ts::crate + dependency edges from Cargo.toml\n\n## Requirement REQUIREMENT_MM-04 — local tools never become hard dependencies\n\nWHEN whisper-cli/scip exist on PATH THEN AV/SCIP files SHALL ingest through them; IF the\nbinary is absent or fails THEN the ingestor SHALL report unavailable / return empty — never\nthrow, never install anything.\n\n@check kind=unit ref=test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures\n@check kind=unit ref=test/multimodal.test.ts::detect + available are honest\n"
      },
      {
        "name": "specs/queries.md",
        "content": "# Feature: Query verbs + exporters (Phase 5)\n\n> Upstream: querylog.py, affected.py, serve.py scoring, export.py/callflow_html.py/tree_html.py/\n> wiki.py @ graphify 0.8.38. Zero new dependencies.\n\n## Requirement REQUIREMENT_QUERY-01 — path, neighborhood, affected\n\nWHEN two symbols connect THEN `shortestPath` SHALL return the BFS path; WHEN a symbol changes\nTHEN `affected` SHALL return its transitive reverse dependents (imports/calls/references,\nhopping containers); IF endpoints are missing THEN path SHALL be undefined, never a throw.\n\n@check kind=unit ref=test/query.test.ts::finds the shortest path between symbols across files\n@check kind=unit ref=test/query.test.ts::walks reverse dependencies transitively\n\n## Requirement REQUIREMENT_QUERY-02 — search, explain, communities, log\n\nWHEN a question is asked THEN nodes SHALL rank by idf-weighted term match and `explain` SHALL\nnarrate seeds with neighbors; communities SHALL report cohesion in [0,1]; every query SHALL\nappend a JSONL log entry that never breaks the query on failure.\n\n@check kind=unit ref=test/query.test.ts::idf-ranks matches and explains with neighbors\n@check kind=unit ref=test/query.test.ts::lists communities with size and cohesion in [0,1]\n@check kind=unit ref=test/query.test.ts::appends JSONL entries\n\n## Requirement REQUIREMENT_EXPORT-01 — the graphify export family\n\nWHEN extra exports run THEN callflow.html SHALL hold only `calls` edges, tree.html SHALL nest\ndirectories/files/symbols, WIKI.md SHALL section per community, graph.mmd SHALL cap at the top\nsymbols; IF the graph is empty THEN every exporter SHALL render without throwing.\n\n@check kind=unit ref=test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps\n@check kind=unit ref=test/query.test.ts::exporters survive an empty graph\n"
      },
      {
        "name": "specs/report.md",
        "content": "# Feature: Report intelligence (Phase 4)\n\n> Upstream: report.py + analyze.py @ graphify 0.8.38 (pin in .track). God nodes exclude\n> containers (file/doc/why); surprise = additive bonuses (+2 cross-file, +2 cross-community,\n> +1 peripheral→hub, +1 cross-language, +1 inferred); questions seed from betweenness brokers.\n\n## Requirement REQUIREMENT_REPORT-01 — why-nodes\n\nWHEN a comment carries NOTE:/WHY:/HACK: THEN it SHALL become a why node linked (`explains`)\nfrom the symbol declared just under it (file fallback), and WHEN a Python definition opens\nwith a docstring THEN a docstring node SHALL hang off that symbol (`documents`).\n\n@check kind=unit ref=test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol\n@check kind=unit ref=test/report.test.ts::python: docstrings and HACK comments via tree-sitter\n\n## Requirement REQUIREMENT_REPORT-02 — god nodes are symbols, not containers\n\nWHEN god nodes rank THEN file/doc/why/docstring nodes SHALL be excluded.\n\n@check kind=unit ref=test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded\n\n## Requirement REQUIREMENT_REPORT-03 — the report carries its intelligence\n\nWHEN GRAPH_REPORT.md renders THEN it SHALL include god nodes, surprising connections with\nreasons, a confidence summary, why-nodes when present, and at least 4 suggested questions.\n\n@check kind=unit ref=test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions\n@check kind=unit ref=test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity\n"
      },
      {
        "name": "specs/resolution.md",
        "content": "# Feature: Confidence-tagged reference & import resolution\n\n> User story: As a graph consumer, I want every edge to declare how it was derived\n> (EXTRACTED/INFERRED/AMBIGUOUS) and import edges to point only at files that exist, so that I can\n> weight what I trust and never chase dangling targets.\n> Upstream: graphify symbol_resolution.py + extract.py (pin 0.8.38 in .track) — ported at\n> revitify's current file→symbol granularity; symbol→symbol call resolution lands in Phase 3.\n\n## Requirement REQUIREMENT_RESOLVE-01 — every edge carries its confidence\n\nWHEN the graph is built THEN structural contains/imports edges SHALL carry\n`confidence: \"EXTRACTED\"`, and WHEN a `name:` reference resolves to exactly one symbol THEN the\nedge SHALL carry `confidence: \"INFERRED\"`.\n\n@check kind=unit ref=test/resolution.test.ts::structural contains/imports edges are EXTRACTED\n@check kind=unit ref=test/resolution.test.ts::a uniquely-resolved reference is INFERRED\n\n## Requirement REQUIREMENT_RESOLVE-02 — ambiguity is tagged, never hidden\n\nWHEN a reference has multiple candidate definitions THEN the system SHALL resolve through tiers\n(same-file, then same-directory, then global); a candidate that is UNIQUE in the winning tier is\ntagged `confidence: \"INFERRED\"`, while ties WITHIN a tier SHALL be picked deterministically\n(lexicographic id, never insertion order) and tagged `confidence: \"AMBIGUOUS\"`.\n\n@check kind=unit ref=test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)\n@check kind=unit ref=test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS\n@check kind=unit ref=test/resolution.test.ts::the pick is stable across runs\n\n## Requirement REQUIREMENT_RESOLVE-03 — imports resolve against reality\n\nWHEN a relative import spec is extracted THEN the system SHALL resolve it against the walked-file\nset (as-written, then runtime-extension swaps, then extensionless completion, then /index.*).\n\n@check kind=unit ref=test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets\n\nIF a relative import resolves to nothing on disk THEN the system SHALL emit NO edge for it.\n\n@check kind=unit ref=test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets\n\n## Requirement REQUIREMENT_RESOLVE-04 — never ingest your own output\n\nIF a project contains a previous `revitify-out/` (or `graphify-out/`) run THEN the walker SHALL\nexclude it, so the graph never ingests its own report.\n\n@check kind=unit ref=test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph\n"
      },
      {
        "name": "specs/serve.md",
        "content": "# Feature: HTTP + MCP servers, skill, install, diagnose (Phase 7)\n\n> Upstream: serve.py (HTTP + stdio MCP + mtime reload + security.py traversal guard),\n> install.py, diagnostics.py @ graphify 0.8.38. The MCP SDK loads ONLY via dynamic import\n> (dependency-cruiser lazy-zone) — `import { revitify }` and non-MCP verbs never pay for it.\n\n## Requirement REQUIREMENT_SERVE-01 — HTTP viewer + API, traversal-proof\n\nWHEN the server runs THEN / SHALL serve graph.html and /api/{query,explain,node,neighbors,\npath,communities,stats} SHALL answer from the live index; static files SHALL be allowlisted to\nthe three artifacts (traversal requests get 404 by construction); WHEN graph.json's mtime moves\nTHEN the index SHALL reload.\n\n@check kind=unit ref=test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal\n@check kind=unit ref=test/serve.test.ts::answers the API routes\n@check kind=unit ref=test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)\n\n## Requirement REQUIREMENT_SERVE-02 — the 7 MCP tools\n\nWHEN an MCP client connects THEN tools/list SHALL expose query_graph, get_node, get_neighbors,\nget_community, god_nodes, graph_stats, shortest_path — every call JSONL-logged; IF a node is\nmissing THEN tools SHALL answer with an error payload, never crash.\n\n@check kind=unit ref=test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path\n\n## Requirement REQUIREMENT_SERVE-03 — skill + self-checks\n\nWHEN `revitify install` runs THEN the /revitify skill SHALL land in .claude/skills/; WHEN\n`revitify diagnose` runs THEN grammar loadability, cache, and graph presence SHALL report.\n\n@check kind=unit ref=test/serve.test.ts::install drops the skill; diagnose reports grammars\n\n## Requirement REQUIREMENT_VIEWER-01 — the redesigned graph.html stays offline\n\nWHEN graph.html renders THEN the design-handoff template SHALL carry all four libraries\n(cytoscape, layout-base, cose-base, fcose) INLINED with zero external sources, the graph\ninjected at the DATA INJECTION POINT (function-form replacement — minified libs contain $'\nsubstitution hazards), and `\u003c/script>` escaped in data; the original canvas viewer SHALL stay\navailable as graph-lite.html; docstrings SHALL surface as the additive `summary` node field.\n\n@check kind=unit ref=test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources\n@check kind=unit ref=test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes\n@check kind=unit ref=test/viewer.test.ts::escapes \u003c/script> sequences in data\n@check kind=unit ref=test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters\n@check kind=unit ref=test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)\n"
      },
      {
        "name": "LEDGER.md",
        "content": "# LEDGER — generated from the journal; do not edit\n\n> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven\n\n## Progress board\n\n**35/35 done (100%)**\n\n- ✅ **REQUIREMENT_CLI-01** the verb surface 🟢\n  📋 Evidence — REQUIREMENT_CLI-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli.test.ts::help lists every verb; unknown verb exits 1` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:49:52.459Z |\n\n- ✅ **REQUIREMENT_CLI-02** verbs work end to end on a real project 🟢\n  📋 Evidence — REQUIREMENT_CLI-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:51.369Z |\n\n- ✅ **REQUIREMENT_CLI-03** watch, global, prs 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_CLI-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli.test.ts::rebuilds on change (initial build, then incremental)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:52.320Z |\n  | `test/cli.test.ts::global merges repos with repo: prefixes` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:53.402Z |\n  | `test/cli.test.ts::prs reports diff impact in a git repo` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:54.689Z |\n\n- ✅ **REQUIREMENT_CONTRACT-01** the three artifacts, default revitify-out/ 🟢\n  📋 Evidence — REQUIREMENT_CONTRACT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/revitify.test.ts::emits graph.json + self-contained graph.html + GRAPH_REPORT.md (default: revitify-out/)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:55.853Z |\n\n- ✅ **REQUIREMENT_CONTRACT-02** Rivet's call shape stays supported forever 🟢\n  📋 Evidence — REQUIREMENT_CONTRACT-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/revitify.test.ts::keeps Rivet's call shape working: revitify(dir, 'graphify-out')` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:57.020Z |\n\n- ✅ **REQUIREMENT_CONTRACT-03** graph fields are additive-only 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_CONTRACT-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/revitify.test.ts::builds containment, import, and reference edges with source_file + community on nodes` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:58.197Z |\n  | `test/contract.test.ts::a canonical symbol node carries exactly the contract fields` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:45:59.359Z |\n  | `test/contract.test.ts::contract drift fails loudly, naming index and field (negative floor)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:00.525Z |\n\n- ✅ **REQUIREMENT_CONTRACT-04** refactors never change output bytes 🟢🟢\n  📋 Evidence — REQUIREMENT_CONTRACT-04\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/contract.test.ts::graph.json is byte-identical to the committed expectation (refactor pin)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:01.687Z |\n  | `test/contract.test-d.ts::RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:02.791Z |\n\n- ✅ **REQUIREMENT_INTEL-01** symbol→symbol call edges 🟢🟢\n  📋 Evidence — REQUIREMENT_INTEL-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/intelligence.test.ts::symbol→symbol calls edges, confidence-tagged` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:03.961Z |\n  | `test/intelligence.test.ts::unresolvable callees (built-ins) leave no edge` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:05.138Z |\n\n- ✅ **REQUIREMENT_INTEL-02** tiered resolution precedence 🟢🟢\n  📋 Evidence — REQUIREMENT_INTEL-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/intelligence.test.ts::same-file beats same-dir beats global; unique-in-tier is INFERRED` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:06.305Z |\n  | `test/intelligence.test.ts::ties within the winning tier are AMBIGUOUS with lexicographic pick` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:07.472Z |\n\n- ✅ **REQUIREMENT_INTEL-03** near-duplicate doc nodes merge; code never does 🟢🟢\n  📋 Evidence — REQUIREMENT_INTEL-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/intelligence.test.ts::merges near-duplicate headings, rewrites links, never touches code symbols` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:08.644Z |\n  | `test/algorithms.test.ts::no docs / single doc: nothing merges, exact duplicate links still drop` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:09.597Z |\n\n- ✅ **REQUIREMENT_INTEL-04** structural communities, deterministic 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_INTEL-04\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/intelligence.test.ts::separates the two clusters; deterministic across runs` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:10.779Z |\n  | `test/intelligence.test.ts::isolated nodes get their own communities` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:11.944Z |\n  | `test/algorithms.test.ts::an oversized clique triggers the re-split pass and survives unsplit (no substructure)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:13.876Z |\n\n- ✅ **REQUIREMENT_MOD-01** registry dispatch, not switches 🟢\n  📋 Evidence — REQUIREMENT_MOD-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/layers.test.ts::dispatches by detect/extensions and rejects .d.ts and unknown files` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:15.002Z |\n\n- ✅ **REQUIREMENT_MOD-02** the lazy boundary 🟢🟢\n  📋 Evidence — REQUIREMENT_MOD-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/layers.test.ts::resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:16.126Z |\n  | `test/boundaries.test.ts::a forbidden src/model → src/export import fails depcruise, naming the violated rule` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:17.237Z |\n\n- ✅ **REQUIREMENT_LANG-01** deep member extraction per language 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_LANG-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/multilang.test.ts::java: constructors, methods, fields, nested types — full member depth` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:18.425Z |\n  | `test/multilang.test.ts::python: classes, nested methods, functions, file-resolved imports` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:19.619Z |\n  | `test/multilang.test.ts::go and rust symbols, and the whole graph passes the contract` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:20.808Z |\n\n- ✅ **REQUIREMENT_LANG-02** the sync facade is frozen and deterministic 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_LANG-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/multilang.test.ts::falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:21.996Z |\n  | `test/lazy-boundary.test.ts::sync revitify never resolves web-tree-sitter or grammar packages` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:23.138Z |\n  | `test/lazy-boundary.test.ts::positive control: the async path DOES resolve web-tree-sitter through the same hook` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:24.286Z |\n\n- ✅ **REQUIREMENT_CACHE-01** per-file cache with honest invalidation 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_CACHE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cache.test.ts::second run is all hits; edits invalidate exactly one file; output identical` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:25.465Z |\n  | `test/cache.test.ts::adding a file invalidates the set (import resolution depends on the walked set)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:26.640Z |\n  | `test/cache.test.ts::recovers from a corrupt stat-index and from evicted fragment files` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:27.812Z |\n\n- ✅ **REQUIREMENT_PAR-01** parallel extraction changes nothing but wall-clock 🟢\n  📋 Evidence — REQUIREMENT_PAR-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/lazy-boundary.test.ts::worker-pool output matches sequential output exactly` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:29.045Z |\n\n- ✅ **REQUIREMENT_MM-01** the offline gate is absolute 🟢\n  📋 Evidence — REQUIREMENT_MM-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:30.226Z |\n\n- ✅ **REQUIREMENT_MM-02** backend autodetection mirrors llm.py 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_MM-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/multimodal.test.ts::anthropic → gemini → openai → ollama → none` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:31.396Z |\n  | `test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:32.581Z |\n  | `test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:33.761Z |\n\n- ✅ **REQUIREMENT_MM-03** offline schema/deps ingestion 🟢🟢\n  📋 Evidence — REQUIREMENT_MM-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:34.944Z |\n  | `test/multimodal.test.ts::crate + dependency edges from Cargo.toml` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:36.119Z |\n\n- ✅ **REQUIREMENT_MM-04** local tools never become hard dependencies 🟢🟢\n  📋 Evidence — REQUIREMENT_MM-04\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:37.305Z |\n  | `test/multimodal.test.ts::detect + available are honest` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:38.497Z |\n\n- ✅ **REQUIREMENT_QUERY-01** path, neighborhood, affected 🟢🟢\n  📋 Evidence — REQUIREMENT_QUERY-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/query.test.ts::finds the shortest path between symbols across files` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:39.701Z |\n  | `test/query.test.ts::walks reverse dependencies transitively` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:40.911Z |\n\n- ✅ **REQUIREMENT_QUERY-02** search, explain, communities, log 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_QUERY-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/query.test.ts::idf-ranks matches and explains with neighbors` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:42.115Z |\n  | `test/query.test.ts::lists communities with size and cohesion in [0,1]` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:43.323Z |\n  | `test/query.test.ts::appends JSONL entries` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:44.540Z |\n\n- ✅ **REQUIREMENT_EXPORT-01** the graphify export family 🟢🟢\n  📋 Evidence — REQUIREMENT_EXPORT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:45.742Z |\n  | `test/query.test.ts::exporters survive an empty graph` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:46.951Z |\n\n- ✅ **REQUIREMENT_REPORT-01** why-nodes 🟢🟢\n  📋 Evidence — REQUIREMENT_REPORT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:48.119Z |\n  | `test/report.test.ts::python: docstrings and HACK comments via tree-sitter` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:49.298Z |\n\n- ✅ **REQUIREMENT_REPORT-02** god nodes are symbols, not containers 🟢\n  📋 Evidence — REQUIREMENT_REPORT-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:50.461Z |\n\n- ✅ **REQUIREMENT_REPORT-03** the report carries its intelligence 🟢🟢\n  📋 Evidence — REQUIREMENT_REPORT-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:51.631Z |\n  | `test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:52.803Z |\n\n- ✅ **REQUIREMENT_RESOLVE-01** every edge carries its confidence 🟢🟢\n  📋 Evidence — REQUIREMENT_RESOLVE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/resolution.test.ts::structural contains/imports edges are EXTRACTED` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:53.987Z |\n  | `test/resolution.test.ts::a uniquely-resolved reference is INFERRED` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:55.154Z |\n\n- ✅ **REQUIREMENT_RESOLVE-02** ambiguity is tagged, never hidden 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_RESOLVE-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/resolution.test.ts::same-dir tier disambiguates: unique-in-tier resolves INFERRED (Phase 3 precedence)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:56.329Z |\n  | `test/resolution.test.ts::falls back to lexicographic id order, still AMBIGUOUS` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:57.494Z |\n  | `test/resolution.test.ts::the pick is stable across runs` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:46:58.667Z |\n\n- ✅ **REQUIREMENT_RESOLVE-03** imports resolve against reality 🟢\n  📋 Evidence — REQUIREMENT_RESOLVE-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/resolution.test.ts::drops imports of files that do not exist; keeps ext-swapped, as-written, and index targets` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:00.996Z |\n\n- ✅ **REQUIREMENT_RESOLVE-04** never ingest your own output 🟢\n  📋 Evidence — REQUIREMENT_RESOLVE-04\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/resolution.test.ts::a previous revitify-out/ run is never ingested back into the graph` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:02.166Z |\n\n- ✅ **REQUIREMENT_SERVE-01** HTTP viewer + API, traversal-proof 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_SERVE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:03.405Z |\n  | `test/serve.test.ts::answers the API routes` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:04.647Z |\n  | `test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:05.875Z |\n\n- ✅ **REQUIREMENT_SERVE-02** the 7 MCP tools 🟢\n  📋 Evidence — REQUIREMENT_SERVE-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:07.104Z |\n\n- ✅ **REQUIREMENT_SERVE-03** skill + self-checks 🟢\n  📋 Evidence — REQUIREMENT_SERVE-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/serve.test.ts::install drops the skill; diagnose reports grammars` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:08.448Z |\n\n- ✅ **REQUIREMENT_VIEWER-01** the redesigned graph.html stays offline 🟢🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_VIEWER-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:09.624Z |\n  | `test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:10.818Z |\n  | `test/viewer.test.ts::escapes \u003c/script> sequences in data` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:11.992Z |\n  | `test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:13.159Z |\n  | `test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)` | unit | ✅ green | tree 3a6023f0 | 2026-06-13T05:47:14.326Z |\n\n\n## Approvals & governance\n\n- _none recorded yet_\n\n## Recent activity\n\n- \u001b[2m2026-06-13 05:49:31\u001b[22m  🧾 task done REQUIREMENT_SERVE-03  [Pratiyush Kumar Singh]\n- \u001b[2m2026-06-13 05:49:31\u001b[22m  🏁 task REQUIREMENT_SERVE-03 → done\n- \u001b[2m2026-06-13 05:49:31\u001b[22m  🧾 task done REQUIREMENT_VIEWER-01  [Pratiyush Kumar Singh]\n- \u001b[2m2026-06-13 05:49:32\u001b[22m  🏁 task REQUIREMENT_VIEWER-01 → done\n- \u001b[2m2026-06-13 05:49:51\u001b[22m  🧾 spec tasks  [Pratiyush Kumar Singh]\n- \u001b[2m2026-06-13 05:49:51\u001b[22m  🔗 task REQUIREMENT_CLI-01 bindings → [test/cli.test.ts::help lists every verb; unknown verb exits 1]\n- \u001b[2m2026-06-13 05:49:51\u001b[22m  🧾 check run REQUIREMENT_CLI-01 test/cli.test.ts::help lists every verb; unknown verb exits 1  [Pratiyush Kumar Singh]\n- \u001b[2m2026-06-13 05:49:52\u001b[22m  ✅ check test/cli.test.ts::help lists every verb; unknown verb exits 1 @ tree 3a6023f0 → REQUIREMENT_CLI-01\n- \u001b[2m2026-06-13 05:49:52\u001b[22m  🧾 task done REQUIREMENT_CLI-01  [Pratiyush Kumar Singh]\n- \u001b[2m2026-06-13 05:49:52\u001b[22m  🏁 task REQUIREMENT_CLI-01 → done\n"
      },
      {
        "name": "TRACKING.md",
        "content": "# TRACKING — per-requirement Definition of Done (generated; do not edit)\n\n| Requirement | Title | Criteria | Proof | Task | Approved |\n|---|---|---|---|---|---|\n| REQUIREMENT_CLI-01 | the verb surface | 1 | 🟢 | done | — |\n| REQUIREMENT_CLI-02 | verbs work end to end on a real project | 1 | 🟢 | done | — |\n| REQUIREMENT_CLI-03 | watch, global, prs | 1 | 🟢 | done | — |\n| REQUIREMENT_CONTRACT-01 | the three artifacts, default revitify-out/ | 1 | 🟢 | done | — |\n| REQUIREMENT_CONTRACT-02 | Rivet's call shape stays supported forever | 1 | 🟢 | done | — |\n| REQUIREMENT_CONTRACT-03 | graph fields are additive-only | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_CONTRACT-04 | refactors never change output bytes | 1 | 🟢 | done | — |\n| REQUIREMENT_INTEL-01 | symbol→symbol call edges | 1 | 🟢 | done | — |\n| REQUIREMENT_INTEL-02 | tiered resolution precedence | 1 | 🟢 | done | — |\n| REQUIREMENT_INTEL-03 | near-duplicate doc nodes merge; code never does | 1 | 🟢 | done | — |\n| REQUIREMENT_INTEL-04 | structural communities, deterministic | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_MOD-01 | registry dispatch, not switches | 1 | 🟢 | done | — |\n| REQUIREMENT_MOD-02 | the lazy boundary | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_LANG-01 | deep member extraction per language | 1 | 🟢 | done | — |\n| REQUIREMENT_LANG-02 | the sync facade is frozen and deterministic | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_CACHE-01 | per-file cache with honest invalidation | 1 | 🟢 | done | — |\n| REQUIREMENT_PAR-01 | parallel extraction changes nothing but wall-clock | 1 | 🟢 | done | — |\n| REQUIREMENT_MM-01 | the offline gate is absolute | 1 | 🟢 | done | — |\n| REQUIREMENT_MM-02 | backend autodetection mirrors llm.py | 1 | 🟢 | done | — |\n| REQUIREMENT_MM-03 | offline schema/deps ingestion | 1 | 🟢 | done | — |\n| REQUIREMENT_MM-04 | local tools never become hard dependencies | 1 | 🟢 | done | — |\n| REQUIREMENT_QUERY-01 | path, neighborhood, affected | 1 | 🟢 | done | — |\n| REQUIREMENT_QUERY-02 | search, explain, communities, log | 1 | 🟢 | done | — |\n| REQUIREMENT_EXPORT-01 | the graphify export family | 1 | 🟢 | done | — |\n| REQUIREMENT_REPORT-01 | why-nodes | 1 | 🟢 | done | — |\n| REQUIREMENT_REPORT-02 | god nodes are symbols, not containers | 1 | 🟢 | done | — |\n| REQUIREMENT_REPORT-03 | the report carries its intelligence | 1 | 🟢 | done | — |\n| REQUIREMENT_RESOLVE-01 | every edge carries its confidence | 1 | 🟢 | done | — |\n| REQUIREMENT_RESOLVE-02 | ambiguity is tagged, never hidden | 1 | 🟢 | done | — |\n| REQUIREMENT_RESOLVE-03 | imports resolve against reality | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_RESOLVE-04 | never ingest your own output | 1 | 🟢 | done | — |\n| REQUIREMENT_SERVE-01 | HTTP viewer + API, traversal-proof | 1 | 🟢 | done | — |\n| REQUIREMENT_SERVE-02 | the 7 MCP tools | 1 | 🟢 | done | — |\n| REQUIREMENT_SERVE-03 | skill + self-checks | 1 | 🟢 | done | — |\n| REQUIREMENT_VIEWER-01 | the redesigned graph.html stays offline | 1 | 🟢 | done | — |\n"
      },
      {
        "name": "RESUME.md",
        "content": "# RESUME — state-only handoff (generated from the journal; do not edit)\n\nBoard: 35/35 task(s) done.\n\n✅ all task(s) done — nothing open. Next: `rivet graph build` → `rivet pr`.\n## Rebuild truth\n\n`rivet status` · `rivet graph build` · `rivet log -n 10`\n"
      }
    ]
  },
  "config": {
    "sections": [
      {
        "id": "project",
        "icon": "📦",
        "blurb": "Identity the boards and journal read from."
      },
      {
        "id": "mode",
        "icon": "🧭",
        "blurb": "How a request is routed into a workflow."
      },
      {
        "id": "intake",
        "icon": "📥",
        "blurb": "Where new work is ingested from."
      },
      {
        "id": "spec",
        "icon": "📐",
        "blurb": "How specs and acceptance criteria are shaped."
      },
      {
        "id": "build",
        "icon": "🔨",
        "blurb": "Coding discipline: tests, fences, retries, deps."
      },
      {
        "id": "verify",
        "icon": "✅",
        "blurb": "The proof engine — checks, stacks, runners."
      },
      {
        "id": "review",
        "icon": "🔎",
        "blurb": "Second-pass review before merge."
      },
      {
        "id": "pr",
        "icon": "🔀",
        "blurb": "Branching, CI and merge policy."
      },
      {
        "id": "memory",
        "icon": "🧠",
        "blurb": "Resume, journaling and drift detection."
      },
      {
        "id": "parallel",
        "icon": "⚡",
        "blurb": "Concurrent worktree execution."
      },
      {
        "id": "dashboard",
        "icon": "📊",
        "blurb": "The cockpit + notifications."
      },
      {
        "id": "rules",
        "icon": "⚖️",
        "blurb": "Laws, conflicts and id hygiene."
      },
      {
        "id": "learning",
        "icon": "🌱",
        "blurb": "Capturing and promoting learnings."
      },
      {
        "id": "gates",
        "icon": "🛡️",
        "blurb": "The moat: what must hold before done."
      },
      {
        "id": "graphify",
        "icon": "🕸️",
        "blurb": "The code-graph provider."
      }
    ],
    "manifest": [
      {
        "section": "project",
        "key": "name",
        "path": "project.name",
        "type": "string",
        "value": "untitled",
        "default": "untitled",
        "changed": false,
        "description": "Human-readable project name used in board headers and journal metadata."
      },
      {
        "section": "project",
        "key": "platforms",
        "path": "project.platforms",
        "type": "enum[]",
        "allowed": [
          "java-maven",
          "java-gradle",
          "spring",
          "quarkus",
          "node",
          "typescript",
          "electron",
          "react",
          "next",
          "angular",
          "python"
        ],
        "value": [
          "typescript"
        ],
        "default": [],
        "changed": true,
        "description": "Codebase platforms (an ARRAY — polyglot is normal). Drives stack inference and `init --platforms` best-practice packs. NOT runner ids like `node-vitest`."
      },
      {
        "section": "mode",
        "key": "routing",
        "path": "mode.routing",
        "type": "enum",
        "allowed": [
          "auto",
          "pick",
          "auto-override"
        ],
        "value": "auto-override",
        "default": "auto-override",
        "changed": false,
        "description": "How requests become workflows. `auto` picks the lane; `pick` always asks; `auto-override` routes automatically but lets you veto."
      },
      {
        "section": "mode",
        "key": "confirmFirst",
        "path": "mode.confirmFirst",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Show the chosen mode and reasoning, then pause for confirmation before proceeding."
      },
      {
        "section": "mode",
        "key": "researchMode",
        "path": "mode.researchMode",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Offer a research-only `investigate and report` mode that never changes code."
      },
      {
        "section": "mode",
        "key": "custom",
        "path": "mode.custom",
        "type": "record",
        "recordShape": {
          "generic": true
        },
        "value": {},
        "default": {},
        "changed": false,
        "description": "User-defined custom modes: name → description or workflow reference."
      },
      {
        "section": "intake",
        "key": "sources",
        "path": "intake.sources",
        "type": "enum[]",
        "allowed": [
          "raw",
          "github",
          "gitlab",
          "jira"
        ],
        "value": [
          "raw",
          "github"
        ],
        "default": [
          "raw",
          "github"
        ],
        "changed": false,
        "description": "Where new work is ingested from. `raw` = freeform prompts/files; the rest mirror external trackers."
      },
      {
        "section": "intake",
        "key": "jiraEpic",
        "path": "intake.jiraEpic",
        "type": "enum",
        "allowed": [
          "mirror",
          "replan",
          "ask"
        ],
        "value": "ask",
        "default": "ask",
        "changed": false,
        "description": "When a Jira epic lands: `mirror` it 1:1, `replan` into Rivet's own breakdown, or `ask` each time."
      },
      {
        "section": "intake",
        "key": "writeBack",
        "path": "intake.writeBack",
        "type": "boolean",
        "value": false,
        "default": false,
        "changed": false,
        "description": "Push status and links back to the originating tracker as tasks complete."
      },
      {
        "section": "spec",
        "key": "style",
        "path": "spec.style",
        "type": "enum",
        "allowed": [
          "checklist",
          "stories",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Shape of the spec: terse `checklist`, user `stories`, or `both` side by side."
      },
      {
        "section": "spec",
        "key": "acceptanceCriteria",
        "path": "spec.acceptanceCriteria",
        "type": "enum",
        "allowed": [
          "tool-drafts",
          "user-writes"
        ],
        "value": "tool-drafts",
        "default": "tool-drafts",
        "changed": false,
        "description": "Who authors acceptance criteria — the tool drafts and you edit, or you write from scratch."
      },
      {
        "section": "spec",
        "key": "criteriaFormat",
        "path": "spec.criteriaFormat",
        "type": "enum",
        "allowed": [
          "gherkin",
          "ears",
          "plain",
          "mixed"
        ],
        "value": "gherkin",
        "default": "gherkin",
        "changed": false,
        "description": "Criteria syntax. `gherkin` (default): Scenario / Scenario Outline + Examples. Both grammars always parse and bind; off-format criteria lint (warn-only). `mixed` accepts both silently."
      },
      {
        "section": "spec",
        "key": "breakdownDepth",
        "path": "spec.breakdownDepth",
        "type": "enum",
        "allowed": [
          "feature-story-task-subtask",
          "task-subtask"
        ],
        "value": "feature-story-task-subtask",
        "default": "feature-story-task-subtask",
        "changed": false,
        "description": "How deep work is decomposed: full feature→story→task→subtask, or just task→subtask."
      },
      {
        "section": "spec",
        "key": "estimates",
        "path": "spec.estimates",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Attach effort estimates to derived tasks."
      },
      {
        "section": "spec",
        "key": "autoDependencies",
        "path": "spec.autoDependencies",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Infer dependencies between tasks automatically while planning."
      },
      {
        "section": "spec",
        "key": "diagram",
        "path": "spec.diagram",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Generate a diagram alongside the spec when it helps comprehension."
      },
      {
        "section": "spec",
        "key": "gapHunting",
        "path": "spec.gapHunting",
        "type": "enum",
        "allowed": [
          "off",
          "propose",
          "auto"
        ],
        "value": "propose",
        "default": "propose",
        "changed": false,
        "description": "Actively hunt missing edge cases. `propose` surfaces gaps for review; `auto` files them as criteria."
      },
      {
        "section": "spec",
        "key": "riskWarn",
        "path": "spec.riskWarn",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Warn and suggest splitting big or risky changes before any work starts."
      },
      {
        "section": "spec",
        "key": "livingPlan",
        "path": "spec.livingPlan",
        "type": "enum",
        "allowed": [
          "frozen",
          "update-ask",
          "update-auto"
        ],
        "value": "update-ask",
        "default": "update-ask",
        "changed": false,
        "description": "Whether the plan may evolve mid-build: frozen after approval, update with approval, or update freely."
      },
      {
        "section": "spec",
        "key": "onVague",
        "path": "spec.onVague",
        "type": "enum",
        "allowed": [
          "clarify",
          "guess-flag"
        ],
        "value": "clarify",
        "default": "clarify",
        "changed": false,
        "description": "When a request is vague: stop and `clarify`, or `guess-flag` — proceed and mark every assumption."
      },
      {
        "section": "build",
        "key": "tests",
        "path": "build.tests",
        "type": "enum",
        "allowed": [
          "tdd",
          "code-first",
          "either"
        ],
        "value": "tdd",
        "default": "tdd",
        "changed": false,
        "description": "Test discipline. `tdd` writes the failing check first; `code-first` tests after; `either` lets the agent choose."
      },
      {
        "section": "build",
        "key": "fileFence",
        "path": "build.fileFence",
        "type": "boolean",
        "value": false,
        "default": false,
        "changed": false,
        "description": "Confine each task's writes to its declared file set; out-of-fence edits are blocked."
      },
      {
        "section": "build",
        "key": "retryLimit",
        "path": "build.retryLimit",
        "type": "number",
        "min": 0,
        "value": 3,
        "default": 3,
        "changed": false,
        "description": "How many times a failing check may be retried before escalating to you."
      },
      {
        "section": "build",
        "key": "checkFrequency",
        "path": "build.checkFrequency",
        "type": "enum",
        "allowed": [
          "per-change",
          "per-task"
        ],
        "value": "per-task",
        "default": "per-task",
        "changed": false,
        "description": "Run bound checks after every change, or once per task before done."
      },
      {
        "section": "build",
        "key": "whenStuck",
        "path": "build.whenStuck",
        "type": "enum",
        "allowed": [
          "ask",
          "grind",
          "bounded-then-ask"
        ],
        "value": "bounded-then-ask",
        "default": "bounded-then-ask",
        "changed": false,
        "description": "When blocked: ask immediately, grind on, or grind within a bound and then ask."
      },
      {
        "section": "build",
        "key": "codeStyle",
        "path": "build.codeStyle",
        "type": "enum",
        "allowed": [
          "match-repo",
          "style-guide",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Match the surrounding repo style, follow the style guide, or both."
      },
      {
        "section": "build",
        "key": "reuse",
        "path": "build.reuse",
        "type": "enum",
        "allowed": [
          "prefer",
          "fresh-ok",
          "prefer-flag"
        ],
        "value": "prefer",
        "default": "prefer",
        "changed": false,
        "description": "Prefer existing code before writing new (`prefer-flag` also reports what was reused)."
      },
      {
        "section": "build",
        "key": "comments",
        "path": "build.comments",
        "type": "enum",
        "allowed": [
          "minimal",
          "moderate",
          "heavy"
        ],
        "value": "moderate",
        "default": "moderate",
        "changed": false,
        "description": "Comment density for generated code."
      },
      {
        "section": "build",
        "key": "commitCadence",
        "path": "build.commitCadence",
        "type": "enum",
        "allowed": [
          "per-step",
          "per-task"
        ],
        "value": "per-task",
        "default": "per-task",
        "changed": false,
        "description": "Commit after each step or once per completed task."
      },
      {
        "section": "build",
        "key": "newDeps",
        "path": "build.newDeps",
        "type": "enum",
        "allowed": [
          "ask",
          "auto",
          "ask-big"
        ],
        "value": "ask-big",
        "default": "ask-big",
        "changed": false,
        "description": "Adding a dependency: always `ask`, `auto`-approve, or only ask for big ones (`ask-big`)."
      },
      {
        "section": "verify",
        "key": "kinds",
        "path": "verify.kinds",
        "type": "enum[]",
        "allowed": [
          "unit",
          "integration",
          "api",
          "e2e",
          "visual",
          "parity"
        ],
        "value": [
          "unit",
          "integration",
          "api",
          "e2e"
        ],
        "default": [
          "unit",
          "integration",
          "api",
          "e2e"
        ],
        "changed": false,
        "description": "Which proof kinds criteria may bind to. Custom kinds wired in kindRunners run too."
      },
      {
        "section": "verify",
        "key": "defaultStack",
        "path": "verify.defaultStack",
        "type": "string",
        "value": null,
        "default": null,
        "changed": false,
        "description": "Stack used when `--stack` is omitted. Resolution: flag → this → inferred from platforms → error."
      },
      {
        "section": "verify",
        "key": "buildAll",
        "path": "verify.buildAll",
        "type": "json",
        "value": [],
        "default": [],
        "changed": false,
        "description": "Build steps `rivet verify` runs before the test kinds (`Build ALL`). Empty → node-ish platforms fall back to package.json build/typecheck scripts. Edited as JSON: an array of { cmd, args }."
      },
      {
        "section": "verify",
        "key": "coverage",
        "path": "verify.coverage",
        "type": "number",
        "min": 0,
        "max": 100,
        "nullable": true,
        "value": null,
        "default": null,
        "changed": false,
        "description": "Minimum coverage percentage gate; null = judge by criteria coverage, not a number."
      },
      {
        "section": "verify",
        "key": "blockDoneOnFail",
        "path": "verify.blockDoneOnFail",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "A task cannot be marked done while bound checks fail — or while a passing proof is STALE (recorded on an older code tree)."
      },
      {
        "section": "verify",
        "key": "everyCriterionNeedsCheck",
        "path": "verify.everyCriterionNeedsCheck",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Every acceptance criterion must bind to at least one executable check."
      },
      {
        "section": "verify",
        "key": "runApp",
        "path": "verify.runApp",
        "type": "boolean",
        "value": false,
        "default": false,
        "changed": false,
        "description": "Boot the app for api/e2e checks using verify.app's lifecycle."
      },
      {
        "section": "verify",
        "key": "ui",
        "path": "verify.ui",
        "type": "enum",
        "allowed": [
          "off",
          "screenshot",
          "browser",
          "both"
        ],
        "value": "off",
        "default": "off",
        "changed": false,
        "description": "Visual/UI verification method for ui-flavored checks."
      },
      {
        "section": "verify",
        "key": "sandbox",
        "path": "verify.sandbox",
        "type": "enum",
        "allowed": [
          "sandbox",
          "local"
        ],
        "value": "local",
        "default": "local",
        "changed": false,
        "description": "Run checks in an isolated sandbox or directly on this machine."
      },
      {
        "section": "verify",
        "key": "security",
        "path": "verify.security",
        "type": "enum",
        "allowed": [
          "off",
          "pre-pr",
          "on-demand"
        ],
        "value": "on-demand",
        "default": "on-demand",
        "changed": false,
        "description": "When security review runs: never, before every PR, or on demand."
      },
      {
        "section": "verify",
        "key": "lintTypes",
        "path": "verify.lintTypes",
        "type": "enum",
        "allowed": [
          "part-of-done",
          "separate"
        ],
        "value": "part-of-done",
        "default": "part-of-done",
        "changed": false,
        "description": "Lint/type checks count as part of done, or run as a separate concern."
      },
      {
        "section": "verify",
        "key": "flaky",
        "path": "verify.flaky",
        "type": "enum",
        "allowed": [
          "retry-flag",
          "quarantine"
        ],
        "value": "retry-flag",
        "default": "retry-flag",
        "changed": false,
        "description": "Flaky checks: retry and flag the flakiness, or quarantine them."
      },
      {
        "section": "verify",
        "key": "runners",
        "path": "verify.runners",
        "type": "record",
        "recordShape": {
          "cmd": "string",
          "args": "string[]"
        },
        "value": {},
        "default": {},
        "changed": false,
        "description": "Custom check-runner commands keyed by STACK name. Args support {ref}/{file}/{name} placeholders; matching keys override built-ins, new keys define new stacks."
      },
      {
        "section": "verify",
        "key": "kindRunners",
        "path": "verify.kindRunners",
        "type": "record",
        "recordShape": {
          "cmd": "string",
          "args": "string[]"
        },
        "value": {},
        "default": {},
        "changed": false,
        "description": "Kind-level runner templates (lint, audit, visual…) with the same placeholders. Precedence: kindRunners > runners > builtin."
      },
      {
        "section": "verify",
        "key": "app",
        "path": "verify.app",
        "type": "object",
        "fields": [
          {
            "key": "start",
            "type": "string[]"
          },
          {
            "key": "readyUrl",
            "type": "string"
          },
          {
            "key": "readyTimeoutMs",
            "type": "number",
            "min": 1
          }
        ],
        "value": {
          "start": [],
          "readyUrl": null,
          "readyTimeoutMs": 30000
        },
        "default": {
          "start": [],
          "readyUrl": null,
          "readyTimeoutMs": 30000
        },
        "changed": false,
        "description": "How to boot the app for runApp checks: start argv, readiness URL polled until it answers, and the wait budget."
      },
      {
        "section": "review",
        "key": "separateReviewer",
        "path": "review.separateReviewer",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Review with a fresh agent that didn't write the code, to avoid author bias."
      },
      {
        "section": "review",
        "key": "angles",
        "path": "review.angles",
        "type": "enum[]",
        "allowed": [
          "correctness",
          "security",
          "performance",
          "style"
        ],
        "value": [
          "correctness",
          "security",
          "performance",
          "style"
        ],
        "default": [
          "correctness",
          "security",
          "performance",
          "style"
        ],
        "changed": false,
        "description": "Which review angles run on every change."
      },
      {
        "section": "review",
        "key": "passes",
        "path": "review.passes",
        "type": "enum",
        "allowed": [
          "blind",
          "context",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Blind diff-only pass, full-context pass, or both."
      },
      {
        "section": "review",
        "key": "fixFindings",
        "path": "review.fixFindings",
        "type": "enum",
        "allowed": [
          "auto",
          "list",
          "auto-small"
        ],
        "value": "list",
        "default": "list",
        "changed": false,
        "description": "What happens to findings: auto-fix, list for the human, or auto-fix only small ones."
      },
      {
        "section": "pr",
        "key": "autoBody",
        "path": "pr.autoBody",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Generate the PR body from the Verified Traceability Graph."
      },
      {
        "section": "pr",
        "key": "branchPattern",
        "path": "pr.branchPattern",
        "type": "string",
        "value": "{type}/{slug}",
        "default": "{type}/{slug}",
        "changed": false,
        "description": "Branch name template; {type} and {slug} interpolate per change."
      },
      {
        "section": "pr",
        "key": "merge",
        "path": "pr.merge",
        "type": "enum",
        "allowed": [
          "auto-on-green",
          "manual"
        ],
        "value": "manual",
        "default": "manual",
        "changed": false,
        "description": "Merge policy: automatically once green, or wait for the human."
      },
      {
        "section": "pr",
        "key": "waitForCI",
        "path": "pr.waitForCI",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Block merge until remote CI is green, not just local checks."
      },
      {
        "section": "pr",
        "key": "commitAuthor",
        "path": "pr.commitAuthor",
        "type": "enum",
        "allowed": [
          "user",
          "co-author"
        ],
        "value": "user",
        "default": "user",
        "changed": false,
        "description": "Commits are authored by the human; `co-author` adds the agent as a trailer. Default: human only."
      },
      {
        "section": "pr",
        "key": "cleanupAfterMerge",
        "path": "pr.cleanupAfterMerge",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Delete branches/worktrees after a merged PR."
      },
      {
        "section": "memory",
        "key": "crashResume",
        "path": "memory.crashResume",
        "type": "enum",
        "allowed": [
          "exact",
          "restart"
        ],
        "value": "exact",
        "default": "exact",
        "changed": false,
        "description": "After a crash: resume exactly mid-task, or restart the task cleanly."
      },
      {
        "section": "memory",
        "key": "journal",
        "path": "memory.journal",
        "type": "enum",
        "allowed": [
          "full",
          "milestones"
        ],
        "value": "full",
        "default": "full",
        "changed": false,
        "description": "Journal verbosity. `full` records every CLI run; `milestones` keeps only state-changing events."
      },
      {
        "section": "memory",
        "key": "driftDetection",
        "path": "memory.driftDetection",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Mark passing proofs STALE when the code they ran against has since changed."
      },
      {
        "section": "parallel",
        "key": "enabled",
        "path": "parallel.enabled",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Run independent tasks concurrently in isolated worktrees."
      },
      {
        "section": "parallel",
        "key": "waveSize",
        "path": "parallel.waveSize",
        "type": "number",
        "min": 1,
        "value": 6,
        "default": 6,
        "changed": false,
        "description": "Max concurrent worktree tasks (~6 avoids rate-limit wipeouts)."
      },
      {
        "section": "parallel",
        "key": "isolation",
        "path": "parallel.isolation",
        "type": "enum",
        "allowed": [
          "worktree",
          "shared"
        ],
        "value": "worktree",
        "default": "worktree",
        "changed": false,
        "description": "Each parallel task gets its own worktree, or they share the checkout."
      },
      {
        "section": "parallel",
        "key": "onFileClash",
        "path": "parallel.onFileClash",
        "type": "enum",
        "allowed": [
          "serialize",
          "warn",
          "both"
        ],
        "value": "serialize",
        "default": "serialize",
        "changed": false,
        "description": "When two tasks want the same file: serialize them, warn, or both."
      },
      {
        "section": "parallel",
        "key": "coordinator",
        "path": "parallel.coordinator",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Run a coordinator that sequences merges and resolves conflicts between waves."
      },
      {
        "section": "dashboard",
        "key": "enabled",
        "path": "dashboard.enabled",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Generate the cockpit (dashboard + config studio)."
      },
      {
        "section": "dashboard",
        "key": "refreshSeconds",
        "path": "dashboard.refreshSeconds",
        "type": "number",
        "min": 5,
        "max": 300,
        "value": 15,
        "default": 15,
        "changed": false,
        "description": "How often the open cockpit reloads its data sidecar, in seconds."
      },
      {
        "section": "dashboard",
        "key": "form",
        "path": "dashboard.form",
        "type": "enum",
        "allowed": [
          "web",
          "editor",
          "both"
        ],
        "value": "web",
        "default": "web",
        "changed": false,
        "description": "Cockpit form factor: web page, editor panel, or both."
      },
      {
        "section": "dashboard",
        "key": "updates",
        "path": "dashboard.updates",
        "type": "enum",
        "allowed": [
          "live",
          "on-demand"
        ],
        "value": "live",
        "default": "live",
        "changed": false,
        "description": "`live`: the data sidecar is rewritten automatically after every task done / check run, so the open cockpit stays current."
      },
      {
        "section": "dashboard",
        "key": "notify",
        "path": "dashboard.notify",
        "type": "object",
        "fields": [
          {
            "key": "channels",
            "type": "enum[]",
            "allowed": [
              "desktop",
              "slack",
              "email"
            ]
          },
          {
            "key": "on",
            "type": "enum[]",
            "allowed": [
              "gates",
              "done"
            ]
          }
        ],
        "value": {
          "channels": [],
          "on": []
        },
        "default": {
          "channels": [],
          "on": []
        },
        "changed": false,
        "description": "Where and when to send notifications about run events."
      },
      {
        "section": "rules",
        "key": "laws",
        "path": "rules.laws",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Load the laws files (.rivet/laws.md + scoped laws) into every run."
      },
      {
        "section": "rules",
        "key": "onConflict",
        "path": "rules.onConflict",
        "type": "enum",
        "allowed": [
          "refuse",
          "warn"
        ],
        "value": "warn",
        "default": "warn",
        "changed": false,
        "description": "When an instruction conflicts with a law: refuse, or warn and continue."
      },
      {
        "section": "rules",
        "key": "inheritPersonal",
        "path": "rules.inheritPersonal",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Layer your personal ~/.rivet laws underneath the project's."
      },
      {
        "section": "rules",
        "key": "requireQualifiedIds",
        "path": "rules.requireQualifiedIds",
        "type": "enum",
        "allowed": [
          "warn",
          "error",
          "off"
        ],
        "value": "warn",
        "default": "warn",
        "changed": false,
        "description": "Requirement ids must self-describe: REQUIREMENT_/NFR_/ADR_. Legacy `R-` ids still parse but lint at this severity."
      },
      {
        "section": "learning",
        "key": "capture",
        "path": "learning.capture",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Record lessons into learnings.md as work proceeds."
      },
      {
        "section": "learning",
        "key": "promoteToRules",
        "path": "learning.promoteToRules",
        "type": "enum",
        "allowed": [
          "off",
          "ask",
          "auto"
        ],
        "value": "ask",
        "default": "ask",
        "changed": false,
        "description": "Turn confirmed lessons into enforced laws: never, with approval, or automatically."
      },
      {
        "section": "learning",
        "key": "bugToTest",
        "path": "learning.bugToTest",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Every fixed bug must leave behind a regression check that would have caught it."
      },
      {
        "section": "learning",
        "key": "scope",
        "path": "learning.scope",
        "type": "enum",
        "allowed": [
          "project",
          "global",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Where lessons apply: this project, globally, or both."
      },
      {
        "section": "learning",
        "key": "retro",
        "path": "learning.retro",
        "type": "enum",
        "allowed": [
          "per-feature",
          "on-demand"
        ],
        "value": "per-feature",
        "default": "per-feature",
        "changed": false,
        "description": "Run the retro loop after every feature, or only on demand."
      },
      {
        "section": "learning",
        "key": "warnOnRepeat",
        "path": "learning.warnOnRepeat",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Surface matching OPEN lessons when a task starts — before the mistake repeats."
      },
      {
        "section": "learning",
        "key": "share",
        "path": "learning.share",
        "type": "enum",
        "allowed": [
          "personal",
          "team"
        ],
        "value": "personal",
        "default": "personal",
        "changed": false,
        "description": "Keep learnings personal or share them with the team."
      },
      {
        "section": "gates",
        "key": "facts",
        "path": "gates.facts",
        "type": "enum",
        "allowed": [
          "off",
          "on"
        ],
        "value": "off",
        "default": "off",
        "changed": false,
        "description": "DENY→FORCE→ALLOW investigative gate: the first edit is blocked until named facts are gathered."
      },
      {
        "section": "gates",
        "key": "negativeFloor",
        "path": "gates.negativeFloor",
        "type": "enum",
        "allowed": [
          "on",
          "off"
        ],
        "value": "on",
        "default": "on",
        "changed": false,
        "description": "Every requirement needs ≥1 negative/failure criterion or graph build flags it. Prose mandates are ignorable; floors aren't."
      },
      {
        "section": "gates",
        "key": "require",
        "path": "gates.require",
        "type": "string[]",
        "value": [],
        "default": [],
        "changed": false,
        "description": "Gate packs enforced on every spec (empty by default — ceremony stays proportional)."
      },
      {
        "section": "gates",
        "key": "packs",
        "path": "gates.packs",
        "type": "record",
        "recordShape": {
          "generic": true
        },
        "value": {
          "security": {
            "sections": [
              "Security"
            ],
            "kinds": [],
            "triggers": [
              "auth",
              "login",
              "password",
              "token",
              "secret",
              "payment",
              "crypt",
              "session",
              "permission",
              "sql"
            ]
          },
          "contracts": {
            "sections": [
              "API Contract"
            ],
            "kinds": [
              "api"
            ],
            "triggers": []
          },
          "nfr": {
            "sections": [
              "NFR"
            ],
            "kinds": [],
            "triggers": []
          },
          "rollback": {
            "sections": [
              "Rollback"
            ],
            "kinds": [],
            "triggers": []
          }
        },
        "default": {
          "security": {
            "sections": [
              "Security"
            ],
            "kinds": [],
            "triggers": [
              "auth",
              "login",
              "password",
              "token",
              "secret",
              "payment",
              "crypt",
              "session",
              "permission",
              "sql"
            ]
          },
          "contracts": {
            "sections": [
              "API Contract"
            ],
            "kinds": [
              "api"
            ],
            "triggers": []
          },
          "nfr": {
            "sections": [
              "NFR"
            ],
            "kinds": [],
            "triggers": []
          },
          "rollback": {
            "sections": [
              "Rollback"
            ],
            "kinds": [],
            "triggers": []
          }
        },
        "changed": false,
        "description": "Named gate packs: required spec sections, required check kinds, and routing triggers. Edited as JSON per entry."
      },
      {
        "section": "graphify",
        "key": "provider",
        "path": "graphify.provider",
        "type": "enum",
        "allowed": [
          "revitify",
          "graphify"
        ],
        "value": "revitify",
        "default": "revitify",
        "changed": false,
        "description": "Who builds the code graph. `revitify` (bundled TS, zero installs) or the external Python `graphify` (multi-modal, opt-in)."
      },
      {
        "section": "graphify",
        "key": "outDir",
        "path": "graphify.outDir",
        "type": "string",
        "value": "graphify-out",
        "default": "graphify-out",
        "changed": false,
        "description": "Directory the code-graph artifacts are written to (gitignored, derived)."
      },
      {
        "section": "graphify",
        "key": "freshness",
        "path": "graphify.freshness",
        "type": "enum",
        "allowed": [
          "post-commit-hook",
          "update-on-run",
          "watch",
          "manual"
        ],
        "value": "update-on-run",
        "default": "update-on-run",
        "changed": false,
        "description": "How the code graph is kept fresh."
      }
    ]
  }
};
