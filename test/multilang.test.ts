import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { detectLanguage } from "../src/extract/detect.js";
import { assertGraphContract, buildGraph, buildGraphAsync } from "../src/index.js";

/**
 * Phase 2 — tree-sitter multi-language extraction (upstream: graphify extract.py + detect.py).
 * Java coverage is deliberately deep: constructors, methods, fields, nested types — not just
 * type declarations. The sync facade must keep working on the same tree, falling back to the
 * regex extractors (tree-sitter registrations are load()-only).
 */

function mixedProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-multilang-"));
  for (const sub of ["jsrc", "py", "gosrc", "rs", "ts"]) mkdirSync(join(dir, sub));
  writeFileSync(
    join(dir, "jsrc", "Account.java"),
    [
      "package app;",
      "import java.util.List;",
      "public class Account {",
      "    private int balance;",
      "    public Account(int initial) { this.balance = initial; }",
      "    public int getBalance() { return balance; }",
      "    interface Auditor { void audit(); }",
      "}",
      "enum Status { OPEN, CLOSED }",
      "record Snapshot(int value) {}",
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "py", "models.py"),
    [
      "from py.helpers import slugify",
      "",
      "class Post:",
      "    def render(self):",
      "        return slugify(self.title)",
      "",
      "def top_level():",
      "    pass",
    ].join("\n"),
  );
  writeFileSync(join(dir, "py", "helpers.py"), "def slugify(s):\n    return s\n");
  writeFileSync(
    join(dir, "gosrc", "main.go"),
    [
      "package main",
      "type Server struct{}",
      "type Handler interface{}",
      "func main() {}",
      "func (s *Server) Start() {}",
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "rs", "lib.rs"),
    [
      "pub struct Engine { pub rpm: u32 }",
      "pub trait Drive { fn go(&self); }",
      "impl Engine { pub fn start(&self) {} }",
      "pub fn boot() {}",
      "pub const MAX: u32 = 9000;",
    ].join("\n"),
  );
  writeFileSync(join(dir, "ts", "app.ts"), "export function run(): void {}");
  return dir;
}

describe("tree-sitter multi-language extraction (async)", async () => {
  const graph = await buildGraphAsync(mixedProject(), { cache: false });
  const kindOf = new Map(graph.nodes.map((n) => [`${n.source_file}#${n.label}`, n.kind]));

  it("java: constructors, methods, fields, nested types — full member depth", () => {
    // The class and its constructor share the label "Account" — assert by id.
    expect(graph.nodes.find((n) => n.id === "sym:jsrc/Account.java#Account")?.kind).toBe("class");
    expect(kindOf.get("jsrc/Account.java#balance")).toBe("field");
    expect(kindOf.get("jsrc/Account.java#getBalance")).toBe("method");
    expect(kindOf.get("jsrc/Account.java#Auditor")).toBe("interface");
    expect(kindOf.get("jsrc/Account.java#audit")).toBe("method");
    expect(kindOf.get("jsrc/Account.java#Status")).toBe("enum");
    expect(kindOf.get("jsrc/Account.java#Snapshot")).toBe("record");
    // The constructor: same label as the class, nested id Account.Account, kind constructor.
    const ctor = graph.nodes.find((n) => n.id === "sym:jsrc/Account.java#Account.Account");
    expect(ctor?.kind).toBe("constructor");
  });

  it("python: classes, nested methods, functions, file-resolved imports", () => {
    expect(kindOf.get("py/models.py#Post")).toBe("class");
    expect(graph.nodes.find((n) => n.id === "sym:py/models.py#Post.render")?.kind).toBe("function");
    expect(kindOf.get("py/models.py#top_level")).toBe("function");
    const imp = graph.links.find(
      (l) => l.relation === "imports" && String(l.source) === "file:py/models.py",
    );
    expect(imp?.target).toBe("file:py/helpers.py");
    const ref = graph.links.find(
      (l) => l.relation === "imports_from" && String(l.source) === "file:py/models.py",
    );
    expect(ref?.target).toBe("sym:py/helpers.py#slugify");
  });

  it("go and rust symbols, and the whole graph passes the contract", () => {
    expect(kindOf.get("gosrc/main.go#Server")).toBe("type");
    expect(kindOf.get("gosrc/main.go#Start")).toBe("method");
    expect(kindOf.get("rs/lib.rs#Engine")).toBe("struct");
    expect(kindOf.get("rs/lib.rs#Drive")).toBe("trait");
    expect(graph.nodes.find((n) => n.id === "sym:rs/lib.rs#Engine.start")?.kind).toBe("function");
    expect(kindOf.get("rs/lib.rs#MAX")).toBe("const");
    expect(() => assertGraphContract(graph)).not.toThrow();
  });
});

describe("sync facade on the same tree", () => {
  const graph = buildGraph(mixedProject());

  it("falls back to regex (shallow py/java, no go/rust) — never loads tree-sitter", () => {
    const labels = new Set(graph.nodes.map((n) => n.label));
    expect(labels.has("Post")).toBe(true); // regex python: top-level class
    expect(labels.has("Account")).toBe(true); // regex java: type declarations
    expect(labels.has("getBalance")).toBe(false); // no member depth without tree-sitter
    // Universal coverage: go/rust files still get FILE nodes in sync — just no symbols.
    expect(graph.nodes.some((n) => n.id === "file:gosrc/main.go")).toBe(true);
    expect(graph.nodes.some((n) => n.id.startsWith("sym:") && n.source_file.endsWith(".go"))).toBe(
      false,
    );
    expect(graph.nodes.some((n) => n.id.startsWith("sym:") && n.source_file.endsWith(".rs"))).toBe(
      false,
    );
  });
});

describe("language detection", () => {
  it("maps extensions; undefined for unknown", () => {
    expect(detectLanguage("a/b.py")).toBe("python");
    expect(detectLanguage("A.java")).toBe("java");
    expect(detectLanguage("x.rs")).toBe("rust");
    expect(detectLanguage("x.unknown")).toBeUndefined();
    expect(detectLanguage("Makefile")).toBeUndefined();
  });
});
