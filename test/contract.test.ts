import { cpSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { RevitifyGraph, RevitifyNode } from "../src/index.js";
import { revitify } from "../src/index.js";
import { assertGraphContract } from "../src/model/contract.js";

/**
 * The LOUD output-contract test. Three locks:
 *  1. byte-identity against the committed expected-graph.json (the refactor pin — proves a pure
 *     move changed nothing),
 *  2. exact key sets on a canonical node and link (a rename/removal fails naming the field),
 *  3. assertGraphContract on the whole graph + a negative case proving drift fails loudly.
 * The type-level lock against Rivet's reader lives in contract.test-d.ts.
 */

const FIXTURE = fileURLToPath(new URL("./fixtures/contract/", import.meta.url));

function run(): { raw: string; graph: RevitifyGraph } {
  const dir = mkdtempSync(join(tmpdir(), "revitify-contract-"));
  cpSync(FIXTURE, dir, {
    recursive: true,
    filter: (source) => !source.endsWith("expected-graph.json"),
  });
  revitify(dir);
  const raw = readFileSync(join(dir, "revitify-out", "graph.json"), "utf8");
  return { raw, graph: JSON.parse(raw) as RevitifyGraph };
}

describe("output contract", () => {
  const { raw, graph } = run();
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  it("graph.json is byte-identical to the committed expectation (refactor pin)", () => {
    // The fixture copy is not a git repo, so no built_at_commit on either side.
    expect(raw).toBe(readFileSync(join(FIXTURE, "expected-graph.json"), "utf8"));
  });

  it("a canonical symbol node carries exactly the contract fields", () => {
    const auth = byId.get("sym:src/auth.ts#AuthService") as RevitifyNode;
    expect(Object.keys(auth).sort()).toEqual([
      "community",
      "id",
      "kind",
      "label",
      "name",
      "source_file",
      "source_location",
    ]);
    expect(auth).toMatchInlineSnapshot(`
      {
        "community": 3,
        "id": "sym:src/auth.ts#AuthService",
        "kind": "class",
        "label": "AuthService",
        "name": "AuthService",
        "source_file": "src/auth.ts",
        "source_location": "src/auth.ts:5",
      }
    `);
  });

  it("a canonical link carries exactly the contract fields", () => {
    const imports = graph.links.find((l) => l.relation === "imports");
    expect(imports, "no imports link found").toBeDefined();
    expect(Object.keys(imports as object).sort()).toEqual([
      "confidence",
      "relation",
      "source",
      "target",
    ]);
    expect(imports?.confidence).toBe("EXTRACTED");
    const importsFrom = graph.links.find((l) => l.relation === "imports_from");
    expect(importsFrom?.confidence).toBe("INFERRED");
  });

  it("the whole graph passes the runtime contract validator", () => {
    expect(() => assertGraphContract(graph)).not.toThrow();
  });

  it("contract drift fails loudly, naming index and field (negative floor)", () => {
    const broken = JSON.parse(raw) as { nodes: Record<string, unknown>[] };
    delete broken.nodes[2]?.source_file;
    expect(() => assertGraphContract(broken)).toThrowError(
      /nodes\[2\]\.source_file is missing or not a string/,
    );
  });
});
