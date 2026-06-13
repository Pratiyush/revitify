import type { MessagePort } from "node:worker_threads";
import type { FileRef, GraphFragment } from "../model/fragment.js";
import { extractOne } from "./extract.js";

/**
 * Worker-thread extraction body (parallel path of buildGraphAsync). Each worker owns its own
 * tree-sitter runtime; it receives a contiguous chunk of files and returns fragments keyed by
 * relPath — the main thread reassembles them in walk order so output stays byte-stable.
 * Exercised via the dist integration test (spawned process — out of v8 coverage's sight).
 */

export interface WorkerInput {
  rootDir: string;
  files: FileRef[];
  knownFiles: string[];
}

export interface WorkerOutput {
  fragments: Array<{ relPath: string; fragment: GraphFragment }>;
  error?: string;
}

export async function workerMain(input: WorkerInput, port: MessagePort): Promise<void> {
  try {
    const knownFiles: ReadonlySet<string> = new Set(input.knownFiles);
    const fragments: WorkerOutput["fragments"] = [];
    for (const ref of input.files) {
      // No cache in the worker — the pool caches on the main thread after reassembly, where the
      // AstCache lives. The same extractOne the sequential path uses, so behavior is identical.
      const fragment = await extractOne(input.rootDir, ref, knownFiles, undefined);
      if (fragment) fragments.push({ relPath: ref.relPath, fragment });
    }
    port.postMessage({ fragments } satisfies WorkerOutput);
  } catch (err) {
    port.postMessage({ fragments: [], error: String(err) } satisfies WorkerOutput);
  }
}
