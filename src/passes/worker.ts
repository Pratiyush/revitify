import { readFileSync } from "node:fs";
import type { MessagePort } from "node:worker_threads";
import { defaultIngestors } from "../ingest/index.js";
import type { FileRef, GraphFragment } from "../model/fragment.js";

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
      const ingestor = defaultIngestors.find((i) => i.detect(ref));
      if (!ingestor?.available(process.env)) continue;
      let content: string;
      try {
        content = readFileSync(ref.path, "utf8");
      } catch {
        continue;
      }
      const fragment = await ingestor.ingest(
        { ...ref, content },
        { rootDir: input.rootDir, knownFiles },
      );
      fragments.push({ relPath: ref.relPath, fragment });
    }
    port.postMessage({ fragments } satisfies WorkerOutput);
  } catch (err) {
    port.postMessage({ fragments: [], error: String(err) } satisfies WorkerOutput);
  }
}
