import { addNode, createBuilder, fileNode } from "../../extract/fragment-builder.js";
import { Confidence } from "../../model/confidence.js";
import type { GraphFragment, SourceFile } from "../../model/fragment.js";
import type { Ingestor } from "../ingestor.js";
import { detectBackend } from "./backends.js";

/**
 * Semantic doc ingestion (PDF/images) via the detected LLM backend — key-gated: without a key
 * the ingestor reports unavailable and the pipeline skips it with a notice; the code graph is
 * byte-identical to an offline run. Concepts arrive as `concept` nodes linked to the file.
 */
const DOC_EXT = /\.(pdf|png|jpe?g|gif|webp)$/i;

export const llmDocsIngestor: Ingestor = {
  id: "llm-docs",
  mode: "key-gated",
  detect: (file) => DOC_EXT.test(file.relPath),
  available: (env) => detectBackend(env) !== undefined,
  async ingest(file: SourceFile): Promise<GraphFragment> {
    const backend = detectBackend(process.env);
    if (!backend) return { nodes: [], links: [] };
    const b = createBuilder();
    const rel = file.relPath;
    const fileId = fileNode(b, rel);
    // Mostly-printable content (plain-text docs) rides along; binary (PDF/image bytes read as
    // utf8 garbage) stays path-context-only until real binary extraction lands.
    const sample = file.content.slice(0, 4000);
    const printable = sample.length > 0 && /^[\x09\x0a\x0d\x20-\x7e\u00a0-\uffff]*$/.test(sample);
    const raw = await backend.complete(
      printable && sample.trim().length > 40
        ? `List up to 8 key concepts in this document ("${rel}") as a JSON array of short strings. Answer with JSON only.\n\n${sample}`
        : `List up to 8 key concepts in the document at path "${rel}" as a JSON array of short strings. Answer with JSON only.`,
    );
    for (const concept of parseConcepts(raw)) {
      const id = `concept:${rel}#${concept}`;
      addNode(b, id, concept, "concept", rel);
      b.links.push({
        source: fileId,
        target: id,
        relation: "contains",
        confidence: Confidence.INFERRED,
      });
    }
    return { nodes: b.nodes, links: b.links };
  },
};

/** Tolerant JSON-array extraction from an LLM reply (fences, prose, partial). */
export function parseConcepts(raw: string): string[] {
  const match = raw.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 8);
  } catch {
    return [];
  }
}
