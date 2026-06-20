import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultExtractors } from "../src/extract/index.js";
import { typescriptExtractor } from "../src/extract/typescript.js";
import { buildGraphAsync } from "../src/index.js";
import type { SourceFile } from "../src/model/fragment.js";

/** Edge-case coverage for the extract layer — the TS compiler's call/member/import shapes,
 *  tree-sitter python depth (docstrings, relative/missing imports), and the regex fallbacks. */

const src = (relPath: string, content: string): SourceFile => ({
  path: `/x/${relPath}`,
  relPath,
  size: content.length,
  content,
});
const ctx = (knownFiles: string[] = []) => ({ rootDir: "/x", knownFiles: new Set(knownFiles) });
const ref = (relPath: string) => ({ path: `/x/${relPath}`, relPath, size: 1 });

describe("extract/typescript (direct, sync compiler path)", () => {
  it("covers bare imports/exports, body-less decls, getters, binding patterns, and call kinds", () => {
    const code = [
      "import { x } from 'react';", // bare import (no file: edge)
      "import y from 'node:fs';",
      "export { z } from 'lodash';", // bare re-export (no edge)
      "export declare function ambient(): void;", // no body → no collectCalls
      "export class C { field = 1; get size(): number { return helper(); } }", // field skipped, getter kept
      "export abstract class A { abstract run(): void; }", // method without a body
      "export const { a, b } = obj;", // binding pattern → not captured
      "export const plain = 1;", // non-function initializer
      "export const fn = () => { a.b.c(); o['x'](); gql`q`; arr[i](); };", // property + element-access(string) + tagged-template; arr[i]() = dynamic, unnamed
    ].join("\n");
    const frag = typescriptExtractor.extract(src("a.ts", code), ctx());
    const ids = new Set(frag.nodes.map((n) => n.id));
    expect(ids.has("sym:a.ts#ambient")).toBe(true);
    expect(ids.has("sym:a.ts#C.size")).toBe(true);
    expect(ids.has("sym:a.ts#plain")).toBe(true);
    expect(ids.has("sym:a.ts#fn")).toBe(true);
    expect(ids.has("sym:a.ts#a")).toBe(false); // destructuring is not captured
    const callTargets = frag.links
      .filter((l) => l.relation === "calls")
      .map((l) => String(l.target));
    expect(callTargets).toContain("name:c"); // property-access callee
    expect(callTargets).toContain("name:x"); // element-access callee — o['x']()
    expect(callTargets).toContain("name:gql"); // tagged-template callee — gql`q`
  });

  it("resolves a relative import from a root-level file (no '/' in the path)", () => {
    const frag = typescriptExtractor.extract(
      src("a.ts", "import { x } from './b.js';"),
      ctx(["b.ts"]),
    );
    expect(
      frag.links.some((l) => l.relation === "imports" && String(l.target) === "file:b.ts"),
    ).toBe(true);
  });
});

describe("extract/index regex fallbacks (resolved registry entries)", () => {
  it("the ts-python and ts-java fallback registrations load and extract", async () => {
    const pyReg = defaultExtractors.matchAll(ref("a.py")).find((r) => r.id === "ts-python");
    const pyExt = await pyReg?.load();
    expect(
      pyExt
        ?.extract(src("a.py", "class Post:\n    pass\n"), ctx())
        .nodes.some((n) => n.id === "sym:a.py#Post"),
    ).toBe(true);
    const jReg = defaultExtractors.matchAll(ref("A.java")).find((r) => r.id === "ts-java");
    const jExt = await jReg?.load();
    expect(
      jExt
        ?.extract(src("A.java", "public class Account {}\n"), ctx())
        .nodes.some((n) => n.id === "sym:A.java#Account"),
    ).toBe(true);
  });
});

describe("extract/treesitter (python depth, via the async pipeline)", () => {
  it("extracts docstrings, multi-call bodies, and relative/missing imports", async () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-py-edge-"));
    writeFileSync(join(dir, "helpers.py"), "def slugify(s):\n    return s\n");
    writeFileSync(
      join(dir, "main.py"),
      [
        "import helpers", // import_statement, no nameTypes; resolves (helpers.py present)
        "import nonexistent_pkg", // module not in knownFiles → no imports edge
        "from . import sibling", // relative from-import (no module_name field)
        "from helpers import slugify", // from-import with nameTypes
        "def documented():",
        '    """A real summary."""', // docstring node + documents edge
        "    a()", // first call from this body
        "    b()", // second call from the same body
        "def empty_doc():",
        '    """"""', // docstring trims to empty
        "    pass",
        "def expr_first():",
        "    print('x')", // first body statement is an expression, not a string
        "",
      ].join("\n"),
    );
    const graph = await buildGraphAsync(dir, { cache: false });
    const ids = new Set(graph.nodes.map((n) => n.id));
    expect(ids.has("sym:main.py#documented")).toBe(true);
    expect(graph.nodes.some((n) => n.kind === "docstring")).toBe(true);
    // resolvable import edge present; the missing-package import contributes no file: edge
    expect(graph.links.some((l) => l.relation === "imports")).toBe(true);
  });
});
