import type { RevitifyNode } from "../model/graph.js";

/**
 * Pass 3 — clustering. Directory-based today: community = index of first-seen top-level dir, in
 * node insertion order (deterministic, byte-stable). Leiden (Phase 3) replaces the internals
 * behind this exact signature. Mutates nodes, appending `community` last — its serialized
 * position in the contract.
 */
export function assignCommunities(nodes: Iterable<RevitifyNode>): void {
  const communities = new Map<string, number>();
  for (const n of nodes) {
    const rel = n.source_file;
    const top = rel.includes("/") ? rel.split("/")[0]! : ".";
    if (!communities.has(top)) communities.set(top, communities.size);
    n.community = communities.get(top)!;
  }
}
