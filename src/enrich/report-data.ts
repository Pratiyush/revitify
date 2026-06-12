import type { RevitifyGraph } from "../model/graph.js";

/** Node-kind histogram in first-seen order (stable input order keeps the report byte-stable). */
export function kindCounts(graph: RevitifyGraph): Map<string, number> {
  const kinds = new Map<string, number>();
  for (const n of graph.nodes) kinds.set(n.kind ?? "node", (kinds.get(n.kind ?? "node") ?? 0) + 1);
  return kinds;
}
