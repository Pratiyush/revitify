import type { RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * Pass 2 — reference resolution. `name:X` reference targets resolve to a real symbol node where
 * one exists (first-inserted candidate — Phase 1b makes the pick deterministic-by-proximity and
 * confidence-tagged); unresolvable ones are dropped. Dangling endpoints are filtered, except
 * `file:` ids which pass unchecked (the known Phase 1b fix; preserved verbatim here).
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
      const candidates = byName.get(String(l.target).slice(5));
      return candidates?.length ? { ...l, target: candidates[0]! } : null;
    })
    .filter((l): l is RevitifyLink => l !== null)
    .filter((l) => nodes.has(String(l.source)) || String(l.source).startsWith("file:"))
    .filter((l) => nodes.has(String(l.target)) || String(l.target).startsWith("file:"));
}
