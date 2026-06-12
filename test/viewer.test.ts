import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { graphLiteExporter, renderLiteHtml } from "../src/export/graph-lite.js";
import { renderHtml } from "../src/export/html.js";
import { buildGraph, buildGraphAsync } from "../src/index.js";

/** The redesigned viewer (docs/design/graph-viewer-handoff.md) + the kept lite viewer. */

function project(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-viewer-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(
    join(dir, "src", "core.ts"),
    "export function engine(): void {}\nexport function helper(): void { engine(); }",
  );
  return dir;
}

describe("redesigned graph.html", () => {
  const graph = buildGraph(project());
  const html = renderHtml(graph);

  it("is fully offline: four libraries inlined, zero external sources", () => {
    expect(html).not.toMatch(/src="https?:/);
    for (const marker of [
      "cytoscape (MIT)",
      "layout-base (MIT)",
      "cose-base (MIT)",
      "cytoscape-fcose (MIT)",
    ]) {
      expect(html).toContain(`/* ${marker} — inlined for offline */`);
    }
    expect(html.length).toBeGreaterThan(700_000); // the libs are really in there
  });

  it("injects the graph at the DATA INJECTION POINT and keeps contract probes", () => {
    expect(html).toContain("window.__GRAPHIFY_DATA__ = {");
    expect(html).toContain("sym:src/core.ts#engine");
    expect(html).not.toContain("window.__GRAPHIFY_DATA__ || null"); // placeholder replaced
    expect(html).toContain("<canvas"); // minimap
    expect(html).toMatch(/input[^>]*search/i);
    expect(html).toContain("cytoscape.use(window.cytoscapeFcose)");
  });

  it("escapes </script> sequences in data", () => {
    const dir = project();
    writeFileSync(
      join(dir, "src", "sneaky.ts"),
      "export const x = 1; // </script><script>alert(1)</script>",
    );
    const sneaky = renderHtml(buildGraph(dir));
    const dataLine = sneaky.split("window.__GRAPHIFY_DATA__ = ")[1] ?? "";
    expect(dataLine.slice(0, 200)).not.toContain("</script>");
  });
});

describe("graph-lite.html (the kept original)", () => {
  it("still renders the zero-dependency canvas viewer via extraExporters", () => {
    const graph = buildGraph(project());
    const lite = renderLiteHtml(graph);
    expect(graphLiteExporter.filename).toBe("graph-lite.html");
    expect(lite).toContain("<canvas");
    expect(lite).not.toMatch(/src="https?:/);
    expect(lite.length).toBeLessThan(60_000); // genuinely lite
  });
});

describe("summary field", () => {
  it("docstrings surface as summary on their symbol (and stay as nodes)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-summary-"));
    writeFileSync(
      join(dir, "jobs.py"),
      'class Runner:\n    """Coordinates the worker pool."""\n    def run(self):\n        pass\n',
    );
    const graph = await buildGraphAsync(dir, { cache: false });
    const runner = graph.nodes.find((n) => n.id === "sym:jobs.py#Runner");
    expect(runner?.summary).toBe("Coordinates the worker pool.");
    expect(graph.nodes.some((n) => n.kind === "docstring")).toBe(true);
  });
});

describe("viewer edge branches", () => {
  it("renders a graph without built_at_commit (no stamp in data)", () => {
    const html = renderHtml({ nodes: [{ id: "x", label: "x", source_file: "x.ts" }], links: [] });
    expect(html).toContain('window.__GRAPHIFY_DATA__ = {"nodes"');
    const dataLine = /window\.__GRAPHIFY_DATA__ = ({.*?});<\/script>/.exec(html)?.[1] ?? "";
    expect(dataLine).not.toContain("built_at_commit"); // the stamp is omitted, not nulled
  });

  it("summary never overwrites an existing one (first docstring wins)", async () => {
    const { attachSummaries } = await import("../src/passes/summarize.js");
    const nodes = [
      { id: "s", label: "s", source_file: "f.py", summary: "kept" },
      { id: "d", label: "newer", kind: "docstring", source_file: "f.py" },
    ];
    attachSummaries(nodes, [{ source: "s", target: "d", relation: "documents" }]);
    expect(nodes[0]?.summary).toBe("kept");
  });
});
