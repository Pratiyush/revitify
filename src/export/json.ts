import type { Exporter } from "./exporter.js";

/** graph.json — the contract artifact dev-spec-kit reads. Exact bytes: 2-space JSON + trailing newline. */
export const jsonExporter: Exporter = {
  id: "json",
  filename: "graph.json",
  render: (graph) => `${JSON.stringify(graph, null, 2)}\n`,
};
