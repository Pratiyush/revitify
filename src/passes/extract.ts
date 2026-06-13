import { readFileSync } from "node:fs";
import type { AstCache } from "../cache/ast.js";
import { defaultIngestors, gatedIngestorLoaders } from "../ingest/index.js";
import type { FileRef, GraphFragment } from "../model/fragment.js";

/**
 * Shared per-file extraction for the async pipelines (sequential + worker). Gated content types
 * (docs/AV/scip) outrank the catch-all file ingestor — but only when their key/tool is present;
 * otherwise they degrade to a bare file node (structure, no content, no network) with one notice
 * per kind. The fragment cache is optional: workers pass `undefined` (the pool caches on the main
 * thread after reassembly, where the cache lives). Kept free of the finalize tail (cluster/dedup)
 * so the worker bundle stays lean — workers only ever call this.
 */
const skipNotices = new Set<string>();

export async function extractOne(
  rootDir: string,
  ref: FileRef,
  knownFiles: ReadonlySet<string>,
  cache: AstCache | undefined,
): Promise<GraphFragment | undefined> {
  let ingestor: (typeof defaultIngestors)[number] | undefined;
  const gated = gatedIngestorLoaders.find((g) => g.matches(ref.relPath));
  if (gated) {
    const candidate = await gated.load();
    if (candidate.available(process.env)) ingestor = candidate;
    else if (!skipNotices.has(gated.id)) {
      skipNotices.add(gated.id);
      console.error(
        `revitify: skipping ${gated.id} ingestion (no key/tool) — file node only, code graph unaffected`,
      );
    }
  }
  ingestor ??= defaultIngestors.find((i) => i.detect(ref));
  if (!ingestor?.available(process.env)) return undefined;
  let content: string;
  try {
    content = readFileSync(ref.path, "utf8");
  } catch {
    return undefined;
  }
  const cached = cache?.contentGet(ref, content);
  if (cached) return cached;
  const fragment = await ingestor.ingest({ ...ref, content }, { rootDir, knownFiles });
  cache?.put(ref, content, fragment);
  return fragment;
}
