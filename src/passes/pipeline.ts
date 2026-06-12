import { readFileSync } from "node:fs";
import { defaultIngestors } from "../ingest/index.js";
import { walkFileRefs } from "../ingest/walk.js";
import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../model/graph.js";
import { assignCommunities } from "./cluster.js";
import { gitHead } from "./git.js";
import { resolveReferences } from "./resolve.js";

/**
 * The three-pass pipeline (synchronous facade path):
 *   1. extract — walk files, first matching offline ingestor contributes a fragment
 *   2. infer   — resolve name: references, drop dangling links
 *   3. cluster — assign communities
 * Fragment merge keeps first-seen nodes and per-file link order — the byte-stable ordering the
 * contract test pins. buildGraphAsync (Phase 2) adds lazy/parallel extraction on the same shape.
 */
export function buildGraphFromRoot(rootDir: string): RevitifyGraph {
  const refs = walkFileRefs(rootDir);
  const knownFiles: ReadonlySet<string> = new Set(refs.map((r) => r.relPath));
  const nodes = new Map<string, RevitifyNode>();
  const links: RevitifyLink[] = [];
  for (const ref of refs) {
    const ingestor = defaultIngestors.find((i) => i.ingestSync && i.detect(ref));
    if (!ingestor?.available(process.env)) continue;
    let content: string;
    try {
      content = readFileSync(ref.path, "utf8");
    } catch {
      continue; // unreadable/binary — never fatal
    }
    const fragment = ingestor.ingestSync!({ ...ref, content }, { rootDir, knownFiles });
    for (const node of fragment.nodes) {
      if (!nodes.has(node.id)) nodes.set(node.id, node);
    }
    links.push(...fragment.links);
  }
  assignCommunities(nodes.values());
  const resolved = resolveReferences(nodes, links);
  const head = gitHead(rootDir);
  return {
    nodes: [...nodes.values()],
    links: resolved,
    ...(head ? { built_at_commit: head } : {}),
  };
}
