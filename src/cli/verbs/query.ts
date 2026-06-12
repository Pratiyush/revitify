import { affected } from "../../query/affected.js";
import { communities } from "../../query/communities.js";
import { explain, searchNodes } from "../../query/explain.js";
import type { GraphIndex } from "../../query/graph.js";
import { appendQueryLog } from "../../query/querylog.js";
import { shortestPath } from "../../query/traverse.js";
import { loadOrBuild } from "../load.js";

/** query / explain / path / affected / communities — one module, dispatched on argv[0]. */
export async function run(args: string[]): Promise<number> {
  const [verb, ...rest] = args;
  const { root, index } = await loadOrBuild(undefined);

  if (verb === "query") {
    const q = rest.join(" ");
    const hits = searchNodes(index, q);
    appendQueryLog(root, "query", q, hits.length);
    for (const h of hits) {
      console.log(
        `${h.score.toFixed(2)}  ${h.node.label} (${h.node.kind}) — ${h.node.source_location ?? h.node.source_file}`,
      );
    }
    return hits.length ? 0 : 1;
  }
  if (verb === "explain") {
    const q = rest.join(" ");
    const text = explain(index, q);
    appendQueryLog(root, "explain", q, text.startsWith("No nodes") ? 0 : 1);
    console.log(text);
    return 0;
  }
  if (verb === "path") {
    const [from, to] = rest;
    const path = shortestPath(index, resolveId(index, from), resolveId(index, to));
    appendQueryLog(root, "path", `${from} → ${to}`, path?.length ?? 0);
    if (!path) {
      console.error("no path");
      return 1;
    }
    console.log(path.join("\n  → "));
    return 0;
  }
  if (verb === "affected") {
    const target = resolveId(index, rest[0]);
    const blast = affected(index, target);
    appendQueryLog(root, "affected", rest[0] ?? "", blast.length);
    console.log(`${blast.length} affected by ${target}:`);
    for (const id of blast) console.log(`  ${id}`);
    return 0;
  }
  // communities
  const info = communities(index);
  appendQueryLog(root, "communities", "", info.length);
  for (const c of info) {
    console.log(`community ${c.id}: ${c.size} nodes, cohesion ${c.cohesion.toFixed(2)}`);
  }
  return 0;
}

/** Accept a node id or a bare label (first match by label, deterministic). */
function resolveId(index: GraphIndex, raw?: string): string {
  const value = raw ?? "";
  if (index.byId.has(value)) return value;
  const byLabel = [...index.byId.values()]
    .filter((n) => n.label === value)
    .map((n) => n.id)
    .sort();
  return byLabel[0] ?? value;
}
