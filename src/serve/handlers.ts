import { godNodes } from "../enrich/god-nodes.js";
import { communities } from "../query/communities.js";
import { explain, searchNodes } from "../query/explain.js";
import { shortestPath } from "../query/traverse.js";
import type { GraphState } from "./state.js";

/**
 * The protocol-agnostic query surface, shared by the HTTP server (JSON) and the MCP server (tool
 * text). Each protocol is a thin adapter that adds transport, query-logging, and result shaping;
 * the LIMITS live here so the two can never drift again.
 *
 * (Was: two hand-maintained copies that had silently drifted — god_nodes 5↔10, search 8↔10, and two
 * different community-count methods. Centralizing the limits is the fix by construction.)
 */
export const QUERY_LIMITS = { search: 10, godNodes: 10 } as const;

export function queryHandlers(state: GraphState) {
  return {
    /** idf-ranked search hits, score-annotated. `undefined` id → caller's 404/empty choice. */
    search: (q: string) =>
      searchNodes(state.get(), q, QUERY_LIMITS.search).map((h) => ({ score: h.score, ...h.node })),
    explain: (q: string) => explain(state.get(), q),
    node: (id: string) => state.get().byId.get(id),
    /** Neighbor nodes, or `undefined` when the id is unknown (lets HTTP 404 and MCP return []). */
    neighbors: (id: string) => {
      const index = state.get();
      return index.byId.has(id) ? index.neighbors(id).map((n) => index.byId.get(n)) : undefined;
    },
    community: (c: number) => state.get().graph.nodes.filter((n) => n.community === c),
    path: (from: string, to: string) => shortestPath(state.get(), from, to) ?? null,
    communities: () =>
      communities(state.get()).map((c) => ({ id: c.id, size: c.size, cohesion: c.cohesion })),
    /** Raw most-connected symbols (`{node, degree}`) — adapters shape to their own response. */
    godNodes: () => godNodes(state.get().graph, QUERY_LIMITS.godNodes),
    /** Counts + freshness. One community-count method (was a per-server divergence). */
    stats: () => {
      const g = state.get().graph;
      return {
        nodes: g.nodes.length,
        links: g.links.length,
        communities: communities(state.get()).length,
        built_at_commit: g.built_at_commit ?? null,
      };
    },
  };
}
