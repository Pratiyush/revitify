/**
 * Enforced layer boundaries (docs/PLAN.md matrix). graphify has no boundary enforcement;
 * this is revitify's structural edge. Layers arrive with Phase 1 — rules are written against
 * the target layout so they bind the moment a layer directory exists.
 */

/** A layer may import model/ plus its allowlist; everything else in src/ is forbidden. */
const layer = (name, allowed) => ({
  name: `layer-${name}`,
  severity: "error",
  comment: `src/${name} may import only: model${allowed.length ? ", " + allowed.join(", ") : ""}`,
  from: { path: `^src/${name}/` },
  to: {
    path: "^src/",
    pathNot: [`^src/${name}/`, "^src/model/", ...allowed.map((a) => `^src/${a}/`)],
  },
});

module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    {
      name: "no-orphans",
      severity: "error",
      from: { orphan: true, pathNot: ["\\.d\\.ts$"] },
      to: {},
    },
    {
      name: "model-is-pure",
      severity: "error",
      comment: "model/ is types + validators only — no node:* or any runtime dependency",
      from: { path: "^src/model/" },
      to: { dependencyTypes: ["core"] },
    },
    layer("extract", []),
    layer("ingest", ["extract"]),
    layer("cache", []),
    layer("passes", ["extract", "ingest", "cache"]),
    layer("query", []),
    layer("enrich", ["query"]),
    layer("export", ["enrich", "query"]),
    layer("serve", ["passes", "enrich", "query", "export", "cache"]),
    // cli may import everything — no rule.
    {
      name: "facade-imports",
      severity: "error",
      comment: "src/index.ts is the thin facade: model, ingest, passes, enrich, export only",
      from: { path: "^src/index\\.ts$" },
      to: {
        path: "^src/",
        pathNot: [
          "^src/model/",
          "^src/ingest/",
          "^src/passes/",
          "^src/enrich/",
          "^src/export/",
          // Pre-Phase-1 flat modules; remove with the modularization move.
          "^src/(ingest|html|types)\\.js$",
          "^src/(ingest|html|types)\\.ts$",
        ],
      },
    },
    {
      name: "only-cli-imports-facade",
      severity: "error",
      comment: "prevents cycles through the facade",
      from: { path: "^src/", pathNot: ["^src/cli/", "^src/index\\.ts$"] },
      to: { path: "^src/index\\.(ts|js)$" },
    },
    {
      name: "lazy-zones-dynamic-only",
      severity: "error",
      comment:
        "heavy deps (tree-sitter, MCP SDK, LLM backends) reachable only via dynamic import — keeps `import { revitify }` lean",
      from: { path: "^src/", pathNot: ["^src/extract/treesitter/", "^src/serve/", "^src/ingest/llm/"] },
      to: {
        path: "(^src/extract/treesitter/|^src/serve/mcp|^src/ingest/llm/)",
        dependencyTypesNot: ["dynamic-import"],
      },
    },
    {
      name: "src-never-imports-test",
      severity: "error",
      from: { path: "^src/" },
      to: { path: "^test/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
