import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extraExporters } from "../src/export/index.js";
import { buildGraph } from "../src/index.js";
import { affected } from "../src/query/affected.js";
import { communities } from "../src/query/communities.js";
import { explain, searchNodes } from "../src/query/explain.js";
import { GraphIndex } from "../src/query/graph.js";
import { appendQueryLog } from "../src/query/querylog.js";
import { neighborhood, shortestPath } from "../src/query/traverse.js";

/** Phase 5 — query verbs (querylog.py, affected.py, serve.py scoring) + extra exporters. */

function project(): { dir: string; index: GraphIndex } {
  const dir = mkdtempSync(join(tmpdir(), "revitify-query-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(
    join(dir, "src", "core.ts"),
    "export function engine(): void {}\nexport function helper(): void { engine(); }",
  );
  writeFileSync(
    join(dir, "src", "api.ts"),
    `import { helper } from "./core.js";\nexport function handle(): void { helper(); }`,
  );
  writeFileSync(
    join(dir, "src", "ui.ts"),
    `import { handle } from "./api.js";\nexport function render(): void { handle(); }`,
  );
  writeFileSync(join(dir, "README.md"), "# Query fixture\n");
  return { dir, index: new GraphIndex(buildGraph(dir)) };
}

describe("traverse + path", () => {
  const { index } = project();

  it("finds the shortest path between symbols across files", () => {
    const path = shortestPath(index, "sym:src/ui.ts#render", "sym:src/core.ts#engine");
    expect(path?.[0]).toBe("sym:src/ui.ts#render");
    expect(path?.at(-1)).toBe("sym:src/core.ts#engine");
    expect(path?.length).toBeLessThanOrEqual(5);
    expect(shortestPath(index, "sym:src/ui.ts#render", "missing")).toBeUndefined();
  });

  it("neighborhood respects depth", () => {
    const one = neighborhood(index, "sym:src/core.ts#engine", 1);
    const two = neighborhood(index, "sym:src/core.ts#engine", 2);
    expect(two.length).toBeGreaterThan(one.length);
  });
});

describe("affected (blast radius)", () => {
  const { index } = project();

  it("walks reverse dependencies transitively", () => {
    const blast = affected(index, "sym:src/core.ts#engine");
    expect(blast).toContain("sym:src/core.ts#helper"); // direct caller
    expect(blast).toContain("sym:src/api.ts#handle"); // transitive
    expect(blast).toContain("sym:src/ui.ts#render"); // transitive²
  });
});

describe("communities + cohesion", () => {
  const { index } = project();

  it("lists communities with size and cohesion in [0,1]", () => {
    const info = communities(index);
    expect(info.length).toBeGreaterThan(0);
    for (const c of info) {
      expect(c.cohesion).toBeGreaterThanOrEqual(0);
      expect(c.cohesion).toBeLessThanOrEqual(1);
      expect(c.size).toBe(c.members.length);
    }
  });
});

describe("search + explain", () => {
  const { index } = project();

  it("idf-ranks matches and explains with neighbors", () => {
    const hits = searchNodes(index, "engine");
    expect(hits[0]?.node.label).toBe("engine");
    const text = explain(index, "engine core");
    expect(text).toMatch(/## engine/);
    expect(text).toMatch(/helper/); // neighbor narrated
    expect(explain(index, "zzz-nothing-matches")).toMatch(/No nodes match/);
  });
});

describe("query log", () => {
  it("appends JSONL entries", () => {
    const { dir } = project();
    appendQueryLog(dir, "query", "engine", 3);
    appendQueryLog(dir, "affected", "core", 5);
    const lines = readFileSync(join(dir, ".revitify", "query-log.jsonl"), "utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ kind: "query", query: "engine", results: 3 });
    expect(lines[1]?.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("extra exporters", () => {
  const { dir } = project();
  const graph = buildGraph(dir);

  it("callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps", () => {
    const byId = new Map(extraExporters.map((e) => [e.id, e]));
    const ctx = { rootDir: dir, outDir: dir };

    const callflow = byId.get("callflow-html")?.render(graph, ctx) ?? "";
    expect(callflow).toContain("<canvas");
    expect(callflow).toContain("calls");
    expect(callflow).not.toContain("README.md"); // doc nodes have no calls

    const tree = byId.get("tree-html")?.render(graph, ctx) ?? "";
    expect(tree).toContain("core.ts");
    expect(tree).toContain("engine");

    const wiki = byId.get("wiki")?.render(graph, ctx) ?? "";
    expect(wiki).toMatch(/## Community \d+/);
    expect(wiki).toContain("**engine**");

    const mmd = byId.get("mermaid")?.render(graph, ctx) ?? "";
    expect(mmd).toMatch(/^graph LR/);
    expect(mmd).toMatch(/-->\|calls\|/);
  });
});

describe("edge branches", () => {
  const { index } = project();

  it("path from a node to itself; searches with no usable terms", () => {
    expect(shortestPath(index, "sym:src/core.ts#engine", "sym:src/core.ts#engine")).toEqual([
      "sym:src/core.ts#engine",
    ]);
    expect(searchNodes(index, "!!!")).toEqual([]);
  });

  it("exporters survive an empty graph", () => {
    const empty = { nodes: [], links: [] };
    const ctx = { rootDir: "/x", outDir: "/x" };
    for (const exporter of extraExporters) {
      expect(() => exporter.render(empty, ctx)).not.toThrow();
    }
  });
});
