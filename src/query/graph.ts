import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * In-memory adjacency index over a RevitifyGraph — the substrate for every query verb
 * (path/affected/communities) and for centrality (the report's suggested questions).
 */
export class GraphIndex {
  readonly byId = new Map<string, RevitifyNode>();
  readonly out = new Map<string, RevitifyLink[]>();
  readonly in = new Map<string, RevitifyLink[]>();
  private _adj?: Map<string, readonly string[]>;

  constructor(readonly graph: RevitifyGraph) {
    for (const n of graph.nodes) this.byId.set(n.id, n);
    for (const l of graph.links) {
      const s = String(l.source);
      const t = String(l.target);
      push(this.out, s, l);
      push(this.in, t, l);
    }
  }

  /**
   * Undirected adjacency (relation-agnostic, deduped, self excluded), built once and shared by
   * every neighbor/path/centrality caller — Brandes betweenness alone asks for it once per
   * node-visit per source, so recomputing a Set per call was the report's dominant allocation.
   * Order matches the historical neighbors() output (out-targets first, then in-sources) so
   * betweenness accumulation and shortest-path selection stay byte-stable. Lazy: an index that
   * only needs degree() (e.g. god nodes) never pays to build it.
   */
  get adj(): ReadonlyMap<string, readonly string[]> {
    if (!this._adj) {
      const adj = new Map<string, readonly string[]>();
      for (const id of this.byId.keys()) {
        const seen = new Set<string>();
        for (const l of this.out.get(id) ?? []) seen.add(String(l.target));
        for (const l of this.in.get(id) ?? []) seen.add(String(l.source));
        seen.delete(id);
        adj.set(id, [...seen]);
      }
      this._adj = adj;
    }
    return this._adj;
  }

  /** Undirected neighbor ids — an O(1) lookup into the shared adjacency (do not mutate). */
  neighbors(id: string): readonly string[] {
    return this.adj.get(id) ?? [];
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
