import { godNodes } from "../enrich/god-nodes.js";
import type { RevitifyGraph } from "../model/graph.js";
import type { Exporter } from "./exporter.js";

/** WIKI.md (port of graphify wiki.py): one section per community — its files and symbols. */
export const wikiExporter: Exporter = {
  id: "wiki",
  filename: "WIKI.md",
  render(graph: RevitifyGraph): string {
    const byCommunity = new Map<number, typeof graph.nodes>();
    for (const n of graph.nodes) {
      const c = n.community ?? -1;
      const arr = byCommunity.get(c);
      if (arr) arr.push(n);
      else byCommunity.set(c, [n]);
    }
    const gods = new Set(godNodes(graph, 10).map((g) => g.node.id));
    const lines = [
      "# Revitify wiki",
      "",
      `${graph.nodes.length} nodes across ${byCommunity.size} communities.`,
      "",
    ];
    for (const [community, members] of [...byCommunity.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    )) {
      const files = [...new Set(members.map((m) => m.source_file))].sort();
      lines.push(
        `## Community ${community} (${members.length} nodes)`,
        "",
        `Files: ${files.map((f) => `\`${f}\``).join(", ")}`,
        "",
      );
      const symbols = members.filter((m) => m.kind !== "file" && m.kind !== "doc");
      for (const s of symbols.slice(0, 20)) {
        lines.push(
          `- ${gods.has(s.id) ? "⭐ " : ""}**${s.label}** (${s.kind}) — \`${s.source_location ?? s.source_file}\``,
        );
      }
      if (symbols.length > 20) lines.push(`- … ${symbols.length - 20} more`);
      lines.push("");
    }
    return lines.join("\n");
  },
};
