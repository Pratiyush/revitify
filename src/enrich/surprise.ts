import { Confidence } from "../model/confidence.js";
import type { RevitifyGraph, RevitifyLink } from "../model/graph.js";
import { detectLanguage } from "../model/languages.js";
import { GraphIndex } from "../query/graph.js";

/**
 * Surprising connections (port of graphify analyze._surprise_score): rank cross-cutting edges
 * by how unexpected they are. Scoring mirrors upstream's additive bonuses — +2 cross-file,
 * +2 cross-community, +1 peripheral→hub, +1 cross-language, +1 inferred (a non-obvious link
 * the AST didn't hand us) — structural edges (contains/explains/documents) never surprise.
 */

const STRUCTURAL = new Set(["contains", "method", "rationale_for", "documents"]);

export interface SurprisingConnection {
  link: RevitifyLink;
  score: number;
  reasons: string[];
}

export function surprisingConnections(graph: RevitifyGraph, limit = 5): SurprisingConnection[] {
  const index = new GraphIndex(graph);
  const degrees = graph.nodes.map((n) => index.degree(n.id)).sort((a, b) => a - b);
  const hubThreshold = degrees[Math.floor(degrees.length * 0.9)] ?? 0;

  const scored: SurprisingConnection[] = [];
  for (const link of graph.links) {
    if (STRUCTURAL.has(link.relation ?? "")) continue;
    const source = index.byId.get(String(link.source));
    const target = index.byId.get(String(link.target));
    if (!source || !target) continue;
    let score = 0;
    const reasons: string[] = [];
    if (source.source_file !== target.source_file) {
      score += 2;
      reasons.push("cross-file");
    }
    if (source.community !== target.community) {
      score += 2;
      reasons.push("cross-community");
    }
    const sourceDegree = index.degree(source.id);
    const targetDegree = index.degree(target.id);
    if (sourceDegree <= 2 && targetDegree >= hubThreshold && hubThreshold > 2) {
      score += 1;
      reasons.push("peripheral→hub");
    }
    if (detectLanguage(source.source_file) !== detectLanguage(target.source_file)) {
      score += 1;
      reasons.push("cross-language");
    }
    if (link.confidence === Confidence.INFERRED) {
      score += 1;
      reasons.push("inferred");
    }
    if (score >= 3) scored.push({ link, score, reasons });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
