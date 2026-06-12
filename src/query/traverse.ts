import type { GraphIndex } from "./graph.js";

/** BFS shortest path (undirected), ids inclusive; undefined when disconnected. */
export function shortestPath(index: GraphIndex, from: string, to: string): string[] | undefined {
  if (!index.byId.has(from) || !index.byId.has(to)) return undefined;
  if (from === to) return [from];
  const previous = new Map<string, string>([[from, from]]);
  const queue = [from];
  while (queue.length) {
    const current = queue.shift() as string;
    for (const next of index.neighbors(current)) {
      if (previous.has(next)) continue;
      previous.set(next, current);
      if (next === to) {
        const path = [to];
        let step = to;
        while (step !== from) {
          step = previous.get(step) as string;
          path.unshift(step);
        }
        return path;
      }
      queue.push(next);
    }
  }
  return undefined;
}

/** Depth-limited neighborhood (BFS order), excluding the start node. */
export function neighborhood(index: GraphIndex, start: string, depth = 1): string[] {
  const seen = new Set<string>([start]);
  const out: string[] = [];
  let frontier = [start];
  for (let d = 0; d < depth && frontier.length; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const nb of index.neighbors(id)) {
        if (seen.has(nb)) continue;
        seen.add(nb);
        out.push(nb);
        next.push(nb);
      }
    }
    frontier = next;
  }
  return out;
}
