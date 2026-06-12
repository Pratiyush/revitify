import type { RevitifyNode } from "../model/graph.js";
import type { GraphIndex } from "./graph.js";

export interface CommunityInfo {
  id: number;
  size: number;
  cohesion: number;
  members: RevitifyNode[];
}

/** Community roster with cohesion = internal / (internal + boundary) edge weight. */
export function communities(index: GraphIndex): CommunityInfo[] {
  const byCommunity = new Map<number, RevitifyNode[]>();
  for (const n of index.graph.nodes) {
    if (n.community === undefined) continue;
    const arr = byCommunity.get(n.community);
    if (arr) arr.push(n);
    else byCommunity.set(n.community, [n]);
  }
  const communityOf = new Map(index.graph.nodes.map((n) => [n.id, n.community]));
  const internal = new Map<number, number>();
  const external = new Map<number, number>();
  for (const l of index.graph.links) {
    const cs = communityOf.get(String(l.source));
    const ct = communityOf.get(String(l.target));
    if (cs === undefined || ct === undefined) continue;
    if (cs === ct) internal.set(cs, (internal.get(cs) ?? 0) + 1);
    else {
      external.set(cs, (external.get(cs) ?? 0) + 1);
      external.set(ct, (external.get(ct) ?? 0) + 1);
    }
  }
  return [...byCommunity.entries()]
    .map(([id, members]) => {
      const inW = internal.get(id) ?? 0;
      const exW = external.get(id) ?? 0;
      return {
        id,
        size: members.length,
        cohesion: inW + exW === 0 ? 1 : inW / (inW + exW),
        members,
      };
    })
    .sort((a, b) => b.size - a.size);
}
