import type { RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * Copy each docstring's first line onto its symbol as `summary` (additive contract field) —
 * the viewer's detail panel renders it inline; the docstring NODES stay in the graph too.
 */
export function attachSummaries(
  nodes: readonly RevitifyNode[],
  links: readonly RevitifyLink[],
): void {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const l of links) {
    if (l.relation !== "documents") continue;
    const symbol = byId.get(String(l.source));
    const doc = byId.get(String(l.target));
    if (symbol && doc && symbol.summary === undefined) symbol.summary = doc.label;
  }
}
