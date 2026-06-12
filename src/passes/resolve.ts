import { Confidence } from "../model/confidence.js";
import type { RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * Pass 2 — reference & call resolution (port of graphify symbol_resolution.py).
 * `name:X` targets resolve through precedence tiers: same FILE as the referencing symbol,
 * then same DIRECTORY, then global. One candidate in the winning tier ⇒ INFERRED; several ⇒
 * deterministic lexicographic pick tagged AMBIGUOUS; none anywhere ⇒ the link is dropped.
 * A symbol never resolves to itself (self-reference loops are noise, not calls).
 * Dangling endpoints are filtered; `file:` ids pass because extractors verified them against
 * the walked set.
 */
export function resolveReferences(
  nodes: ReadonlyMap<string, RevitifyNode>,
  links: readonly RevitifyLink[],
): RevitifyLink[] {
  const byName = new Map<string, string[]>();
  for (const n of nodes.values()) {
    if (!n.id.startsWith("sym:")) continue;
    (byName.get(n.label) ?? byName.set(n.label, []).get(n.label)!).push(n.id);
  }
  return links
    .map((l) => {
      if (!String(l.target).startsWith("name:")) return l;
      const source = String(l.source);
      const candidates = (byName.get(String(l.target).slice(5)) ?? []).filter(
        (id) => id !== source,
      );
      if (!candidates.length) return null;
      const picked = pick(candidates, source);
      return { ...l, target: picked.target, confidence: picked.confidence };
    })
    .filter((l): l is RevitifyLink => l !== null)
    .filter((l) => nodes.has(String(l.source)) || String(l.source).startsWith("file:"))
    .filter((l) => nodes.has(String(l.target)) || String(l.target).startsWith("file:"));
}

function pick(
  candidates: readonly string[],
  sourceId: string,
): { target: string; confidence: Confidence } {
  const fromRel = relOf(sourceId);
  const fromDir = dirOf(fromRel);
  const tiers: Array<(id: string) => boolean> = [
    (id) => relOf(id) === fromRel, // same file
    (id) => dirOf(relOf(id)) === fromDir, // same directory
    () => true, // global
  ];
  for (const inTier of tiers) {
    const tier = candidates.filter(inTier);
    if (tier.length === 1) return { target: tier[0] as string, confidence: Confidence.INFERRED };
    if (tier.length > 1) {
      const sorted = [...tier].sort();
      return { target: sorted[0] as string, confidence: Confidence.AMBIGUOUS };
    }
  }
  // Unreachable (global tier matches everything), kept for type narrowing.
  return { target: candidates[0] as string, confidence: Confidence.AMBIGUOUS };
}

/** "sym:a/b.ts#X" → "a/b.ts" · "file:a/b.ts" → "a/b.ts". */
const relOf = (id: string): string => {
  if (id.startsWith("sym:")) return id.slice(4, id.indexOf("#"));
  if (id.startsWith("file:")) return id.slice(5);
  return id;
};
const dirOf = (rel: string): string =>
  rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
