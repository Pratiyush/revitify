import { godNodes } from "../enrich/god-nodes.js";
import type { Exporter } from "./exporter.js";

/** graph.mmd: mermaid flowchart of the top symbols (capped — mermaid chokes on full graphs). */
const MAX_NODES = 40;

export const mermaidExporter: Exporter = {
  id: "mermaid",
  filename: "graph.mmd",
  render(graph): string {
    const keep = new Set(godNodes(graph, MAX_NODES).map((g) => g.node.id));
    const alias = new Map<string, string>();
    let i = 0;
    const lines = ["graph LR"];
    for (const n of graph.nodes) {
      if (!keep.has(n.id)) continue;
      const a = `n${i++}`;
      alias.set(n.id, a);
      lines.push(`  ${a}["${n.label.replace(/"/g, "'")}"]`);
    }
    for (const l of graph.links) {
      const s = alias.get(String(l.source));
      const t = alias.get(String(l.target));
      if (s && t) lines.push(`  ${s} -->|${l.relation ?? ""}| ${t}`);
    }
    return `${lines.join("\n")}\n`;
  },
};
