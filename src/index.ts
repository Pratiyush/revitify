import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defaultExporters } from "./export/index.js";
import type { RevitifyGraph } from "./model/graph.js";
import { buildGraphFromRoot } from "./passes/pipeline.js";
import { type BuildOptions, buildGraphFromRootAsync } from "./passes/pipeline-async.js";

export { renderReport } from "./export/report.js";
export { walkFiles } from "./ingest/walk.js";
export { Confidence } from "./model/confidence.js";
export { assertGraphContract, CONTRACT } from "./model/contract.js";
export type { RevitifyGraph, RevitifyLink, RevitifyNode } from "./model/graph.js";
export type { BuildOptions } from "./passes/pipeline-async.js";

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

/**
 * Sync build — frozen signature, forever. Zero heavy deps: TS/JS get full compiler-API depth, but
 * every OTHER language gets only the shallow regex fallback (top-level symbols) or a bare file node
 * — NOT tree-sitter. For all-language depth, use buildGraphAsync (the CLI always does). Both are
 * public API and both return the same contract shape, but for a non-TS/JS repo they can legitimately
 * differ in DETAIL — that is the deliberate sync/async contract, not a bug. The whole graph is held
 * in memory: the deliberate scale ceiling (see docs/guide/architecture.md → Scale ceiling).
 */
export function buildGraph(rootDir: string): RevitifyGraph {
  return buildGraphFromRoot(rootDir);
}

/**
 * The full-power additive API (Phase 2): lazy tree-sitter multi-language extraction
 * (TS/JS + Python/Java/Go/Rust), per-file cache with stat fastpath, worker-pool parallelism.
 * The sync buildGraph/revitify stay frozen on the zero-heavy-dep path.
 */
export function buildGraphAsync(rootDir: string, options?: BuildOptions): Promise<RevitifyGraph> {
  return buildGraphFromRootAsync(rootDir, options);
}

export async function revitifyAsync(
  rootDir: string,
  outDir = "revitify-out",
  options?: BuildOptions,
): Promise<RevitifyResult> {
  const graph = await buildGraphAsync(rootDir, options);
  return writeArtifacts(rootDir, outDir, graph);
}

export interface RevitifyResult {
  graphJsonPath: string;
  counts: { nodes: number; links: number };
}

/** The one-call entrypoint: ingest → emit the full output contract into outDir. */
export function revitify(rootDir: string, outDir = "revitify-out"): RevitifyResult {
  return writeArtifacts(rootDir, outDir, buildGraph(rootDir));
}

function writeArtifacts(rootDir: string, outDir: string, graph: RevitifyGraph): RevitifyResult {
  const out = join(rootDir, outDir);
  mkdirSync(out, { recursive: true });
  let graphJsonPath = join(out, "graph.json");
  for (const exporter of defaultExporters) {
    const path = join(out, exporter.filename);
    if (exporter.id === "json") graphJsonPath = path;
    writeFileSync(path, exporter.render(graph));
  }
  return { graphJsonPath, counts: { nodes: graph.nodes.length, links: graph.links.length } };
}
