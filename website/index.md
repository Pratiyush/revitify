---
layout: home

hero:
  name: Revitify
  text: Your code, as a knowledge graph
  tagline: A native-TypeScript engine that turns any codebase into a queryable graph of nodes and links — symbols, calls, imports, docstrings, communities — fully offline, zero Python.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: How nodes work
      link: /guide/concepts
    - theme: alt
      text: Languages
      link: /guide/languages

features:
  - icon: 🕸️
    title: Real symbols, not regex
    details: TypeScript via the compiler API; Python, Java, Go, Rust, Ruby, C/C++, C#, Bash, PHP, Scala, Kotlin via tree-sitter. Classes, methods, constructors, fields, calls, imports — extracted from real ASTs.
  - icon: 🔗
    title: Edges that mean something
    details: Every link is typed (contains, imports, calls, references…) and confidence-tagged — EXTRACTED, INFERRED, or AMBIGUOUS — so you know what the graph is sure about and what it's guessing.
  - icon: 🧭
    title: Ask the graph questions
    details: query · explain · path · affected · communities. Find a concept, trace a call path, compute a change's blast radius, or surface the load-bearing "god nodes" — from the CLI, an HTTP API, or MCP.
  - icon: 🔌
    title: Offline by default
    details: Code-only runs need zero API keys and zero network. Heavy pieces (grammars, LLM backends, the MCP SDK) load lazily — importing the library never pulls them in.
  - icon: 📈
    title: Scales with a cache
    details: A SHA-256 + stat-index per-file cache makes re-indexing proportional to your edit. Worker-thread parallelism for large repos. ~15 ms warm on a 150-file project.
  - icon: 🧱
    title: Modular by enforcement
    details: Layered architecture (model → extract → ingest → passes → enrich → query → export → serve → cli) with dependency-cruiser-enforced boundaries. Adding a language is a new module, not a switch edit.
---

## In one command

```sh
npx revitify build .
```

…writes `revitify-out/`:

```
revitify-out/
├── graph.json       every node + link (the data your tools consume)
├── graph.html       a self-contained interactive viewer — open it in a browser
└── GRAPH_REPORT.md  god nodes, surprising connections, a confidence ledger, suggested questions
```

Then explore it:

```sh
revitify query "auth"          # idf-ranked search across the graph
revitify affected AuthService  # what breaks if this changes?
revitify serve                 # HTTP viewer + JSON API at http://127.0.0.1:7077
revitify mcp                   # expose the graph to an AI assistant over MCP
```

> Revitify is a modular, native-TypeScript reimplementation of the concepts in
> [graphify](https://github.com/safishamsi/graphify) (MIT). Same output contract, zero Python.
