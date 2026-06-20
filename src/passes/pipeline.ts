import { readFileSync } from "node:fs";
import { defaultIngestors } from "../ingest/index.js";
import { walkFileRefs } from "../ingest/walk.js";
import type { GraphFragment } from "../model/fragment.js";
import type { RevitifyGraph } from "../model/graph.js";
import { finalizeGraph } from "./finalize.js";

/**
 * The three-pass pipeline (synchronous facade path):
 *   1. extract — walk files, first matching offline ingestor contributes a fragment
 *   2. infer   — resolve name: references, drop dangling links  ┐ shared finalizeGraph
 *   3. cluster — assign communities                             ┘ (identical to the async path)
 * Uses ingestSync only — today's zero-heavy-dep capability, frozen for dev-spec-kit. buildGraphAsync
 * adds lazy/parallel/cached extraction over the same fragments → finalizeGraph shape.
 */
export function buildGraphFromRoot(rootDir: string): RevitifyGraph {
  const refs = walkFileRefs(rootDir);
  const knownFiles: ReadonlySet<string> = new Set(refs.map((r) => r.relPath));
  const fragments = new Map<string, GraphFragment>();
  for (const ref of refs) {
    const ingestor = defaultIngestors.find((i) => i.ingestSync && i.detect(ref));
    /* v8 ignore next -- the sync fallback ingestor matches & is available for every file */
    if (!ingestor?.available(process.env)) continue;
    let content: string;
    try {
      content = readFileSync(ref.path, "utf8");
    } catch {
      /* v8 ignore next -- TOCTOU: the walker yields readable files; this catch never fires */
      continue; // unreadable/binary — never fatal
    }
    fragments.set(ref.relPath, ingestor.ingestSync!({ ...ref, content }, { rootDir, knownFiles }));
  }
  return finalizeGraph(rootDir, refs, fragments);
}
