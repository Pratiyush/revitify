import type { GraphIndex } from "./graph.js";

/**
 * Brandes betweenness centrality (unweighted, undirected) — powers suggested questions
 * (graphify analyze.py uses betweenness seeds). Sampled above SAMPLE_LIMIT sources, and skipped
 * entirely above SKIP_LIMIT nodes, to stay inside the report's time budget on large graphs — the
 * same capping spirit as upstream. Reuses GraphIndex.adj (built once) and a head-cursor queue, so
 * the per-visit cost is a Map.get rather than a fresh Set plus an O(n) shift.
 */
const SAMPLE_LIMIT = 500;
/** Above this node count, skip betweenness: questions fall back to degree/community signals. */
const SKIP_LIMIT = 20_000;

export function betweenness(index: GraphIndex): Map<string, number> {
  const ids = [...index.byId.keys()];
  const score = new Map<string, number>(ids.map((id) => [id, 0]));
  if (ids.length > SKIP_LIMIT) return score; // all-zero — the broker question is omitted, nothing breaks
  const adj = index.adj; // built once here, then reused across every BFS source
  // Deterministic sampling: every k-th node in insertion order.
  const stride = ids.length > SAMPLE_LIMIT ? Math.ceil(ids.length / SAMPLE_LIMIT) : 1;

  for (let s = 0; s < ids.length; s += stride) {
    const source = ids[s] as string;
    const stack: string[] = [];
    const predecessors = new Map<string, string[]>();
    const sigma = new Map<string, number>([[source, 1]]);
    const dist = new Map<string, number>([[source, 0]]);
    const queue: string[] = [source];
    let head = 0; // head-cursor dequeue — O(1), vs queue.shift()'s O(n)
    while (head < queue.length) {
      const v = queue[head++] as string;
      stack.push(v);
      for (const w of adj.get(v) ?? []) {
        if (!dist.has(w)) {
          dist.set(w, (dist.get(v) as number) + 1);
          queue.push(w);
        }
        if (dist.get(w) === (dist.get(v) as number) + 1) {
          sigma.set(w, (sigma.get(w) ?? 0) + (sigma.get(v) as number));
          const preds = predecessors.get(w);
          if (preds) preds.push(v);
          else predecessors.set(w, [v]);
        }
      }
    }
    const delta = new Map<string, number>();
    while (stack.length) {
      const w = stack.pop() as string;
      for (const v of predecessors.get(w) ?? []) {
        const share =
          ((sigma.get(v) as number) / (sigma.get(w) as number)) * (1 + (delta.get(w) ?? 0));
        delta.set(v, (delta.get(v) ?? 0) + share);
      }
      if (w !== source) score.set(w, (score.get(w) ?? 0) + (delta.get(w) ?? 0));
    }
  }
  return score;
}
