import { describe, expect, it } from "vitest";
import type { RevitifyLink, RevitifyNode } from "../src/index.js";
import { assignCommunities } from "../src/passes/cluster.js";
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
