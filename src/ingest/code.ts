import type { Extractor } from "../extract/extractor.js";
import type { Registry } from "../extract/registry.js";
import type { GraphFragment, SourceFile } from "../model/fragment.js";
import type { IngestContext, Ingestor } from "./ingestor.js";

const EMPTY: GraphFragment = { nodes: [], links: [] };

/** Code ingestion = whatever language the extractor registry recognizes. Always offline. */
export function createCodeIngestor(extractors: Registry<Extractor>): Ingestor {
  const ingestSync = (file: SourceFile, ctx: IngestContext): GraphFragment => {
    const reg = extractors.match(file);
    const extractor = reg ? extractors.resolveSync(reg) : undefined;
    return extractor
      ? extractor.extract(file, { rootDir: ctx.rootDir, knownFiles: ctx.knownFiles })
      : EMPTY;
  };
  return {
    id: "code",
    mode: "offline",
    detect: (file) => extractors.match(file) !== undefined,
    available: () => true,
    ingest: (file, ctx) => Promise.resolve(ingestSync(file, ctx)),
    ingestSync,
  };
}
