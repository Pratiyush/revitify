import { describe, expect, it } from "vitest";
import { callflowExporter } from "../src/export/callflow-html.js";
import { renderHtml } from "../src/export/html.js";
import { mermaidExporter } from "../src/export/mermaid.js";
import { renderReport } from "../src/export/report.js";
import { treeExporter } from "../src/export/tree-html.js";
import { wikiExporter } from "../src/export/wiki.js";
import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../src/index.js";

/** Edge-case coverage for the exporters — degenerate graphs that hit the `?? default`,
 *  built_at_commit, non-god, and overflow branches the standard fixtures never reach. */

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

describe("export/wiki edges", () => {
  it("buckets community-less nodes under -1; a non-god symbol shows no star and uses source_file", () => {
    const wiki = wikiExporter.render(
      g([node("s", { label: "engine", kind: "function", source_file: "a.ts" })]),
    );
    expect(wiki).toMatch(/## Community -1/);
    expect(wiki).toContain("**engine** (function) — `a.ts`");
    expect(wiki).not.toContain("⭐");
  });

  it("truncates a community with more than 20 symbols", () => {
    const nodes = Array.from({ length: 21 }, (_, i) =>
      node(`s${i}`, { kind: "function", community: 0 }),
    );
    expect(wikiExporter.render(g(nodes))).toMatch(/… 1 more/);
  });
});

describe("export/report edges", () => {
  it("renders the built_at_commit stamp and the 'no connected symbols' fallback", () => {
    const report = renderReport({
      built_at_commit: "0123456789abcdef",
      nodes: [node("f", { kind: "file", source_file: "f.ts" })],
      links: [],
    });
    expect(report).toContain("built at `01234567`");
    expect(report).toContain("none — no connected symbols yet");
  });
});

describe("export/mermaid edges", () => {
  it("renders an empty edge label for a relation-less link", () => {
    const mmd = mermaidExporter.render(
      g([node("a", { kind: "function" }), node("b", { kind: "function" })], [link("a", "b")]),
    );
    expect(mmd).toMatch(/-->\|\|/);
  });
});

describe("export/tree-html edges", () => {
  it("labels a kind-less symbol as 'node'", () => {
    const tree = treeExporter.render(g([node("s", { label: "widget", source_file: "src/a.ts" })]));
    expect(tree).toContain("<code>node</code>");
    expect(tree).toContain("widget");
  });
});

describe("export/callflow + html edges", () => {
  it("inlines built_at_commit into the callflow viewer", () => {
    const stamped: RevitifyGraph = {
      built_at_commit: "deadbeef0",
      nodes: [node("a", { kind: "function" }), node("b", { kind: "function" })],
      links: [link("a", "b", { relation: "calls" })],
    };
    expect(callflowExporter.render(stamped)).toContain("deadbeef0");
  });

  it("inlines built_at_commit into the html viewer", () => {
    expect(renderHtml({ built_at_commit: "deadbeef0", nodes: [node("x")], links: [] })).toContain(
      "deadbeef0",
    );
  });
});
