import type { FileRef, GraphFragment } from "../model/fragment.js";
import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../model/graph.js";
import { assignCommunities } from "./cluster.js";
import { dedupNodes } from "./dedup/index.js";
import { gitHead } from "./git.js";
import { resolveReferences } from "./resolve.js";
import { attachSummaries } from "./summarize.js";

/**
 * The shared tail of every pipeline. Sync and async differ only in HOW per-file fragments are
 * produced; here they converge:
 *   1. merge fragments in WALK order — first-seen node wins, links appended per file. This is the
 *      byte-stable ordering the contract test pins, so the merge must iterate `refs` (walk order),
 *      not the fragments map's insertion order (which the worker path fills out of order).
 *   2. resolve name: references (drop dangling), 3. dedup, 4. summaries, 5. communities, 6. git head.
 * Lives apart from extract.ts so the worker bundle never pulls in cluster/dedup.
 */
export function finalizeGraph(
  rootDir: string,
  refs: readonly FileRef[],
  fragments: ReadonlyMap<string, GraphFragment>,
): RevitifyGraph {
  const nodes = new Map<string, RevitifyNode>();
  const links: RevitifyLink[] = [];
  for (const ref of refs) {
    const fragment = fragments.get(ref.relPath);
    if (!fragment) continue;
    for (const node of fragment.nodes) {
      if (!nodes.has(node.id)) nodes.set(node.id, node);
    }
    links.push(...fragment.links);
  }
  const resolved = resolveReferences(nodes, links);
  const deduped = dedupNodes([...nodes.values()], resolved);
  attachSummaries(deduped.nodes, deduped.links);
  assignCommunities(deduped.nodes, deduped.links);
  const head = gitHead(rootDir);
  return {
    nodes: deduped.nodes,
    links: deduped.links,
    ...(head ? { built_at_commit: head } : {}),
  };
}
