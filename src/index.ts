import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ExportContext } from "./export/exporter.js";
import { defaultExporters } from "./export/index.js";
import type { RevitifyGraph } from "./model/graph.js";
import { buildGraphFromRoot } from "./passes/pipeline.js";

export { renderReport } from "./export/report.js";
export { walkFiles } from "./ingest/walk.js";
export { Confidence } from "./model/confidence.js";
export { assertGraphContract, CONTRACT } from "./model/contract.js";
export type { RevitifyGraph, RevitifyLink, RevitifyNode } from "./model/graph.js";

/**
 * Revitify — Rivet's native TypeScript counterpart to graphify (concepts adapted from
 * github.com/safishamsi/graphify, MIT; original implementation). Turns a folder of code + docs
 * into a queryable knowledge graph with graphify's exact output contract:
 *   revitify-out/graph.json · graph.html · GRAPH_REPORT.md
 * Default outDir is revitify-out/ so a Python-graphify run (graphify-out/) can sit alongside for
 * comparison; Rivet passes outDir="graphify-out" explicitly — that call shape stays supported.
 *
 * This file is the frozen facade: `buildGraph` and `revitify` keep their signatures forever.
 * The engine lives in the layers (model → extract → ingest → passes → enrich → export), each
 * behind a registry — see docs/PLAN.md for the architecture and dependency-cruiser for the
 * enforced boundaries.
 */

export function buildGraph(rootDir: string): RevitifyGraph {
  return buildGraphFromRoot(rootDir);
}

export interface RevitifyResult {
  graphJsonPath: string;
  counts: { nodes: number; links: number };
}

/** The one-call entrypoint: ingest → emit the full output contract into outDir. */
export function revitify(rootDir: string, outDir = "revitify-out"): RevitifyResult {
  const graph = buildGraph(rootDir);
  const out = join(rootDir, outDir);
  mkdirSync(out, { recursive: true });
  const ctx: ExportContext = { rootDir, outDir: out };
  let graphJsonPath = join(out, "graph.json");
  for (const exporter of defaultExporters) {
    const path = join(out, exporter.filename);
    if (exporter.id === "json") graphJsonPath = path;
    writeFileSync(path, exporter.render(graph, ctx));
  }
  return { graphJsonPath, counts: { nodes: graph.nodes.length, links: graph.links.length } };
}
