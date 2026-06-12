import { defaultExtractors } from "../extract/index.js";
import { createCodeIngestor } from "./code.js";
import type { Ingestor } from "./ingestor.js";
import { markdownIngestor } from "./markdown.js";

/** Ordered: code first (mirrors the original dispatch), markdown last. All offline today. */
export const defaultIngestors: readonly Ingestor[] = [
  createCodeIngestor(defaultExtractors),
  markdownIngestor,
];
