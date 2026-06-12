import type { RevitifyGraph } from "../model/graph.js";
import type { Exporter } from "./exporter.js";
import { renderHtml } from "./html.js";

/**
 * callflow.html (port of graphify callflow_html.py): the interactive viewer scoped to the
 * call graph — callable symbols and their `calls` edges only.
 */
export const callflowExporter: Exporter = {
  id: "callflow-html",
  filename: "callflow.html",
  render(graph: RevitifyGraph): string {
    const links = graph.links.filter((l) => l.relation === "calls");
    const keep = new Set(links.flatMap((l) => [String(l.source), String(l.target)]));
    const nodes = graph.nodes.filter((n) => keep.has(n.id));
    return renderHtml({
      nodes,
      links,
      ...(graph.built_at_commit ? { built_at_commit: graph.built_at_commit } : {}),
    });
  },
};
