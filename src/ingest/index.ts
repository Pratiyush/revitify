import { defaultExtractors } from "../extract/index.js";
import { createCodeIngestor } from "./code.js";
import type { Ingestor } from "./ingestor.js";
import { markdownIngestor } from "./markdown.js";
import { cargoIngestor } from "./tools/cargo.js";
import { sqlIngestor } from "./tools/sql.js";

/**
 * Ordered ingestors. Offline ones (code, markdown, sql, cargo) run everywhere — they all
 * implement ingestSync, so the classic sync facade sees them too. Key-gated and local-tool
 * ingestors (LLM docs, whisper, scip) are ASYNC-ONLY and lazy: the async pipeline loads them
 * on demand, checks available(env), and skips with a notice when the key/tool is absent —
 * the code graph stays byte-identical to a fully offline run.
 */
export const defaultIngestors: readonly Ingestor[] = [
  createCodeIngestor(defaultExtractors),
  markdownIngestor,
  sqlIngestor,
  cargoIngestor,
];

/** Lazy gated registrations: [extension test, loader]. Used only by the async pipeline. */
export const gatedIngestorLoaders: ReadonlyArray<{
  id: string;
  matches(relPath: string): boolean;
  load(): Promise<Ingestor>;
}> = [
  {
    id: "llm-docs",
    matches: (rel) => /\.(pdf|png|jpe?g|gif|webp)$/i.test(rel),
    load: () => import("./llm/docs.js").then((m) => m.llmDocsIngestor),
  },
  {
    id: "whisper",
    matches: (rel) => /\.(mp3|wav|m4a|flac|ogg|mp4|mov|mkv|webm)$/i.test(rel),
    load: () => import("./tools/local.js").then((m) => m.whisperIngestor),
  },
  {
    id: "scip",
    matches: (rel) => rel.endsWith("index.scip"),
    load: () => import("./tools/local.js").then((m) => m.scipIngestor),
  },
];
