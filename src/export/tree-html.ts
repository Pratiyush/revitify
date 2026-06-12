import type { RevitifyGraph, RevitifyNode } from "../model/graph.js";
import type { Exporter } from "./exporter.js";

/**
 * tree.html (port of graphify tree_html.py): collapsible directory tree — directories nest as
 * <details>, files list their symbols. Self-contained, zero scripts.
 */
interface Dir {
  dirs: Map<string, Dir>;
  files: Map<string, RevitifyNode[]>;
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const treeExporter: Exporter = {
  id: "tree-html",
  filename: "tree.html",
  render(graph: RevitifyGraph): string {
    const root: Dir = { dirs: new Map(), files: new Map() };
    for (const n of graph.nodes) {
      if (n.kind === "file") continue;
      const parts = n.source_file.split("/");
      const file = parts.pop() as string;
      let dir = root;
      for (const part of parts) {
        let next = dir.dirs.get(part);
        if (!next) {
          next = { dirs: new Map(), files: new Map() };
          dir.dirs.set(part, next);
        }
        dir = next;
      }
      const arr = dir.files.get(file);
      if (arr) arr.push(n);
      else dir.files.set(file, [n]);
    }
    const renderDir = (dir: Dir, name: string): string => {
      const children = [
        ...[...dir.dirs.entries()].sort().map(([n, d]) => renderDir(d, n)),
        ...[...dir.files.entries()]
          .sort()
          .map(
            ([file, symbols]) =>
              `<details><summary>📄 ${esc(file)} <em>(${symbols.length})</em></summary><ul>${symbols
                .map((s) => `<li><code>${esc(s.kind ?? "node")}</code> ${esc(s.label)}</li>`)
                .join("")}</ul></details>`,
          ),
      ].join("");
      return name
        ? `<details open><summary>📁 ${esc(name)}</summary><div class="indent">${children}</div></details>`
        : children;
    };
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Revitify — tree</title>
<style>body{font:14px/1.6 -apple-system,sans-serif;background:#0d1117;color:#c9d1d9;padding:16px}
.indent{margin-left:18px}summary{cursor:pointer}code{color:#79c0ff}em{opacity:.6}ul{margin:2px 0 6px 22px}</style>
</head><body><h1>revitify tree — ${graph.nodes.length} nodes</h1>${renderDir(root, "")}</body></html>
`;
  },
};
