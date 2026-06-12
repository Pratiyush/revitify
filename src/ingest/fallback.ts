import { createBuilder, fileNode } from "../extract/fragment-builder.js";
import type { GraphFragment, SourceFile } from "../model/fragment.js";
import type { Ingestor } from "./ingestor.js";

/**
 * Catch-all file ingestor (parity with graphify, which nodes every walked file): any file no
 * richer ingestor claims still becomes a `file` node — json/yaml/sh/toml configs are real parts
 * of a codebase's shape. Registered LAST; contributes structure only, never content.
 */
function ingestSync(file: SourceFile): GraphFragment {
  const b = createBuilder();
  fileNode(b, file.relPath);
  return { nodes: b.nodes, links: b.links };
}

export const fallbackFileIngestor: Ingestor = {
  id: "file",
  mode: "offline",
  detect: () => true,
  available: () => true,
  ingest: (file) => Promise.resolve(ingestSync(file)),
  ingestSync,
};
