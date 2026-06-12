import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * In-memory adjacency index over a RevitifyGraph — the substrate for every query verb
 * (path/affected/communities in Phase 5) and for centrality (Phase 4 questions).
 */
export class GraphIndex {
  readonly byId = new Map<string, RevitifyNode>();
  readonly out = new Map<string, RevitifyLink[]>();
  readonly in = new Map<string, RevitifyLink[]>();

  constructor(readonly graph: RevitifyGraph) {
    for (const n of graph.nodes) this.byId.set(n.id, n);
    for (const l of graph.links) {
      const s = String(l.source);
      const t = String(l.target);
      push(this.out, s, l);
      push(this.in, t, l);
    }
  }

  /** Undirected neighbor ids (graph-distance semantics; relation-agnostic). */
  neighbors(id: string): string[] {
    const seen = new Set<string>();
    for (const l of this.out.get(id) ?? []) seen.add(String(l.target));
    for (const l of this.in.get(id) ?? []) seen.add(String(l.source));
    seen.delete(id);
    return [...seen];
  }

  degree(id: string): number {
    return (this.out.get(id)?.length ?? 0) + (this.in.get(id)?.length ?? 0);
  }
}

function push(map: Map<string, RevitifyLink[]>, key: string, link: RevitifyLink): void {
  const arr = map.get(key);
  if (arr) arr.push(link);
  else map.set(key, [link]);
}
