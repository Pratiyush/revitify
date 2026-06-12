import type { RevitifyGraph } from "../model/graph.js";

export interface ExportContext {
  rootDir: string;
  /** Absolute output directory the artifacts are written into. */
  outDir: string;
}

/**
 * One output artifact renderer. The three contract exporters (json/html/report) always run;
 * Phase 5 adds callflow-html, tree-html, wiki, and mermaid as more registrations, CLI-selectable.
 */
export interface Exporter {
  readonly id: string;
  readonly filename: string;
  render(graph: RevitifyGraph, ctx: ExportContext): string;
}
