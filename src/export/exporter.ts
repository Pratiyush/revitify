import type { RevitifyGraph } from "../model/graph.js";

/**
 * One output artifact renderer — a pure `graph → string`. The three contract exporters
 * (json/html/report) always run; callflow-html, tree-html, wiki, and mermaid are opt-in extras,
 * CLI-selectable via `revitify export`. The caller decides where the string is written.
 */
export interface Exporter {
  readonly id: string;
  readonly filename: string;
  render(graph: RevitifyGraph): string;
}
