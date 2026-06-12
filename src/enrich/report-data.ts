import type { RevitifyGraph, RevitifyNode } from "../model/graph.js";

/**
 * Report intelligence — the numbers behind GRAPH_REPORT.md. Degree-based hubs today; god-nodes
 * with graphify's exclusions, surprise scoring, and betweenness arrive in Phase 4 on top of
 * these primitives.
 */

export interface Hub {
  node: RevitifyNode;
  degree: number;
}

export function topHubs(graph: RevitifyGraph, limit = 10): Hub[] {
  const degree = new Map<string, number>();
  for (const l of graph.links) {
    degree.set(String(l.source), (degree.get(String(l.source)) ?? 0) + 1);
    degree.set(String(l.target), (degree.get(String(l.target)) ?? 0) + 1);
  }
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return [...degree.entries()]
    .map(([id, d]) => ({ node: byId.get(id), degree: d }))
    .filter((h): h is Hub => h.node !== undefined)
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit);
}

/** Node-kind histogram in first-seen order (stable input order keeps the report byte-stable). */
export function kindCounts(graph: RevitifyGraph): Map<string, number> {
  const kinds = new Map<string, number>();
  for (const n of graph.nodes) kinds.set(n.kind ?? "node", (kinds.get(n.kind ?? "node") ?? 0) + 1);
  return kinds;
}
