import { readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import type { AstCache } from "../cache/ast.js";
import type { FileRef, GraphFragment } from "../model/fragment.js";
import type { WorkerOutput } from "./worker.js";

/**
 * Worker-pool extraction (used by buildGraphAsync above the file-count threshold). Runs only
 * from compiled dist (eval workers import dist modules); under vitest the async pipeline stays
 * sequential, so this file is exercised by the dist integration test in lazy-boundary.test.ts
 * and excluded from v8 coverage, which cannot see spawned processes.
 */
/** Contiguous chunks across a small pool; results keyed by relPath, reassembled by the caller. */
export async function extractInWorkers(
  rootDir: string,
  pending: FileRef[],
  knownFiles: ReadonlySet<string>,
  fragments: Map<string, GraphFragment>,
  cache: AstCache | undefined,
): Promise<void> {
  const poolSize = Math.min(Math.max(availableParallelism() - 1, 1), 8);
  const chunkSize = Math.ceil(pending.length / poolSize);
  const chunks: FileRef[][] = [];
  for (let i = 0; i < pending.length; i += chunkSize) chunks.push(pending.slice(i, i + chunkSize));

  // Eval workers execute as ESM under modern Node — import, not require.
  const bootstrap = `
    import { parentPort, workerData } from "node:worker_threads";
    import(workerData.moduleHref)
      .then((m) => m.workerMain(workerData, parentPort))
      .catch((err) => parentPort.postMessage({ fragments: [], error: String(err) }));
  `;
  const moduleHref = new URL("./worker.js", import.meta.url).href;

  const results = await Promise.all(
    chunks.map(
      (files) =>
        new Promise<WorkerOutput>((resolve, reject) => {
          const worker = new Worker(bootstrap, {
            eval: true,
            workerData: { moduleHref, rootDir, files, knownFiles: [...knownFiles] },
          });
          worker.once("message", (msg: WorkerOutput) => {
            void worker.terminate();
            resolve(msg);
          });
          worker.once("error", reject);
        }),
    ),
  );
  const byRel = new Map(pending.map((r) => [r.relPath, r]));
  for (const result of results) {
    if (result.error) throw new Error(`worker extraction failed: ${result.error}`);
    for (const { relPath, fragment } of result.fragments) {
      fragments.set(relPath, fragment);
      const ref = byRel.get(relPath);
      if (ref && cache) {
        try {
          cache.put(ref, readFileSync(ref.path, "utf8"), fragment);
        } catch {
          // unreadable on re-read — skip caching, fragment still used
        }
      }
    }
  }
}
