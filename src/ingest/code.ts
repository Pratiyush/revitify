import type { Extractor } from "../extract/extractor.js";
import { createBuilder, fileNode } from "../extract/fragment-builder.js";
import type { Registry } from "../extract/registry.js";
import type { GraphFragment, SourceFile } from "../model/fragment.js";
import type { IngestContext, Ingestor } from "./ingestor.js";

/** No usable extractor (sync path on a lazy-only grammar, or every load failed): the file still
 *  exists — a bare file node keeps universal coverage intact. */
const fileOnly = (file: SourceFile): GraphFragment => {
  const b = createBuilder();
  fileNode(b, file.relPath);
  return { nodes: b.nodes, links: b.links };
};

/**
 * Code ingestion = whatever language the extractor registry recognizes. Always offline.
 * Sync walks the fallback chain with resolveSync (tree-sitter entries skip themselves);
 * async tries each candidate and falls through on load failure (missing optional grammar).
 */
export function createCodeIngestor(extractors: Registry<Extractor>): Ingestor {
  const ingestSync = (file: SourceFile, ctx: IngestContext): GraphFragment => {
    for (const reg of extractors.matchAll(file)) {
      const extractor = extractors.resolveSync(reg);
      if (extractor) {
        return extractor.extract(file, { rootDir: ctx.rootDir, knownFiles: ctx.knownFiles });
      }
    }
    return fileOnly(file);
  };
  const ingest = async (file: SourceFile, ctx: IngestContext): Promise<GraphFragment> => {
    for (const reg of extractors.matchAll(file)) {
      let extractor: Extractor;
      try {
        extractor = await extractors.resolve(reg);
      } catch {
        continue; // optional grammar unavailable — fall back to the next candidate
      }
      return extractor.extract(file, { rootDir: ctx.rootDir, knownFiles: ctx.knownFiles });
    }
    return fileOnly(file);
  };
  return {
    id: "code",
    mode: "offline",
    detect: (file) => extractors.match(file) !== undefined,
    available: () => true,
    ingest,
    ingestSync,
  };
}
