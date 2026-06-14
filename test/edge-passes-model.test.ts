import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AstCache } from "../src/cache/ast.js";
import type { RevitifyLink, RevitifyNode } from "../src/index.js";
import { assertGraphContract } from "../src/model/contract.js";
import { relOf } from "../src/model/ids.js";
import { assignCommunities, cohesion } from "../src/passes/cluster.js";
import { dedupNodes } from "../src/passes/dedup/index.js";
import { signature } from "../src/passes/dedup/minhash.js";
import { finalizeGraph } from "../src/passes/finalize.js";
import { gitHead } from "../src/passes/git.js";
import { resolveReferences } from "../src/passes/resolve.js";

/** Edge-case coverage for the model + passes layers — degenerate inputs that the happy-path
 *  fixtures never produce (missing fields, empty adjacency, dangling endpoints, git presence). */

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
const doc = (id: string, label: string): RevitifyNode => ({
  id,
  label,
  kind: "doc",
  source_file: `${id}.md`,
});

describe("model/ids edges", () => {
  it("relOf returns a non-sym, non-file id unchanged", () => {
    expect(relOf("name:foo")).toBe("name:foo");
    expect(relOf("doc:a.md#Heading")).toBe("doc:a.md#Heading");
  });
});

describe("model/contract edges", () => {
  it("rejects a link whose confidence is not one of the enum values", () => {
    expect(() =>
      assertGraphContract({
        nodes: [node("n")],
        links: [{ source: "n", target: "n", confidence: "MAYBE" }],
      }),
    ).toThrowError(/links\[0\]\.confidence is not one of/);
  });
});

describe("passes/cluster edges", () => {
  it("a path graph exercises the local-moving weight defaults", () => {
    const nodes = [node("a"), node("b"), node("c")];
    assignCommunities(nodes, [link("a", "b"), link("b", "c")]);
    expect(nodes.every((n) => typeof n.community === "number")).toBe(true);
  });

  it("cohesion of a degree-0 member is 1 (empty-boundary guard)", () => {
    expect(cohesion(["x"], new Map([["x", new Map()]]), new Map([["x", 0]]))).toBe(1);
  });
});

describe("passes/dedup edges", () => {
  it("keeps a link that has no relation (relation ?? '' key)", () => {
    const out = dedupNodes([node("a"), node("b")], [{ source: "a", target: "b" }]);
    expect(out.links).toHaveLength(1);
    expect(out.merged).toBe(0);
  });

  it("merges three mutually-duplicate doc headings (union find no-op on the redundant edge)", () => {
    const out = dedupNodes(
      [doc("a", "Getting Started"), doc("b", "getting--started"), doc("c", "Getting   Started!!!")],
      [],
    );
    expect(out.merged).toBe(2); // 3 docs collapse into 1 canonical
    expect(out.nodes).toHaveLength(1);
  });

  it("reordered-word doc labels do not merge (Jaro-Winkler gate)", () => {
    // High shingle overlap, low edit similarity — exercises the confirm-gate reject path.
    const out = dedupNodes(
      [doc("a", "Report Generation Analysis"), doc("b", "Analysis Generation Report")],
      [],
    );
    expect(out.merged).toBe(0);
  });
});

describe("passes/dedup/minhash edges", () => {
  it("signature caps input at 512 chars", () => {
    expect(signature("a".repeat(600))).toEqual(signature("a".repeat(513)));
  });
});

describe("passes/resolve edges", () => {
  it("keeps file: endpoints that are not present as nodes (isFile fallback in the dangling filter)", () => {
    const out = resolveReferences(new Map(), [
      { source: "file:a.ts", target: "file:b.ts", relation: "imports" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.source).toBe("file:a.ts");
  });
});

describe("passes/finalize edges", () => {
  it("skips a ref that has no fragment, and keeps the first-seen node on a duplicate id", () => {
    const empty = finalizeGraph("/x", [{ path: "/x/a.ts", relPath: "a.ts", size: 1 }], new Map());
    expect(empty.nodes).toEqual([]);

    const dup = { id: "file:a.ts", label: "a.ts", source_file: "a.ts" };
    const merged = finalizeGraph(
      "/x",
      [
        { path: "/x/a.ts", relPath: "a.ts", size: 1 },
        { path: "/x/b.ts", relPath: "b.ts", size: 1 },
      ],
      new Map([
        ["a.ts", { nodes: [dup], links: [] }],
        ["b.ts", { nodes: [{ ...dup }], links: [] }],
      ]),
    );
    expect(merged.nodes).toHaveLength(1);
    expect(merged.built_at_commit).toBeUndefined(); // /x is not a git repo
  });

  it("stamps built_at_commit when the root is a git repo", () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-git-fin-"));
    spawnSync("git", ["init", "-q"], { cwd: dir });
    spawnSync(
      "git",
      [
        "-c",
        "user.email=t@t.t",
        "-c",
        "user.name=t",
        "commit",
        "--allow-empty",
        "-q",
        "-m",
        "init",
      ],
      { cwd: dir },
    );
    const graph = finalizeGraph(dir, [], new Map());
    expect(graph.built_at_commit).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe("passes/git edges", () => {
  it("gitHead resolves HEAD inside a real repo and is undefined outside one", () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-git-head-"));
    expect(gitHead(dir)).toBeUndefined(); // no repo yet
    spawnSync("git", ["init", "-q"], { cwd: dir });
    spawnSync(
      "git",
      [
        "-c",
        "user.email=t@t.t",
        "-c",
        "user.name=t",
        "commit",
        "--allow-empty",
        "-q",
        "-m",
        "init",
      ],
      { cwd: dir },
    );
    expect(gitHead(dir)).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe("cache/ast edges", () => {
  it("tolerates a FileRef without mtimeMs (mtimeMs ?? 0 on both put and contentGet)", () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-cache-mtime-"));
    const cache = new AstCache(dir, new Set(["a.ts"]));
    const ref = { path: join(dir, "a.ts"), relPath: "a.ts", size: 10 }; // no mtimeMs
    const fragment = { nodes: [], links: [] };
    cache.put(ref, "content", fragment);
    expect(cache.contentGet(ref, "content")).toEqual(fragment);
    expect(cache.statGet({ ...ref, mtimeMs: 0 })).toEqual(fragment); // stored with mtimeMs 0
  });
});
