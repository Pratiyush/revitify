import { Confidence } from "../model/confidence.js";
import type { GraphFragment, SourceFile } from "../model/fragment.js";
import { symId } from "../model/ids.js";
import { addNode, createBuilder, fileNode } from "./fragment-builder.js";

/** Shared line-grammar extraction: one symbol node per matching line, contained by the file. */
export function extractByLine(file: SourceFile, re: RegExp, kind: string): GraphFragment {
  const b = createBuilder();
  const rel = file.relPath;
  const fileId = fileNode(b, rel);
  file.content.split("\n").forEach((lineText, i) => {
    const m = lineText.match(re);
    if (!m) return;
    const id = symId(rel, m[1]!);
    addNode(b, id, m[1]!, kind, rel, i + 1);
    b.links.push({
      source: fileId,
      target: id,
      relation: "contains",
      confidence: Confidence.EXTRACTED,
    });
  });
  return { nodes: b.nodes, links: b.links };
}
