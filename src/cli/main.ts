#!/usr/bin/env node
/**
 * The revitify CLI — thin dispatcher; every verb lazy-loads its module so `revitify build`
 * never pays for chokidar and `revitify --help` pays for nothing at all.
 */

interface Verb {
  run(args: string[]): Promise<number>;
}

const VERBS: Record<string, { load: () => Promise<Verb>; help: string }> = {
  build: { load: () => import("./verbs/build.js"), help: "build [path] — full graph + artifacts" },
  update: { load: () => import("./verbs/build.js"), help: "update [path] — alias of build" },
  query: { load: () => import("./verbs/query.js"), help: "query <terms…> — idf-ranked search" },
  explain: { load: () => import("./verbs/query.js"), help: "explain <terms…> — narrated subgraph" },
  path: { load: () => import("./verbs/query.js"), help: "path <from> <to> — shortest path" },
  affected: { load: () => import("./verbs/query.js"), help: "affected <id|label> — blast radius" },
  communities: { load: () => import("./verbs/query.js"), help: "communities — roster + cohesion" },
  export: {
    load: () => import("./verbs/export.js"),
    help: "export [ids…] — callflow/graph-lite/tree/wiki/mermaid",
  },
  watch: { load: () => import("./verbs/watch.js"), help: "watch [path] — incremental re-index" },
  global: { load: () => import("./verbs/global.js"), help: "global <paths…> — multi-repo graph" },
  prs: { load: () => import("./verbs/prs.js"), help: "prs [base] — diff impact report" },
  validate: {
    load: () => import("./verbs/validate.js"),
    help: "validate [graph.json] — contract check",
  },
  serve: {
    load: () => import("./verbs/serve.js"),
    help: "serve [path] [--port N] — HTTP viewer + API",
  },
  mcp: {
    load: () => import("./verbs/serve.js"),
    help: "mcp [path] — stdio MCP server (query_graph …)",
  },
  diagnose: {
    load: () => import("./verbs/diagnose.js"),
    help: "diagnose [path] — grammars/cache self-check",
  },
  install: {
    load: () => import("./verbs/install.js"),
    help: "install [path] — add the /revitify skill",
  },
};

async function main(): Promise<number> {
  const [verb, ...args] = process.argv.slice(2);
  if (!verb || verb === "--help" || verb === "-h" || !(verb in VERBS)) {
    const lines = Object.values(VERBS).map((v) => `  revitify ${v.help}`);
    console.log(
      `revitify — code knowledge graph (graphify output contract)\n\n${lines.join("\n")}`,
    );
    return verb && verb !== "--help" && verb !== "-h" ? 1 : 0;
  }
  const mod = await (VERBS[verb] as { load: () => Promise<Verb> }).load();
  // Re-pass the verb: shared modules (query.js) dispatch on it.
  return mod.run([verb, ...args]);
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(String(err));
    process.exit(1);
  },
);
