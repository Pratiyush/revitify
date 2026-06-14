import { describe, expect, it } from "vitest";
import { godNodes } from "../src/enrich/god-nodes.js";
import { confidenceSummary, suggestedQuestions } from "../src/enrich/questions.js";
import { kindCounts } from "../src/enrich/report-data.js";
import { surprisingConnections } from "../src/enrich/surprise.js";
import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../src/index.js";
import { affected } from "../src/query/affected.js";
import { betweenness } from "../src/query/centrality.js";
import { communities } from "../src/query/communities.js";
import { explain, searchNodes } from "../src/query/explain.js";
import { GraphIndex } from "../src/query/graph.js";
import { shortestPath } from "../src/query/traverse.js";

/** Edge-case coverage for the query + enrich layers — degenerate graphs (empty, single node,
 *  disconnected, missing community/kind/relation) that the buildGraph fixtures never produce. */

const node = (id: string, extra: Partial<RevitifyNode> = {}): RevitifyNode => ({
  id,
  label: id,
  source_file: "f.ts",
  ...extra,
});
const link = (source: string, target: string, extra: Partial<RevitifyLink> = {}): RevitifyLink => ({
  source,
  target,
  ...extra,
});
const g = (nodes: RevitifyNode[], links: RevitifyLink[] = []): RevitifyGraph => ({ nodes, links });
const idx = (nodes: RevitifyNode[], links: RevitifyLink[] = []): GraphIndex =>
  new GraphIndex(g(nodes, links));

describe("query/centrality edges", () => {
  it("skips betweenness above SKIP_LIMIT — all-zero, never builds adjacency", () => {
    const nodes = Array.from({ length: 20001 }, (_, i) => node(`n${i}`));
    const score = betweenness(idx(nodes));
    expect(score.size).toBe(20001);
    expect([...score.values()].every((v) => v === 0)).toBe(true);
  });

  it("samples with stride > 1 above SAMPLE_LIMIT", () => {
    const nodes = Array.from({ length: 501 }, (_, i) => node(`n${i}`));
    const score = betweenness(idx(nodes, [link("n0", "n1", { relation: "calls" })]));
    expect(score.size).toBe(501);
    expect(score.get("n0")).toBeTypeOf("number");
  });
});

describe("query/communities edges", () => {
  it("skips community-less nodes and links; a zero-edge community has cohesion 1", () => {
    const info = communities(
      idx([node("a", { community: 0 }), node("b")], [link("a", "b", { relation: "calls" })]),
    );
    expect(info).toHaveLength(1);
    expect(info[0]?.members.map((m) => m.id)).toEqual(["a"]);
    expect(info[0]?.cohesion).toBe(1);
  });

  it("an isolated community node reports cohesion 1 (no internal or external edges)", () => {
    const info = communities(idx([node("x", { community: 7 })]));
    expect(info[0]?.cohesion).toBe(1);
  });
});

