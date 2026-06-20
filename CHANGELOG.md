# Changelog

All notable changes to revitify are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to adhere to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation: a programmatic **Library (API)** guide and a **Troubleshooting** guide on the docs
  site; root `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CLAUDE.md`, PR/issue templates,
  and Dependabot.

### Fixed
- Hardening pass: shared `serve/handlers.ts` so the HTTP and MCP query surfaces can't drift; an
  `OLLAMA_HOST` scheme guard (no arbitrary-scheme redirect); `collectCalls` now captures
  element-access and tagged-template callees.

## [0.1.0] — 2026-06

Initial public release.

### Added
- Native-TypeScript code-knowledge-graph engine with graphify's exact output contract
  (`graph.json` · `graph.html` · `GRAPH_REPORT.md`), verified byte-stable.
- Extraction: TypeScript/JavaScript via the compiler API (sync, full depth); Python, Java, Go, Rust,
  Ruby, C/C++, C#, Bash, PHP, Scala, Kotlin via tree-sitter (async); SQL, Cargo.toml, Markdown, JSON.
- Intelligence: 3-tier symbol resolution with `EXTRACTED`/`INFERRED`/`AMBIGUOUS` confidence,
  minhash+LSH doc dedup, Louvain+Leiden communities, a god-node/surprise/confidence report.
- Queries: `query`, `explain`, `path`, `affected`, `communities` — from the CLI, an HTTP JSON API,
  and an MCP server (7 tools).
- Public API: `buildGraph` / `revitify` (sync) and `buildGraphAsync` / `revitifyAsync` (full engine),
  plus `assertGraphContract`, `CONTRACT`, `renderReport`, `walkFiles`.
- Per-file SHA-256 cache with a stat-index fastpath and worker-thread parallelism above ~50 files.
- A self-contained Cytoscape viewer and five opt-in exporters (callflow-html, graph-lite, tree-html,
  wiki, mermaid).

[Unreleased]: https://github.com/Pratiyush/revitify/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Pratiyush/revitify/releases/tag/v0.1.0
