import { addNode, createBuilder, fileNode } from "../extract/fragment-builder.js";
import { Confidence } from "../model/confidence.js";
import type { GraphFragment, SourceFile } from "../model/fragment.js";
import type { Ingestor } from "./ingestor.js";

const MD_HEADING = /^(#{1,2})\s+(.+)$/;

function ingestSync(file: SourceFile): GraphFragment {
  const b = createBuilder();
  const rel = file.relPath;
  const fileId = fileNode(b, rel);
  let inFence = false;
  file.content.split("\n").forEach((lineText, i) => {
    if (/^(```|~~~)/.test(lineText)) inFence = !inFence;
    if (inFence) return;
    const m = lineText.match(MD_HEADING);
    if (!m) return;
    const id = `doc:${rel}#${m[2]!.trim()}`;
    addNode(b, id, m[2]!.trim(), "doc", rel, i + 1);
    b.links.push({
      source: fileId,
      target: id,
      relation: "contains",
      confidence: Confidence.EXTRACTED,
    });
  });
  return { nodes: b.nodes, links: b.links };
}

/** Markdown: one doc node per top-level (h1/h2) heading outside code fences. */
export const markdownIngestor: Ingestor = {
  id: "markdown",
  mode: "offline",
  detect: (file) => file.relPath.endsWith(".md"),
  available: () => true,
  ingest: (file) => Promise.resolve(ingestSync(file)),
  ingestSync,
};
