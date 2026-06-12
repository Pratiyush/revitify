import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { godNodes } from "../src/enrich/god-nodes.js";
import { suggestedQuestions } from "../src/enrich/questions.js";
import { buildGraph, buildGraphAsync, revitify } from "../src/index.js";

/**
 * Phase 4 — report intelligence (upstream: report.py + analyze.py @ graphify 0.8.38):
 * why-nodes (NOTE/WHY/HACK + docstrings), god-node exclusions, surprise ranking,
 * betweenness-seeded questions, confidence summary.
 */

function project(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-report-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(join(dir, rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "."), {
      recursive: true,
    });
    writeFileSync(join(dir, rel), content);
  }
  return dir;
}

describe("why-nodes", () => {
  it("typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol", () => {
    const graph = buildGraph(
      project({
        "src/engine.ts": [
          "// WHY: the cache must survive index corruption — content keys rebuild it",
          "export function rebuild(): void {}",
          "export function untouched(): void {}",
          "// plain comment, not a marker",
        ].join("\n"),
      }),
    );
    const why = graph.nodes.find((n) => n.kind === "why");
    expect(why?.label).toMatch(/^WHY: the cache must survive/);
    const edge = graph.links.find((l) => l.relation === "rationale_for");
    expect(edge?.source).toBe("sym:src/engine.ts#rebuild"); // anchored to the next-line symbol
    expect(edge?.target).toBe(why?.id);
    expect(graph.nodes.filter((n) => n.kind === "why")).toHaveLength(1); // plain comments skipped
  });

  it("python: docstrings and HACK comments via tree-sitter", async () => {
    const graph = await buildGraphAsync(
      project({
        "lib/jobs.py": [
          "class Runner:",
          '    """Coordinates the worker pool."""',
          "    def run(self):",
          "        # HACK: retry twice, scheduler drops the first tick",
          "        pass",
        ].join("\n"),
      }),
      { cache: false },
    );
    const docstring = graph.nodes.find((n) => n.kind === "docstring");
    expect(docstring?.label).toBe("Coordinates the worker pool.");
    const documents = graph.links.find((l) => l.relation === "documents");
    expect(documents?.source).toBe("sym:lib/jobs.py#Runner");
    const hack = graph.nodes.find((n) => n.kind === "why");
    expect(hack?.label).toMatch(/^HACK: retry twice/);
  });
});

describe("god nodes", () => {
  it("ranks symbols only — file/doc/why nodes are excluded", () => {
    const files: Record<string, string> = {
      "src/core.ts": "export function hub(): void {}",
    };
    for (let i = 0; i < 4; i++) {
      files[`src/user${i}.ts`] =
        `import { hub } from "./core.js";\nexport function u${i}(): void { hub(); }`;
    }
    const graph = buildGraph(project(files));
    const gods = godNodes(graph, 3);
    expect(gods[0]?.node.label).toBe("hub");
    for (const g of gods) expect(g.node.kind).not.toBe("file");
  });
});

describe("GRAPH_REPORT.md", () => {
  it("carries god nodes, surprises, confidence, why-nodes, and ≥4 questions", () => {
    const dir = project({
      "core/registry.ts": [
        "// NOTE: ordered array, not a switch — adding a language is one entry",
        "export function dispatch(): void {}",
      ].join("\n"),
      "app/main.ts": `import { dispatch } from "../core/registry.js";\nexport function boot(): void { dispatch(); }`,
      "app/extra.ts": `import { dispatch } from "../core/registry.js";\nexport function spin(): void { dispatch(); }`,
      "README.md": "# Demo\n",
    });
    revitify(dir);
    const report = readFileSync(join(dir, "revitify-out", "GRAPH_REPORT.md"), "utf8");
    expect(report).toMatch(/## God nodes/);
    expect(report).toMatch(/## Surprising connections/);
    expect(report).toMatch(/## Confidence/);
    expect(report).toMatch(/EXTRACTED: \d+/);
    expect(report).toMatch(/## Why-nodes/);
    expect(report).toMatch(/NOTE: ordered array/);
    expect(report).toMatch(/## Suggested questions/);
    const questions = report.split("## Suggested questions")[1] ?? "";
    expect(questions.split("\n").filter((l) => l.startsWith("- ")).length).toBeGreaterThanOrEqual(
      4,
    );
  });

  it("suggestedQuestions seeds from brokers and ambiguity", () => {
    const graph = buildGraph(
      project({
        "a/one.ts": "export function helper(): void {}",
        "b/two.ts": "export function helper(): void {}",
        "c/user.ts": `import { helper } from "../a/one.js";\nexport function go(): void { helper(); }`,
      }),
    );
    const questions = suggestedQuestions(graph);
    expect(questions.length).toBeGreaterThanOrEqual(4);
    expect(questions.some((q) => q.includes("AMBIGUOUS"))).toBe(true);
  });
});

describe("cross-language surprise", () => {
  it("a TS→python reference earns the cross-language bonus", async () => {
    // crunch is defined ONLY in python — the TS call resolves cross-language in the global tier.
    const graph = await buildGraphAsync(
      project({
        "py/algo.py": "def crunch():\n    pass\n",
        "ts/main.ts": "export function go(): void { crunch(); }",
      }),
      { cache: false },
    );
    const { surprisingConnections } = await import("../src/enrich/surprise.js");
    const all = surprisingConnections(graph, 10);
    expect(all.some((s) => s.reasons.includes("cross-language"))).toBe(true);
  });
});
