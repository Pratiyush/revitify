import { addNode, createBuilder, fileNode } from "../extract/fragment-builder.js";
import { Confidence } from "../model/confidence.js";
import type { GraphFragment, SourceFile } from "../model/fragment.js";
import type { Ingestor } from "./ingestor.js";

/**
 * JSON ingestion (graphify nodes top-level json keys — package.json scripts, tsconfig options
 * and friends are part of a codebase's shape). Top-level keys only, capped: structure, not data.
 */
const MAX_KEYS = 30;

function ingestSync(file: SourceFile): GraphFragment {
  const b = createBuilder();
  const rel = file.relPath;
  const fileId = fileNode(b, rel);
  try {
    const parsed: unknown = JSON.parse(file.content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const key of Object.keys(parsed).slice(0, MAX_KEYS)) {
        const id = `jsonkey:${rel}#${key}`;
        addNode(b, id, key, "json-key", rel);
        b.links.push({
          source: fileId,
          target: id,
          relation: "contains",
          confidence: Confidence.EXTRACTED,
        });
      }
    }
  } catch {
    // invalid json — bare file node is still honest structure
  }
  return { nodes: b.nodes, links: b.links };
}

export const jsonIngestor: Ingestor = {
  id: "json",
  mode: "offline",
  detect: (file) => file.relPath.endsWith(".json"),
  available: () => true,
  ingest: (file) => Promise.resolve(ingestSync(file)),
  ingestSync,
};
