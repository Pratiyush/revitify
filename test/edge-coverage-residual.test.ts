import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { javaExtractor } from "../src/extract/java.js";
import { pythonExtractor } from "../src/extract/python.js";
import { createTreeSitterExtractor } from "../src/extract/treesitter/factory.js";
import type { SourceFile } from "../src/model/fragment.js";
import { extractOne } from "../src/passes/extract.js";

/** Final residual coverage — the spots only reachable by calling a module directly (detect
 *  arrows, extractOne's read/skip paths, the unwritable-log breadcrumb, contrived grammar configs). */

const src = (relPath: string, content: string): SourceFile => ({
  path: `/x/${relPath}`,
  relPath,
  size: content.length,
  content,
});
const ctx = { rootDir: "/x", knownFiles: new Set<string>() };
const PY_WASM = "tree-sitter-python/tree-sitter-python.wasm";

describe("extract regex detect arrows", () => {
  it("python/java extractors detect their own extensions", () => {
    expect(pythonExtractor.detect(src("a.py", ""))).toBe(true);
    expect(pythonExtractor.detect(src("a.ts", ""))).toBe(false);
    expect(javaExtractor.detect(src("A.java", ""))).toBe(true);
    expect(javaExtractor.detect(src("a.ts", ""))).toBe(false);
  });
});

describe("passes/extract extractOne", () => {
  it("returns undefined when the file cannot be read", async () => {
    const frag = await extractOne(
      "/x",
      { path: "/x/missing.ts", relPath: "missing.ts", size: 1 },
      new Set(),
      undefined,
    );
    expect(frag).toBeUndefined();
  });

  it("warns once for a gated file with no key, stays silent after, and degrades to a bare file node", async () => {
    for (const k of [
      "ANTHROPIC_API_KEY",
      "GEMINI_API_KEY",
      "GOOGLE_API_KEY",
      "OPENAI_API_KEY",
      "OLLAMA_HOST",
      "REVITIFY_OLLAMA",
    ])
      vi.stubEnv(k, "");
    vi.resetModules(); // fresh module-level `skipNotices`
    const { extractOne: freshExtractOne } = await import("../src/passes/extract.js");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dir = mkdtempSync(join(tmpdir(), "revitify-gated-"));
    writeFileSync(join(dir, "a.png"), "not-a-real-png");
    const png = { path: join(dir, "a.png"), relPath: "a.png", size: 13 };
    try {
      const first = await freshExtractOne(dir, png, new Set(["a.png"]), undefined);
      const second = await freshExtractOne(dir, png, new Set(["a.png"]), undefined);
      expect(first?.nodes.some((n) => n.id === "file:a.png")).toBe(true);
      expect(second?.nodes.some((n) => n.id === "file:a.png")).toBe(true);
      expect(spy).toHaveBeenCalledTimes(1); // the skip-notice fires once, then stays silent
    } finally {
      spy.mockRestore();
      vi.unstubAllEnvs();
    }
  });
});

describe("query/querylog unwritable", () => {
  it("warns once then stays silent when the log path can't be created", async () => {
    vi.resetModules(); // fresh module-level `warnedLogFailure`
    const { appendQueryLog } = await import("../src/query/querylog.js");
    const dir = mkdtempSync(join(tmpdir(), "revitify-qlog-fail-"));
    writeFileSync(join(dir, ".revitify"), ""); // a FILE where the dir must go → mkdir throws ENOTDIR
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      appendQueryLog(dir, "query", "x", 1);
      appendQueryLog(dir, "query", "y", 1);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(String(spy.mock.calls[0]?.[0])).toContain("query log unwritable");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("extract/treesitter factory (contrived configs)", () => {
  it("a config without calls/comments still extracts definitions", async () => {
    const ext = await createTreeSitterExtractor({
      id: "min",
      language: "python",
      wasm: PY_WASM,
      extensions: [".py"],
      definitions: [{ type: "function_definition", kind: "function" }],
    });
    expect(ext.detect(src("a.py", ""))).toBe(true); // the factory extractor's own detect arrow
    expect(ext.detect(src("a.ts", ""))).toBe(false);
    expect(
      ext
        .extract(src("a.py", "def f():\n    pass\n"), ctx)
        .nodes.some((n) => n.id === "sym:a.py#f"),
    ).toBe(true);
  });

  it("a definition rule whose node has no name emits nothing (definitionName undefined)", async () => {
    const ext = await createTreeSitterExtractor({
      id: "noname",
      language: "python",
      wasm: PY_WASM,
      extensions: [".py"],
      definitions: [{ type: "block", kind: "b" }],
    });
    expect(
      ext.extract(src("a.py", "if True:\n    pass\n"), ctx).nodes.every((n) => n.kind !== "b"),
    ).toBe(true);
  });

  it("nameChildType falls back to child.text when the carrier has no name field", async () => {
    const ext = await createTreeSitterExtractor({
      id: "nct",
      language: "python",
      wasm: PY_WASM,
      extensions: [".py"],
      definitions: [{ type: "expression_statement", kind: "x", nameChildType: "identifier" }],
    });
    expect(ext.extract(src("a.py", "foo\n"), ctx).nodes.some((n) => n.label === "foo")).toBe(true);
  });
});
