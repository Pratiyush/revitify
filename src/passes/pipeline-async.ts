import { AstCache } from "../cache/ast.js";
import { gatedIngestorLoaders } from "../ingest/index.js";
import { walkFileRefs } from "../ingest/walk.js";
import type { FileRef, GraphFragment } from "../model/fragment.js";
import type { RevitifyGraph } from "../model/graph.js";
import { extractOne } from "./extract.js";
import { finalizeGraph } from "./finalize.js";
import { extractInWorkers } from "./worker-pool.js";

/**
 * The full-power async pipeline: lazy tree-sitter extractors, per-file fragment cache with
 * stat fastpath, worker-pool parallelism for large repos. Only the extraction stage differs from
 * the sync facade — both feed the shared finalizeGraph, so the byte-stable merge order is one
 * implementation, not two.
 */

export interface BuildOptions {
  /** Per-file fragment cache in <root>/.revitify/cache (default on). */
  cache?: boolean;
  /** Worker-pool extraction: false = off, number = file-count threshold (default 50). */
  parallel?: boolean | number;
  /** Mutated with cache hit/miss counts for observability and the gate test. */
  stats?: { cacheHits?: number; cacheMisses?: number };
}

export async function buildGraphFromRootAsync(
  rootDir: string,
  options: BuildOptions = {},
): Promise<RevitifyGraph> {
  const refs = walkFileRefs(rootDir);
  const knownFiles: ReadonlySet<string> = new Set(refs.map((r) => r.relPath));
  const cache = options.cache === false ? undefined : new AstCache(rootDir, knownFiles);

  const fragments = new Map<string, GraphFragment>();
  const pending: FileRef[] = [];
  for (const ref of refs) {
    const cached = cache?.statGet(ref);
    if (cached) fragments.set(ref.relPath, cached);
    else pending.push(ref);
  }

  const threshold = typeof options.parallel === "number" ? options.parallel : 50;
  const useWorkers =
    options.parallel !== false && pending.length >= threshold && import.meta.url.endsWith(".js");

  /* v8 ignore start -- worker-pool path runs only in compiled dist (import.meta.url ends ".js");
     proven against dist by lazy-boundary.test.ts's parallel-extraction test */
  if (useWorkers) {
    // Gated ingestors (key/tool-aware) run on the main thread; workers only see the rest, so
    // extractOne's gated branch stays inert inside a worker.
    const gatedPending = pending.filter((r) =>
      gatedIngestorLoaders.some((g) => g.matches(r.relPath)),
    );
    const workerPending = pending.filter(
      (r) => !gatedIngestorLoaders.some((g) => g.matches(r.relPath)),
    );
    await extractInWorkers(rootDir, workerPending, knownFiles, fragments, cache);
    for (const ref of gatedPending) {
      const fragment = await extractOne(rootDir, ref, knownFiles, cache);
      if (fragment) fragments.set(ref.relPath, fragment);
    }
    /* v8 ignore stop */
  } else {
    for (const ref of pending) {
      const fragment = await extractOne(rootDir, ref, knownFiles, cache);
      // extractOne yields a fragment for every walked file (fallback always nodes it) — guard is defensive
      /* v8 ignore next */
      if (fragment) fragments.set(ref.relPath, fragment);
    }
  }
  cache?.flush();
  if (options.stats) {
    options.stats.cacheHits = cache?.stats.hits ?? 0;
    options.stats.cacheMisses = cache?.stats.misses ?? 0;
  }

  return finalizeGraph(rootDir, refs, fragments);
}
