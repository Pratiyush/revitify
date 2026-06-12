import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultExtractors } from "../src/extract/index.js";
import { Registry } from "../src/extract/registry.js";
import { typescriptExtractor } from "../src/extract/typescript.js";
import { defaultIngestors } from "../src/ingest/index.js";
import { markdownIngestor } from "../src/ingest/markdown.js";
import { walkFiles } from "../src/ingest/walk.js";
import { assertGraphContract } from "../src/model/contract.js";
import type { FileRef, SourceFile } from "../src/model/fragment.js";
import { gitHead } from "../src/passes/git.js";

/** Layer-level units for the modular engine: registry dispatch/laziness, extractor edges the
 *  contract fixture doesn't reach, async ingest wrappers, and the loud-validator branches. */

const ref = (relPath: string): FileRef => ({ path: `/x/${relPath}`, relPath, size: 1 });
const src = (relPath: string, content: string): SourceFile => ({ ...ref(relPath), content });

describe("extractor registry", () => {
  it("dispatches by detect/extensions and rejects .d.ts and unknown files", () => {
    expect(defaultExtractors.match(ref("a.ts"))?.id).toBe("typescript");
    expect(defaultExtractors.match(ref("a.py"))?.id).toBe("ts-python");
    expect(defaultExtractors.match(ref("A.java"))?.id).toBe("ts-java");
    expect(defaultExtractors.match(ref("a.d.ts"))).toBeUndefined();
    expect(defaultExtractors.match(ref("a.json"))).toBeUndefined();
  });

  it("resolves lazily (async), memoizes, and resolveSync returns undefined without loadSync", async () => {
    for (const rel of ["a.ts", "b.py", "C.java"]) {
      const reg = defaultExtractors.match(ref(rel));
      expect(reg).toBeDefined();
      const extractor = await defaultExtractors.resolve(reg!);
      expect(extractor.extract).toBeTypeOf("function");
      expect(await defaultExtractors.resolve(reg!)).toBe(extractor); // memoized
    }
    const lazyOnly = new Registry<{ id: string }>([
      { id: "lazy", load: () => Promise.resolve({ id: "lazy" }) },
    ]);
    const reg = lazyOnly.match(ref("anything"));
    expect(reg).toBeDefined();
    expect(lazyOnly.resolveSync(reg!)).toBeUndefined(); // no loadSync — async-only module
    expect((await lazyOnly.resolve(reg!)).id).toBe("lazy");
    expect(lazyOnly.resolveSync(reg!)).toEqual({ id: "lazy" }); // cached after async load
  });
});

describe("typescript extractor edges", () => {
  it("extracts enums, type aliases, exported consts — and dedups repeated ids", () => {
    const out = typescriptExtractor.extract(
      src(
        "src/kinds.ts",
        [
          "export enum Mode { A, B }",
          "export type Pair = [number, number];",
          "export const limit = 3, retries = 2;",
          "const internal = 1;",
          "export enum Mode { C }", // duplicate id — addNode keeps the first
        ].join("\n"),
      ),
      { rootDir: "/x", knownFiles: new Set<string>() },
    );
    const kinds = new Map(out.nodes.map((n) => [n.label, n.kind]));
    expect(kinds.get("Mode")).toBe("enum");
    expect(kinds.get("Pair")).toBe("type");
    expect(kinds.get("limit")).toBe("const");
    expect(kinds.get("retries")).toBe("const");
    expect(kinds.has("internal")).toBe(false); // unexported consts are not symbols
    expect(out.nodes.filter((n) => n.label === "Mode")).toHaveLength(1);
  });
});

describe("ingestors", () => {
  it("async ingest() wrappers return the same fragment as ingestSync()", async () => {
    const md = src("doc.md", "# Title\n```\n# fenced — not a heading\n```\n## Sub\n");
    const sync = markdownIngestor.ingestSync!(md, { rootDir: "/x", knownFiles: new Set<string>() });
    const isAsync = await markdownIngestor.ingest(md, {
      rootDir: "/x",
      knownFiles: new Set<string>(),
    });
    expect(isAsync).toEqual(sync);
    expect(sync.nodes.map((n) => n.label)).toEqual(["doc.md", "Title", "Sub"]); // fence skipped

    const code = defaultIngestors[0]!;
    const tsFile = src("a.ts", "export function f(): void {}");
    expect(await code.ingest(tsFile, { rootDir: "/x", knownFiles: new Set<string>() })).toEqual(
      code.ingestSync!(tsFile, { rootDir: "/x", knownFiles: new Set<string>() }),
    );
    expect(
      code.ingestSync!(src("a.unknown", "?"), { rootDir: "/x", knownFiles: new Set<string>() }),
    ).toEqual({
      nodes: [],
      links: [],
    });
  });
});

describe("walk + git", () => {
  it("walkFiles returns absolute paths and gitHead is undefined outside a repo", () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-walk-"));
    writeFileSync(join(dir, "a.ts"), "export const a = 1;");
    const files = walkFiles(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).toBe(join(dir, "a.ts"));
    expect(gitHead(dir)).toBeUndefined();
  });
});

describe("assertGraphContract branches", () => {
  const base = () => ({
    nodes: [{ id: "n", label: "n", source_file: "f.ts", community: 0 }],
    links: [{ source: "n", target: "n", relation: "contains" }],
  });

  it.each([
    [{ nodes: "no" }, /nodes is not an array/],
    [{ links: "no" }, /links is not an array/],
    [{ built_at_commit: 7 }, /built_at_commit is not a string/],
    [{ nodes: [null] }, /nodes\[0\] is not an object/],
    [{ nodes: [{ label: "x", source_file: "f" }] }, /nodes\[0\]\.id is missing/],
    [{ nodes: [{ id: "x", source_file: "f" }] }, /nodes\[0\]\.label is missing/],
    [
      { nodes: [{ id: "x", label: "x", source_file: "f", community: "0" }] },
      /community is not a number/,
    ],
    [{ links: [null] }, /links\[0\] is not an object/],
    [{ links: [{ target: "n" }] }, /links\[0\]\.source is missing/],
    [{ links: [{ source: "n" }] }, /links\[0\]\.target is missing/],
    [{ links: [{ source: "n", target: "n", relation: 1 }] }, /relation is not a string/],
  ])("rejects %j loudly", (patch, message) => {
    expect(() => assertGraphContract({ ...base(), ...patch })).toThrowError(message);
  });

  it("rejects non-objects", () => {
    expect(() => assertGraphContract(null)).toThrowError(/graph is not an object/);
  });
});
