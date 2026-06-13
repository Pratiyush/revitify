import { describe, expect, it } from "vitest";
import type { RevitifyLink, RevitifyNode } from "../src/index.js";
import {
  assignCommunities,
  cohesion,
  resplitOversizedAndIncohesive,
} from "../src/passes/cluster.js";
import { dedupNodes } from "../src/passes/dedup/index.js";
import { jaroWinkler } from "../src/passes/dedup/jaro-winkler.js";
import {
  candidatePairs,
  estimatedJaccard,
  normalizeLabel,
  signature,
} from "../src/passes/dedup/minhash.js";

/** Direct unit coverage for the Phase 3 algorithm ports (cluster.py, _minhash.py, dedup.py). */

const node = (id: string): RevitifyNode => ({ id, label: id, source_file: "f.ts" });
const link = (source: string, target: string): RevitifyLink => ({
  source,
  target,
  relation: "references",
});

describe("jaro-winkler", () => {
  it("matches its reference values", () => {
    expect(jaroWinkler("abc", "abc")).toBe(1);
    expect(jaroWinkler("", "abc")).toBe(0);
    expect(jaroWinkler("abc", "xyz")).toBe(0);
    expect(jaroWinkler("martha", "marhta")).toBeCloseTo(0.9611, 3);
    expect(jaroWinkler("dwayne", "duane")).toBeCloseTo(0.84, 2);
    // Prefix boost: common prefixes push similar strings over the 0.92 merge bar.
    expect(jaroWinkler("getting started", "getting startad")).toBeGreaterThan(0.92);
  });
});

describe("minhash", () => {
  it("identical text → jaccard 1, disjoint text → ~0; banding finds the near-dup pair", () => {
    const a = signature(normalizeLabel("Getting Started"));
    const b = signature(normalizeLabel("getting--Started"));
    const c = signature(normalizeLabel("completely different topic entirely"));
    expect(estimatedJaccard(a, b)).toBe(1); // normalization collapses punctuation
    expect(estimatedJaccard(a, c)).toBeLessThan(0.3);
    const pairs = candidatePairs([a, b, c]);
    expect(pairs).toContainEqual([0, 1]);
    expect(pairs).not.toContainEqual([0, 2]);
  });

  it("short labels pad to shingle width instead of vanishing", () => {
    expect(estimatedJaccard(signature("ab"), signature("ab"))).toBe(1);
  });
});

describe("dedupNodes edges", () => {
  it("no docs / single doc: nothing merges, exact duplicate links still drop", () => {
    const nodes = [node("a"), node("b")];
    const links = [link("a", "b"), link("a", "b")];
    const out = dedupNodes(nodes, links);
    expect(out.merged).toBe(0);
    expect(out.nodes).toHaveLength(2);
    expect(out.links).toHaveLength(1); // (source, target, relation) triple dedup
  });

  it("distinct doc labels stay separate", () => {
    const docs: RevitifyNode[] = [
      { id: "doc:a#Setup", label: "Setup", kind: "doc", source_file: "a.md" },
      { id: "doc:b#Architecture", label: "Architecture", kind: "doc", source_file: "b.md" },
    ];
    expect(dedupNodes(docs, []).merged).toBe(0);
  });
});

describe("assignCommunities edges", () => {
  it("an oversized clique triggers the re-split pass and survives unsplit (no substructure)", () => {
    // 12-node clique + 2 outliers: the clique holds >25% of the graph and ≥10 nodes, so the
    // oversized re-split runs — and correctly refuses to split a structureless clique.
    const ids = Array.from({ length: 12 }, (_, i) => `n${i}`);
    const nodes = [...ids, "lone1", "lone2"].map(node);
    const links: RevitifyLink[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) links.push(link(`n${i}`, `n${j}`));
    }
    assignCommunities(nodes, links);
    const cliqueCommunities = new Set(nodes.slice(0, 12).map((n) => n.community));
    expect(cliqueCommunities.size).toBe(1);
    const [lone1, lone2] = nodes.slice(12);
    expect(lone1?.community).not.toBe([...cliqueCommunities][0]);
    expect(lone1?.community).not.toBe(lone2?.community); // isolated nodes stay singletons
  });

  it("self-links and links to unknown endpoints are ignored", () => {
    const nodes = [node("a"), node("b")];
    assignCommunities(nodes, [link("a", "a"), link("a", "ghost"), link("a", "b")]);
    expect(nodes[0]?.community).toBe(nodes[1]?.community);
  });
});

