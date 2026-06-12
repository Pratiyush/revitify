import { readFileSync } from "node:fs";
import { AstCache } from "../cache/ast.js";
import { defaultIngestors } from "../ingest/index.js";
import { walkFileRefs } from "../ingest/walk.js";
import type { FileRef, GraphFragment } from "../model/fragment.js";
import type { RevitifyGraph, RevitifyLink, RevitifyNode } from "../model/graph.js";
import { assignCommunities } from "./cluster.js";
import { gitHead } from "./git.js";
import { resolveReferences } from "./resolve.js";
import { extractInWorkers } from "./worker-pool.js";

/**
 * The full-power async pipeline: lazy tree-sitter extractors, per-file fragment cache with
 * stat fastpath, worker-pool parallelism for large repos. Same three passes and the same
 * byte-stable merge order as the sync facade — only the extraction stage differs.
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

  if (useWorkers) {
    await extractInWorkers(rootDir, pending, knownFiles, fragments, cache);
  } else {
    for (const ref of pending) {
      const fragment = await extractOne(rootDir, ref, knownFiles, cache);
      if (fragment) fragments.set(ref.relPath, fragment);
    }
  }
  cache?.flush();
  if (options.stats) {
    options.stats.cacheHits = cache?.stats.hits ?? 0;
    options.stats.cacheMisses = cache?.stats.misses ?? 0;
  }

  // Merge in walk order — identical ordering semantics to the sync pipeline.
  const nodes = new Map<string, RevitifyNode>();
  const links: RevitifyLink[] = [];
  for (const ref of refs) {
    const fragment = fragments.get(ref.relPath);
    if (!fragment) continue;
    for (const node of fragment.nodes) {
      if (!nodes.has(node.id)) nodes.set(node.id, node);
    }
    links.push(...fragment.links);
  }
  assignCommunities(nodes.values());
  const resolved = resolveReferences(nodes, links);
  const head = gitHead(rootDir);
  return {
    nodes: [...nodes.values()],
    links: resolved,
    ...(head ? { built_at_commit: head } : {}),
  };
}

async function extractOne(
  rootDir: string,
  ref: FileRef,
  knownFiles: ReadonlySet<string>,
  cache: AstCache | undefined,
): Promise<GraphFragment | undefined> {
  const ingestor = defaultIngestors.find((i) => i.detect(ref));
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
