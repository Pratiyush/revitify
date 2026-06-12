import type { RevitifyGraph, RevitifyNode } from "../model/graph.js";
import { GraphIndex } from "../query/graph.js";

/**
 * God nodes (port of graphify analyze.god_nodes): the most-connected SYMBOLS — file, doc, and
 * annotation-ish nodes are excluded (upstream excludes file nodes and json-key nodes for the
 * same reason: they are containers, not actors).
 */
const EXCLUDED_KINDS = new Set(["file", "doc", "why", "docstring"]);

export interface GodNode {
  node: RevitifyNode;
  degree: number;
}

export function godNodes(graph: RevitifyGraph, limit = 10): GodNode[] {
  const index = new GraphIndex(graph);
  return graph.nodes
    .filter((n) => !EXCLUDED_KINDS.has(n.kind ?? ""))
    .map((node) => ({ node, degree: index.degree(node.id) }))
    .filter((g) => g.degree > 0)
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit);
}