describe("query/explain edges", () => {
  it("searchNodes tolerates kind-less nodes", () => {
    const hits = searchNodes(
      idx([node("a", { label: "engine", source_file: "core.ts" })]),
      "engine",
    );
    expect(hits[0]?.node.label).toBe("engine");
  });

  it("explain falls back to 'node' kind, source_file, and 'linked to' for a relation-less in-edge", () => {
    const nodes = [
      node("a", { label: "engine", source_file: "core.ts" }),
      node("b", { label: "helper", source_file: "core.ts" }),
    ];
    const text = explain(idx(nodes, [link("b", "a")]), "engine");
    expect(text).toMatch(/## engine \(node\) — core\.ts/);
    expect(text).toMatch(/linked to \*\*helper\*\*/);
  });
});

describe("query/affected edges", () => {
  it("ignores incoming links that have no relation", () => {
    expect(affected(idx([node("a"), node("b")], [link("b", "a")]), "a")).toEqual([]);
  });
});

describe("query/graph + traverse edges", () => {
  it("neighbors of an unknown id is empty", () => {
    expect(idx([node("a")]).neighbors("ghost")).toEqual([]);
  });

  it("shortestPath returns undefined for two real but disconnected nodes", () => {
    expect(shortestPath(idx([node("a"), node("b")]), "a", "b")).toBeUndefined();
  });
});

describe("enrich/god-nodes edges", () => {
  it("keeps a kind-less node (kind ?? '')", () => {
    const gods = godNodes(g([node("a"), node("b")], [link("a", "b", { relation: "calls" })]));
    expect(gods.some((x) => x.node.id === "a")).toBe(true);
  });
});

describe("enrich/report-data edges", () => {
  it("buckets kind-less nodes under 'node' and counts repeats", () => {
    const counts = kindCounts(
      g([node("a"), node("b", { kind: "func" }), node("c", { kind: "func" })]),
    );
    expect(counts.get("node")).toBe(1);
    expect(counts.get("func")).toBe(2);
  });
});

describe("enrich/surprise edges", () => {
  it("an empty graph yields no surprises (hubThreshold ?? 0)", () => {
    expect(surprisingConnections(g([]))).toEqual([]);
  });

  it("a relation-less cross-file, cross-language link scores >= 3 and is kept", () => {
    const out = surprisingConnections(
      g([node("a", { source_file: "a.ts" }), node("b", { source_file: "b.py" })], [link("a", "b")]),
    );
    expect(out).toHaveLength(1);
    expect(out[0]?.reasons).toEqual(expect.arrayContaining(["cross-file", "cross-language"]));
  });

  it("skips links whose endpoints are not nodes", () => {
    expect(
      surprisingConnections(g([node("a")], [link("a", "ghost", { relation: "calls" })])),
    ).toEqual([]);
  });
});

describe("enrich/questions edges", () => {
  it("skips the god question when the broker IS the top god (3-node path)", () => {
    const q = suggestedQuestions(
      g(
        [node("a"), node("b"), node("c")],
        [link("a", "b", { relation: "calls" }), link("b", "c", { relation: "calls" })],
      ),
    );
    expect(q.some((s) => s.includes("load-bearing wall"))).toBe(false);
  });

  it("emits the god question when the top god differs from the broker (two paths bridged)", () => {
    // Two 5-node paths joined through bridge node x: x has the highest betweenness (sole
    // bridge) while the path-interior node a2 is the first degree-2 node (top god by stable sort).
    const nodes = [
      ...["a1", "a2", "a3", "a4", "a5"].map((id) => node(id)),
      ...["b1", "b2", "b3", "b4", "b5"].map((id) => node(id)),
      node("x"),
    ];
    const links = [
      link("a1", "a2", { relation: "calls" }),
      link("a2", "a3", { relation: "calls" }),
      link("a3", "a4", { relation: "calls" }),
      link("a4", "a5", { relation: "calls" }),
      link("b1", "b2", { relation: "calls" }),
      link("b2", "b3", { relation: "calls" }),
      link("b3", "b4", { relation: "calls" }),
      link("b4", "b5", { relation: "calls" }),
      link("a5", "x", { relation: "calls" }),
      link("x", "b1", { relation: "calls" }),
    ];
    const q = suggestedQuestions(g(nodes, links));
    expect(q.some((s) => s.includes("edges") && /load-bearing wall/.test(s))).toBe(true);
  });

  it("no node carries a community → no community question; a small limit truncates", () => {
    const graph = g([node("a"), node("b")], [link("a", "b", { relation: "calls" })]);
    const q = suggestedQuestions(graph);
    expect(q.every((s) => !s.startsWith("Community "))).toBe(true);
    expect(suggestedQuestions(graph, 1)).toHaveLength(1);
  });

  it("skips community-less nodes when sizing the biggest community", () => {
    const q = suggestedQuestions(
      g(
        [node("a", { community: 0 }), node("b", { community: 0 }), node("c")],
        [link("a", "b", { relation: "calls" })],
      ),
    );
    expect(q.some((s) => s.startsWith("Community 0 holds 2 nodes"))).toBe(true);
  });

  it("confidenceSummary reports 0% shares when no link carries confidence", () => {
    const summary = confidenceSummary(g([node("a"), node("b")], [link("a", "b")]));
    expect(summary.every(([, , pct]) => pct === 0)).toBe(true);
  });
});
