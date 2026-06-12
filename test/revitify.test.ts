import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildGraph, revitify } from "../src/index.js";

/** Package-local suite: ingestion + the graphify output contract. The consumer-side integration
 *  (Rivet's loadCodeGraph ingesting this output) lives in the rivet repo: test/revitify-contract. */

function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-"));
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "auth.ts"),
    [
      `import { hash } from "./crypto.js";`,
      `export interface Session { id: string }`,
      `export class AuthService {`,
      `  login(user: string): Session { return { id: hash(user) }; }`,
      `}`,
      `export function logout(): void {}`,
    ].join("\n"),
  );
  writeFileSync(join(dir, "src", "crypto.ts"), "export function hash(s: string): string {\n  return s;\n}");
  mkdirSync(join(dir, "py"), { recursive: true });
  writeFileSync(join(dir, "py", "indicators.py"), "class Sma:\n    pass\n\ndef compute(values):\n    return 1\n");
  writeFileSync(join(dir, "README.md"), "# Fixture App\n\n## Architecture\n\nNotes.\n");
  mkdirSync(join(dir, "node_modules", "junk"), { recursive: true });
  writeFileSync(join(dir, "node_modules", "junk", "x.ts"), "export const nope = 1;");
  return dir;
}

describe("ingestion", () => {
  const graph = buildGraph(fixture());
  const labels = graph.nodes.map((n) => n.label);

  it("extracts TS symbols, Python defs, markdown headings, file nodes — and skips node_modules", () => {
    for (const expected of ["AuthService", "Session", "logout", "hash", "login", "Sma", "compute", "Fixture App"]) {
      expect(labels, `missing '${expected}'`).toContain(expected);
    }
    expect(labels).not.toContain("nope");
  });

  it("builds containment, import, and reference edges with source_file + community on nodes", () => {
    const rel = (r: string) => graph.links.filter((l) => l.relation === r);
    expect(rel("contains").length).toBeGreaterThan(4);
    expect(rel("imports").some((l) => String(l.target).includes("crypto.ts"))).toBe(true);
    expect(rel("references").some((l) => String(l.target).includes("hash"))).toBe(true);
    const auth = graph.nodes.find((n) => n.label === "AuthService")!;
    expect(auth.source_file).toBe("src/auth.ts");
    expect(typeof auth.community).toBe("number");
  });
});

describe("the graphify output contract", () => {
  const dir = fixture();
  revitify(dir);

  it("emits graph.json + self-contained graph.html + GRAPH_REPORT.md", () => {
    for (const f of ["graph.json", "graph.html", "GRAPH_REPORT.md"]) {
      expect(existsSync(join(dir, "graphify-out", f)), `${f} missing`).toBe(true);
    }
    const html = readFileSync(join(dir, "graphify-out", "graph.html"), "utf8");
    expect(html).toContain("<canvas");
    expect(html).toMatch(/input[^>]*search/i);
    expect(html).not.toMatch(/src="https?:/);
    const report = readFileSync(join(dir, "graphify-out", "GRAPH_REPORT.md"), "utf8");
    expect(report).toMatch(/\d+ nodes/);
    expect(report).toMatch(/suggested questions/i);
  });
});
