import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertGraphContract, buildGraphAsync } from "../src/index.js";

/** The widened language wave (ruby/c/cpp/csharp/bash/php/scala/kotlin) — one symbol-depth
 *  assertion per language, plus calls and why-nodes where the fixtures carry them. */

describe("widened languages", async () => {
  const dir = mkdtempSync(join(tmpdir(), "revitify-widened-"));
  writeFileSync(
    join(dir, "app.rb"),
    "# NOTE: legacy billing path\nmodule Billing\n  class Invoice\n    def total\n      compute_tax\n    end\n    def self.audit\n    end\n  end\nend\ndef compute_tax\nend\n",
  );
  writeFileSync(
    join(dir, "core.c"),
    "struct Packet { int size; };\nint checksum(int x) { return x; }\nint main(void) { return checksum(1); }\n",
  );
  writeFileSync(
    join(dir, "engine.cpp"),
    "namespace eng {\nclass Motor {\n public:\n  void spin();\n};\n}\nvoid boot() {}\n",
  );
  writeFileSync(
    join(dir, "Service.cs"),
    "public class Service {\n    private int count;\n    public Service(int c) { count = c; }\n    public void Run() { Helper(); }\n    public static void Helper() {}\n}\npublic record Audit(string Who);\npublic enum Mode { Fast, Slow }\n",
  );
  writeFileSync(
    join(dir, "deploy.sh"),
    "# HACK: retries hard-coded\nrelease() {\n  build_assets\n}\nbuild_assets() { true; }\nrelease\n",
  );
  writeFileSync(
    join(dir, "index.php"),
    "<?php\nclass Cart {\n    public function add() { tally(); }\n}\nfunction tally() {}\n",
  );
  writeFileSync(
    join(dir, "Main.scala"),
    "object Main {\n  def run(): Unit = helper()\n  def helper(): Unit = ()\n}\nclass Engine\ntrait Drive\n",
  );
  writeFileSync(
    join(dir, "App.kt"),
    "class Rocket {\n    fun launch() { ignite() }\n}\nfun ignite() {}\nobject Pad\n",
  );
  const graph = await buildGraphAsync(dir, { cache: false });
  const kindOf = new Map(graph.nodes.map((n) => [`${n.source_file}#${n.label}`, n.kind]));

  it("extracts the expected symbols per language", () => {
    expect(kindOf.get("app.rb#Billing")).toBe("module");
    expect(graph.nodes.find((n) => n.id === "sym:app.rb#Billing.Invoice.audit")?.kind).toBe(
      "method",
    ); // singleton_method
    expect(graph.nodes.find((n) => n.id === "sym:app.rb#Billing.Invoice")?.kind).toBe("class");
    expect(kindOf.get("core.c#checksum")).toBe("function"); // declarator-strategy name
    expect(kindOf.get("core.c#Packet")).toBe("struct");
    expect(kindOf.get("engine.cpp#Motor")).toBe("class");
    expect(kindOf.get("engine.cpp#eng")).toBe("module");
    expect(kindOf.get("Service.cs#count")).toBe("field"); // recursive nameChildType
    expect(graph.nodes.find((n) => n.id === "sym:Service.cs#Service.Service")?.kind).toBe(
      "constructor",
    );
    expect(kindOf.get("Service.cs#Audit")).toBe("record");
    expect(graph.nodes.find((n) => n.id === "sym:Service.cs#Mode.Fast")?.kind).toBe("const");
    expect(kindOf.get("deploy.sh#release")).toBe("function");
    expect(kindOf.get("index.php#Cart")).toBe("class");
    expect(kindOf.get("Main.scala#Drive")).toBe("trait");
    expect(kindOf.get("App.kt#Rocket")).toBe("class");
    expect(kindOf.get("App.kt#Pad")).toBe("object");
    expect(() => assertGraphContract(graph)).not.toThrow();
  });

  it("resolves calls and why-comments across the wave", () => {
    const calls = graph.links.filter((l) => l.relation === "calls");
    expect(calls.some((l) => String(l.target) === "sym:core.c#checksum")).toBe(true); // c
    expect(calls.some((l) => String(l.target) === "sym:deploy.sh#build_assets")).toBe(true); // bash
    expect(calls.some((l) => String(l.target) === "sym:index.php#tally")).toBe(true); // php
    const why = graph.nodes.filter((n) => n.kind === "why").map((n) => n.label);
    expect(why.some((l) => l.startsWith("NOTE: legacy billing"))).toBe(true);
    expect(why.some((l) => l.startsWith("HACK: retries"))).toBe(true);
  });

  it("sync facade still skips them gracefully (file nodes only, no tree-sitter)", async () => {
    const { buildGraph } = await import("../src/index.js");
    const sync = buildGraph(dir);
    expect(sync.nodes.some((n) => n.id === "file:app.rb")).toBe(true); // catch-all file node
    expect(sync.nodes.some((n) => n.label === "Invoice")).toBe(false); // no grammar in sync
  });
});

describe("widened edges", () => {
  it("unknown language throws; C++ operator overloads are skipped, not mangled", async () => {
    const { create } = await import("../src/extract/treesitter/widened.js");
    expect(() => create("cobol")).toThrow(/no widened config/);
    const dir = mkdtempSync(join(tmpdir(), "revitify-cpp-op-"));
    writeFileSync(
      join(dir, "ops.cpp"),
      "struct V { int x; };\nV operator+(V a, V b) { return a; }\nint plain() { return 1; }\nclass W { public: ~W() {} };\n",
    );
    const graph = await buildGraphAsync(dir, { cache: false });
    const labels = graph.nodes.filter((n) => n.id.startsWith("sym:")).map((n) => n.label);
    expect(labels).toContain("plain");
    expect(labels).toContain("V");
    expect(labels.every((l) => /^[A-Za-z_]\w*$/.test(l))).toBe(true); // no mangled declarators
    expect(labels).not.toContain("~W"); // destructor declarator rejected, not extracted
  });
});