describe("incohesive re-split (the COHESION_MIN path)", () => {
  // Symmetric weighted adjacency from [a, b, weight] triples — the shape cluster.ts works on.
  const adjacencyOf = (
    edges: Array<[string, string, number]>,
  ): Map<string, Map<string, number>> => {
    const adj = new Map<string, Map<string, number>>();
    const touch = (id: string): Map<string, number> => {
      let m = adj.get(id);
      if (!m) {
        m = new Map();
        adj.set(id, m);
      }
      return m;
    };
    for (const [a, b, w] of edges) {
      touch(a).set(b, w);
      touch(b).set(a, w);
    }
    return adj;
  };

  it("cohesion is internal / (internal + boundary) edge weight", () => {
    // Triangle a-b-c (community 0); c is also bonded (weight 9) to outsider d (community 1).
    const adj = adjacencyOf([
      ["a", "b", 1],
      ["b", "c", 1],
      ["a", "c", 1],
      ["c", "d", 9],
    ]);
    const community = new Map([
      ["a", 0],
      ["b", 0],
      ["c", 0],
      ["d", 1],
    ]);
    expect(cohesion(["a", "b", "c"], adj, community)).toBeCloseTo(3 / 12, 6); // 3 internal, 9 external
    // No boundary edges → fully cohesive (the empty-boundary guard returns 1).
    const closed = adjacencyOf([
      ["a", "b", 1],
      ["b", "c", 1],
      ["a", "c", 1],
    ]);
    const triComm = new Map([
      ["a", 0],
      ["b", 0],
      ["c", 0],
    ]);
    expect(cohesion(["a", "b", "c"], closed, triComm)).toBe(1);
  });

  it("breaks up a ≥50-node community whose edges are mostly external (cohesion < 0.05)", () => {
    // This branch is unreachable through assignCommunities' own Louvain (it would never hold such a
    // community together — see cluster.ts), so drive the re-split directly with a crafted assignment.
    const A = Array.from({ length: 50 }, (_, i) => `A${i}`);
    const edges: Array<[string, string, number]> = [];
    for (let i = 0; i < 49; i++) edges.push([`A${i}`, `A${i + 1}`, 1]); // 49 weak internal edges (a chain)
    for (let i = 0; i < 50; i++) edges.push([`A${i}`, `B${i}`, 20]); // 50 strong external bonds (1000)
    const adj = adjacencyOf(edges);

    const community = new Map<string, number>();
    for (const id of A) community.set(id, 0); // all 50 A-nodes seeded into one community
    for (let i = 0; i < 50; i++) community.set(`B${i}`, 1 + i); // each outsider its own community
    // 100 isolated filler nodes hold A at exactly 25% of the graph, so the OVERSIZED branch (>25%)
    // cannot fire — this isolates the incohesive path.
    const filler = Array.from({ length: 100 }, (_, i) => `G${i}`);
    filler.forEach((id, i) => {
      community.set(id, 200 + i);
    });
    const ids = [...A, ...Array.from({ length: 50 }, (_, i) => `B${i}`), ...filler];

    expect(ids.length).toBe(200);
    expect(A.length / ids.length).toBe(0.25); // not > 0.25 → oversized branch stays off
    expect(cohesion(A, adj, community)).toBeLessThan(0.05); // 49 / (49 + 1000) ≈ 0.047

    const out = resplitOversizedAndIncohesive(ids, adj, community);
    expect(new Set(A.map((id) => out.get(id))).size).toBeGreaterThan(1); // the community is split
    expect(out.get("B0")).toBe(1); // outsider singletons are left untouched
  });
});
