import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildGraph, buildGraphAsync, Confidence } from "../src/index.js";

/**
 * Phase 3 — three-pass intelligence (upstream: symbol_resolution.py, dedup.py/_minhash.py,
 * cluster.py @ graphify 0.8.38): symbol→symbol calls, tiered resolution precedence,
 * minhash+Jaro-Winkler doc dedup, Louvain+refinement communities with re-splits.
 */

function project(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-intel-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(join(dir, rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "."), {
      recursive: true,
    });
    writeFileSync(join(dir, rel), content);
  }
  return dir;
}

describe("call extraction + resolution (typescript)", () => {
  const graph = buildGraph(
    project({
      "src/svc.ts": [
        `import { hash } from "./crypto.js";`,
        "export function login(): string {",
        "  audit();",
        "  return hash('u');",
        "}",
        "export function audit(): void {}",
      ].join("\n"),
      "src/crypto.ts": "export function hash(s: string): string { return s; }",
    }),
  );

  it("symbol→symbol calls edges, confidence-tagged", () => {
    const calls = graph.links.filter((l) => l.relation === "calls");
    const byTarget = new Map(calls.map((l) => [l.target, l]));
    // Same-file call: login → audit, resolved in the same-file tier.
    const audit = byTarget.get("sym:src/svc.ts#audit");
    expect(audit?.source).toBe("sym:src/svc.ts#login");
    expect(audit?.confidence).toBe(Confidence.INFERRED);
    // Cross-file call: login → hash.
    const hash = byTarget.get("sym:src/crypto.ts#hash");
    expect(hash?.source).toBe("sym:src/svc.ts#login");
  });

  it("unresolvable callees (built-ins) leave no edge", () => {
    expect(graph.links.some((l) => String(l.target).includes("name:"))).toBe(false);
  });
});

describe("tiered resolution precedence", () => {
  it("same-file beats same-dir beats global; unique-in-tier is INFERRED", () => {
    const graph = buildGraph(
      project({
        "a/local.ts": [
          "export function helper(): void {}",
          "export function run(): void { helper(); }",
        ].join("\n"),
        "a/sibling.ts": "export function helper(): void {}",
        "b/far.ts": "export function helper(): void {}",
      }),
    );
    const call = graph.links.find((l) => l.relation === "calls");
    // Three candidates exist, but the same-file one wins the tier — INFERRED, not AMBIGUOUS.
    expect(call?.target).toBe("sym:a/local.ts#helper");
    expect(call?.confidence).toBe(Confidence.INFERRED);
  });

  it("ties within the winning tier are AMBIGUOUS with lexicographic pick", () => {
    const graph = buildGraph(
      project({
        "m/caller.ts": `import { helper } from "../x/one.js";\nexport function go(): void { helper(); }`,
        "x/one.ts": "export function helper(): void {}",
        "y/two.ts": "export function helper(): void {}",
      }),
    );
    const call = graph.links.find((l) => l.relation === "calls");
    expect(call?.confidence).toBe(Confidence.AMBIGUOUS);
    expect(call?.target).toBe("sym:x/one.ts#helper"); // lexicographically first in global tier
  });
});

describe("minhash dedup (doc nodes only)", () => {
  it("merges near-duplicate headings, rewrites links, never touches code symbols", () => {
    const graph = buildGraph(
      project({
        "README.md": "# Getting Started\n",
        "docs/setup.md": "# getting--started\n",
        "a/f.ts": "export function helper(): void {}",
        "b/f.ts": "export function helper(): void {}",
      }),
    );
    const docs = graph.nodes.filter((n) => n.kind === "doc");
    expect(docs).toHaveLength(1); // near-duplicates merged into the first-seen node
    const merged = docs[0] as { id: string };
    // The second file's contains link now points at the canonical doc node.
    const containsDoc = graph.links.filter((l) => l.target === merged.id);
    expect(containsDoc.map((l) => String(l.source)).sort()).toEqual([
      "file:README.md",
      "file:docs/setup.md",
    ]);
    // Identical code labels stay separate definitions.
    expect(graph.nodes.filter((n) => n.label === "helper")).toHaveLength(2);
  });
});

describe("community detection (louvain + refinement)", () => {
  const files: Record<string, string> = {};
  // Two dense 4-file clusters with internal imports, one bridge edge.
  for (const side of ["alpha", "beta"]) {
    for (let i = 0; i < 4; i++) {
      const imports = Array.from({ length: 4 }, (_, j) => j)
        .filter((j) => j !== i)
        .map((j) => `import "./${side}${j}.js";`)
        .join("\n");
      files[`${side}/${side}${i}.ts`] = `${imports}\nexport function f${side}${i}(): void {}`;
    }
  }
  files["alpha/alpha0.ts"] += `\nimport "../beta/beta0.js";`; // the bridge

  it("separates the two clusters; deterministic across runs", async () => {
    const dir = project(files);
    const one = buildGraph(dir);
    const two = await buildGraphAsync(dir, { cache: false });
    expect(one.nodes.map((n) => [n.id, n.community])).toEqual(
      two.nodes.map((n) => [n.id, n.community]),
    );
    const communityOf = new Map(one.nodes.map((n) => [n.id, n.community]));
    const alpha = new Set(
      [...communityOf].filter(([id]) => id.includes("alpha/")).map(([, c]) => c),
    );
    const beta = new Set([...communityOf].filter(([id]) => id.includes("beta/")).map(([, c]) => c));
    expect(alpha.size).toBe(1); // each side coheres
    expect(beta.size).toBe(1);
    expect([...alpha][0]).not.toBe([...beta][0]); // and they separate
  });

  it("isolated nodes get their own communities", () => {
    const graph = buildGraph(
      project({
        "lonely.md": "# Alone\n",
        "src/a.ts": `import "./b.js";\nexport const x = 1;`,
        "src/b.ts": "export const y = 1;",
      }),
    );
    const communities = new Set(graph.nodes.map((n) => n.community));
    expect(communities.size).toBeGreaterThan(1);
    for (const n of graph.nodes) expect(typeof n.community).toBe("number");
  });
});
