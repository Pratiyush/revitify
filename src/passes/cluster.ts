import type { RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * Pass 3 — community detection (port of graphify cluster.py). Louvain local moving +
 * aggregation with Leiden-style connectivity refinement (disconnected communities split — the
 * Leiden guarantee Louvain lacks), then graphify's post-passes: re-split communities holding
 * >25% of the graph (min 10 nodes) and communities with cohesion <0.05 (min 50 nodes).
 * Deterministic by construction: nodes iterate in insertion order, ties break on smaller
 * community id — no RNG (the reference seeds RandomState(42) for the same goal).
 * Isolated nodes keep their own communities. Ids are densified in first-seen node order and
 * appended as `community` — last key, its contracted serialization slot.
 */

const OVERSIZED_FRACTION = 0.25;
const OVERSIZED_MIN = 10;
const COHESION_THRESHOLD = 0.05;
const COHESION_MIN = 50;

type Adjacency = Map<string, Map<string, number>>;

export function assignCommunities(nodes: RevitifyNode[], links: readonly RevitifyLink[]): void {
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const adj: Adjacency = new Map(ids.map((id) => [id, new Map()]));
  for (const l of links) {
    const s = String(l.source);
    const t = String(l.target);
    if (s === t || !idSet.has(s) || !idSet.has(t)) continue;
    const sm = adj.get(s) as Map<string, number>;
    const tm = adj.get(t) as Map<string, number>;
    sm.set(t, (sm.get(t) ?? 0) + 1);
    tm.set(s, (tm.get(s) ?? 0) + 1);
  }

  let community = louvain(ids, adj);
  community = splitDisconnected(ids, adj, community);
  community = resplitOversizedAndIncohesive(ids, adj, community);

  // Densify in first-seen node order; append community last.
  const dense = new Map<number, number>();
  for (const node of nodes) {
    const raw = community.get(node.id) as number;
    if (!dense.has(raw)) dense.set(raw, dense.size);
    node.community = dense.get(raw) as number;
  }
}

/** Standard Louvain: local moving sweeps + aggregation levels, deterministic order. */
function louvain(ids: readonly string[], adj: Adjacency): Map<string, number> {
  let labels = new Map(ids.map((id, i) => [id, i]));
  let currentIds: string[] = [...ids];
  let currentAdj = adj;
  // Maps each ORIGINAL id to its community at the current aggregation level.
  const assignment = new Map(ids.map((id) => [id, id]));

  for (let level = 0; level < 10; level++) {
    const moved = localMoving(currentIds, currentAdj, labels);
    const distinct = new Set(labels.values());
    if (!moved || distinct.size === currentIds.length) break;

    // Record: original node → community label at this level.
    const byNode = new Map<string, number>();
    for (const [origId, repr] of assignment) byNode.set(origId, labels.get(repr) as number);

    // Aggregate communities into supernodes.
    const superIds = [...new Set(labels.values())].sort((a, b) => a - b).map((c) => `c${c}`);
    const superAdj: Adjacency = new Map(superIds.map((id) => [id, new Map()]));
    for (const [a, neighbors] of currentAdj) {
      const ca = `c${labels.get(a)}`;
      for (const [b, w] of neighbors) {
        const cb = `c${labels.get(b)}`;
        // Self-loops (ca === cb) MUST survive aggregation: they carry the community's internal
        // mass into the supernode's degree — dropping them makes dense clusters look weightless
        // and the next level merges everything across the bridges.
        const m = superAdj.get(ca) as Map<string, number>;
        m.set(cb, (m.get(cb) ?? 0) + w);
      }
    }
    for (const [origId] of assignment) assignment.set(origId, `c${byNode.get(origId)}`);
    currentIds = superIds;
    currentAdj = superAdj;
    labels = new Map(superIds.map((id, i) => [id, i]));
  }

  const out = new Map<string, number>();
  for (const [origId, repr] of assignment) out.set(origId, labels.get(repr) as number);
  return out;
}

function localMoving(ids: readonly string[], adj: Adjacency, labels: Map<string, number>): boolean {
  const degree = new Map<string, number>();
  let m2 = 0; // 2m — twice total edge weight
  for (const id of ids) {
    let k = 0;
    for (const [, w] of adj.get(id) as Map<string, number>) k += w;
    degree.set(id, k);
    m2 += k;
  }
  if (m2 === 0) return false;
  const communityDegree = new Map<number, number>();
  for (const id of ids) {
    const c = labels.get(id) as number;
    communityDegree.set(c, (communityDegree.get(c) ?? 0) + (degree.get(id) as number));
  }

  let movedAny = false;
  for (let sweep = 0; sweep < 20; sweep++) {
    let movedThisSweep = false;
    for (const id of ids) {
      const current = labels.get(id) as number;
      const k = degree.get(id) as number;
      const weightTo = new Map<number, number>();
      for (const [nb, w] of adj.get(id) as Map<string, number>) {
        if (nb === id) continue; // self-loops move with the node — community-invariant
        const c = labels.get(nb) as number;
        weightTo.set(c, (weightTo.get(c) ?? 0) + w);
      }
      communityDegree.set(current, (communityDegree.get(current) ?? 0) - k);
      let best = current;
      let bestGain = (weightTo.get(current) ?? 0) - ((communityDegree.get(current) ?? 0) * k) / m2;
      for (const [c, w] of [...weightTo.entries()].sort((a, b) => a[0] - b[0])) {
        if (c === current) continue;
        const gain = w - ((communityDegree.get(c) ?? 0) * k) / m2;
        if (gain > bestGain + 1e-12) {
          bestGain = gain;
          best = c;
        }
      }
      communityDegree.set(best, (communityDegree.get(best) ?? 0) + k);
      if (best !== current) {
        labels.set(id, best);
        movedThisSweep = true;
        movedAny = true;
      }
    }
    if (!movedThisSweep) break;
  }
  return movedAny;
}

/** Leiden guarantee: a community must be connected — split disconnected parts. */
function splitDisconnected(
  ids: readonly string[],
  adj: Adjacency,
  community: Map<string, number>,
): Map<string, number> {
  const byCommunity = new Map<number, string[]>();
  for (const id of ids) {
    const c = community.get(id) as number;
    const arr = byCommunity.get(c);
    if (arr) arr.push(id);
    else byCommunity.set(c, [id]);
  }
  const out = new Map<string, number>();
  let next = 0;
  for (const members of byCommunity.values()) {
    const memberSet = new Set(members);
    const seen = new Set<string>();
    for (const start of members) {
      if (seen.has(start)) continue;
      const componentId = next++;
      const queue = [start];
      seen.add(start);
      while (queue.length) {
        const id = queue.shift() as string;
        out.set(id, componentId);
        for (const [nb] of adj.get(id) as Map<string, number>) {
          if (memberSet.has(nb) && !seen.has(nb)) {
            seen.add(nb);
            queue.push(nb);
          }
        }
      }
    }
  }
  return out;
}

/** graphify's post-passes: oversized (>25%, ≥10) and incohesive (<0.05, ≥50) re-split. */
function resplitOversizedAndIncohesive(
  ids: readonly string[],
  adj: Adjacency,
  community: Map<string, number>,
): Map<string, number> {
  const total = ids.length;
  for (let round = 0; round < 5; round++) {
    const byCommunity = new Map<number, string[]>();
    for (const id of ids) {
      const c = community.get(id) as number;
      const arr = byCommunity.get(c);
      if (arr) arr.push(id);
      else byCommunity.set(c, [id]);
    }
    let changed = false;
    for (const members of byCommunity.values()) {
      const oversized =
        members.length >= OVERSIZED_MIN && members.length / total > OVERSIZED_FRACTION;
      const incohesive =
        members.length >= COHESION_MIN && cohesion(members, adj, community) < COHESION_THRESHOLD;
      if (!oversized && !incohesive) continue;
      const memberSet = new Set(members);
      const subAdj: Adjacency = new Map(
        members.map((id) => [
          id,
          new Map([...(adj.get(id) as Map<string, number>)].filter(([nb]) => memberSet.has(nb))),
        ]),
      );
      const sub = louvain(members, subAdj);
      if (new Set(sub.values()).size <= 1) continue;
      const base = Math.max(...community.values()) + 1;
      for (const [id, c] of sub) community.set(id, base + c);
      changed = true;
    }
    if (!changed) break;
  }
  return community;
}

function cohesion(
  members: readonly string[],
  adj: Adjacency,
  community: Map<string, number>,
): number {
  const c = community.get(members[0] as string);
  let internal = 0;
  let external = 0;
  for (const id of members) {
    for (const [nb, w] of adj.get(id) as Map<string, number>) {
      if (community.get(nb) === c) internal += w;
      else external += w;
    }
  }
  internal /= 2; // each internal edge counted from both ends
  return internal + external === 0 ? 1 : internal / (internal + external);
}
