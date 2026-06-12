import { Confidence } from "../model/confidence.js";
import type { RevitifyGraph } from "../model/graph.js";
import { betweenness } from "../query/centrality.js";
import { GraphIndex } from "../query/graph.js";
import { godNodes } from "./god-nodes.js";
import { surprisingConnections } from "./surprise.js";

/**
 * Suggested questions (port of graphify analyze.py's question generation): 4–5 prompts seeded
 * from betweenness brokers, god nodes, the top surprising connection, ambiguity hotspots, and
 * the largest community — the places a reader should interrogate first.
 */
export function suggestedQuestions(graph: RevitifyGraph, limit = 5): string[] {
  const index = new GraphIndex(graph);
  const questions: string[] = [];

  const central = [...betweenness(index).entries()]
    .filter(([id]) => index.byId.get(id)?.kind !== "file")
    .sort((a, b) => b[1] - a[1])[0];
  if (central && central[1] > 0) {
    const node = index.byId.get(central[0]);
    questions.push(
      `What breaks if \`${node?.label}\` changes? It brokers the most shortest paths (revitify affected ${node?.label}).`,
    );
  }

  const god = godNodes(graph, 1)[0];
  if (god && god.node.id !== central?.[0]) {
    questions.push(
      `Why does \`${god.node.label}\` touch ${god.degree} edges — load-bearing wall or god object?`,
    );
  }

  const surprise = surprisingConnections(graph, 1)[0];
  if (surprise) {
    const s = index.byId.get(String(surprise.link.source));
    const t = index.byId.get(String(surprise.link.target));
    questions.push(
      `Why does \`${s?.label}\` depend on \`${t?.label}\` (${surprise.reasons.join(", ")})?`,
    );
  }

  const ambiguous = graph.links.filter((l) => l.confidence === Confidence.AMBIGUOUS);
  if (ambiguous.length > 0) {
    const t = index.byId.get(String(ambiguous[0]?.target));
    questions.push(
      `${ambiguous.length} reference(s) are AMBIGUOUS — e.g. which \`${t?.label}\` is really meant?`,
    );
  }

  const bySize = new Map<number, number>();
  for (const n of graph.nodes) {
    if (n.community !== undefined) bySize.set(n.community, (bySize.get(n.community) ?? 0) + 1);
  }
  const biggest = [...bySize.entries()].sort((a, b) => b[1] - a[1])[0];
  if (biggest) {
    questions.push(
      `Community ${biggest[0]} holds ${biggest[1]} nodes — does it map to one concept, or is it hiding several?`,
    );
  }

  questions.push("Which files have symbols nothing references (dead weight)?");
  return questions.slice(0, limit);
}

/** EXTRACTED/INFERRED/AMBIGUOUS counts + share — the report's trust ledger. */
export function confidenceSummary(graph: RevitifyGraph): Array<[Confidence, number, number]> {
  const counts = new Map<Confidence, number>();
  let tagged = 0;
  for (const l of graph.links) {
    if (!l.confidence) continue;
    counts.set(l.confidence, (counts.get(l.confidence) ?? 0) + 1);
    tagged++;
  }
  return Object.values(Confidence).map((c) => {
    const n = counts.get(c) ?? 0;
    return [c, n, tagged ? Math.round((n / tagged) * 100) : 0];
  });
}
