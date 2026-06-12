import type { GraphIndex } from "./graph.js";

/**
 * Blast radius (port of graphify affected.py): everything that transitively depends on the
 * target — followers of incoming `imports`/`calls`/`references` edges, walked in reverse.
 * Structural `contains` edges hop from a symbol to its file/container so file-level dependents
 * surface too.
 */
const DEPENDENCY_RELATIONS = new Set([
  "imports",
  "imports_from",
  "re_exports",
  "calls",
  "references",
]);

export function affected(index: GraphIndex, id: string, maxDepth = 10): string[] {
  const seen = new Set<string>([id]);
  const out: string[] = [];
  let frontier = [id];
  for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
    const next: string[] = [];
    for (const current of frontier) {
      const dependents = new Set<string>();
      for (const l of index.in.get(current) ?? []) {
        if (DEPENDENCY_RELATIONS.has(l.relation ?? "")) dependents.add(String(l.source));
      }
      // A change to a symbol is a change to its container (file/class) for dependents' purposes.
      for (const l of index.in.get(current) ?? []) {
        if (l.relation === "contains" || l.relation === "method") dependents.add(String(l.source));
      }
      for (const dep of dependents) {
        if (seen.has(dep)) continue;
        seen.add(dep);
        out.push(dep);
        next.push(dep);
      }
    }
    frontier = next;
  }
  return out;
}
