import type { FileRef, GraphFragment, SourceFile } from "../model/fragment.js";

export interface IngestContext {
  rootDir: string;
}

/**
 * One per-content-type ingestor (code, markdown — later: docs/PDF, images, AV, SQL, deps).
 * Each declares what it needs: `offline` ingestors always run; `key-gated`/`local-tool` ones
 * report availability via available() and are skipped (with a notice, never an error) when their
 * key/tool is absent. All offline ingestors also implement ingestSync — that is what the classic
 * synchronous `buildGraph()`/`revitify()` facade runs on.
 */
export interface Ingestor {
  readonly id: string;
  readonly mode: "offline" | "key-gated" | "local-tool";
  detect(file: FileRef): boolean;
  available(env: NodeJS.ProcessEnv): boolean;
  ingest(file: SourceFile, ctx: IngestContext): Promise<GraphFragment>;
  ingestSync?(file: SourceFile, ctx: IngestContext): GraphFragment;
}
