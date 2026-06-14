import type { RevitifyLink, RevitifyNode } from "../model/graph.js";
import type { GraphIndex } from "./graph.js";
import { neighborhood } from "./traverse.js";

/**
 * Term search + explain (port of serve.py's _query_terms/_compute_idf/_score_nodes/
 * _pick_seeds/_subgraph_to_text): tokenize the question, weight terms by inverse document
 * frequency over node labels+paths, score nodes, then narrate the best seeds with their
 * 1-hop neighborhoods. Shared by the query/explain verbs, the HTTP API, and MCP (Phase 7).
 */

export interface ScoredNode {
  node: RevitifyNode;
  score: number;
}

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);

export function searchNodes(index: GraphIndex, query: string, limit = 10): ScoredNode[] {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  const nodes = index.graph.nodes;
  const docs = nodes.map((n) => new Set(tokenize(`${n.label} ${n.source_file} ${n.kind ?? ""}`)));
  const idf = new Map<string, number>();
  for (const term of terms) {
    const df = docs.reduce((acc, d) => acc + (d.has(term) ? 1 : 0), 0);
    idf.set(term, Math.log((nodes.length + 1) / (df + 1)) + 1);
  }
  const scored: ScoredNode[] = [];
  for (let i = 0; i < nodes.length; i++) {
    let score = 0;
    for (const term of terms) {
      if ((docs[i] as Set<string>).has(term)) score += idf.get(term) as number;
    }
    if (score > 0) scored.push({ node: nodes[i] as RevitifyNode, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id))
    .slice(0, limit);
}

/** Narrated subgraph for a question — seeds, their edges, and where they live. */
export function explain(index: GraphIndex, query: string, seeds = 3): string {
  const top = searchNodes(index, query, seeds);
  if (!top.length) return `No nodes match "${query}".`;
  const lines: string[] = [`Explaining "${query}" via ${top.length} seed(s):`, ""];
  for (const { node } of top) {
    lines.push(
      `## ${node.label} (${node.kind ?? "node"}) — ${node.source_location ?? node.source_file}`,
    );
    const related = neighborhood(index, node.id, 1)
      .map((id) => index.byId.get(id))
      .filter((n): n is RevitifyNode => n !== undefined)
      .slice(0, 8);
    for (const r of related) {
      // O(degree), not O(E): the connecting edge is in this node's own out/in adjacency.
      const edge =
        (index.out.get(node.id) ?? []).find((l) => String(l.target) === r.id) ??
        // reached only when the out-edge missed, so r links IN to node → in.get(node.id) is defined
        (index.in.get(node.id) as RevitifyLink[]).find((l) => String(l.source) === r.id);
      lines.push(`- ${edge?.relation ?? "linked to"} **${r.label}** (\`${r.source_file}\`)`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
