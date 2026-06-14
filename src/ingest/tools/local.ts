import { spawnSync } from "node:child_process";
import { addNode, createBuilder, fileNode } from "../../extract/fragment-builder.js";
import { Confidence } from "../../model/confidence.js";
import type { GraphFragment, SourceFile } from "../../model/fragment.js";
import { scipId, transcriptId } from "../../model/ids.js";
import type { Ingestor } from "../ingestor.js";

/**
 * Local-tool ingestors (graphify transcribe.py + scip_ingest.py): gated on a binary being on
 * PATH — absent tool means honest unavailability and a pipeline skip-with-notice, never a hard
 * dependency. Transcript/SCIP parsing is the stable part; the spawn is the thin shell.
 */
const onPath = (bin: string): boolean =>
  spawnSync("which", [bin], { stdio: "ignore" }).status === 0;

const AV_EXT = /\.(mp3|wav|m4a|flac|ogg|mp4|mov|mkv|webm)$/i;

export const whisperIngestor: Ingestor = {
  id: "whisper",
  mode: "local-tool",
  detect: (file) => AV_EXT.test(file.relPath),
  available: (env) => Boolean(env.WHISPER_CPP) || onPath("whisper-cli") || onPath("whisper-cpp"),
  async ingest(file: SourceFile): Promise<GraphFragment> {
    /* v8 ignore next -- whisper binary-name selection is PATH/env-specific; the whisper-cpp fallback isn't pinned */
    const bin = process.env.WHISPER_CPP ?? (onPath("whisper-cli") ? "whisper-cli" : "whisper-cpp");
    const res = spawnSync(bin, ["-f", file.path, "--no-timestamps"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    if (res.status !== 0) return { nodes: [], links: [] };
    return transcriptFragment(file.relPath, res.stdout);
  },
};

/** Transcript → one transcript node per non-empty line group (the testable half). */
export function transcriptFragment(rel: string, transcript: string): GraphFragment {
  const b = createBuilder();
  const fileId = fileNode(b, rel);
  const segments = transcript
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 50);
  segments.forEach((segment, i) => {
    const id = transcriptId(rel, i);
    addNode(b, id, segment.slice(0, 160), "transcript", rel);
    b.links.push({
      source: fileId,
      target: id,
      relation: "contains",
      confidence: Confidence.INFERRED,
    });
  });
  return { nodes: b.nodes, links: b.links };
}

export const scipIngestor: Ingestor = {
  id: "scip",
  mode: "local-tool",
  detect: (file) => file.relPath.endsWith("index.scip"),
  available: () => onPath("scip"),
  async ingest(file: SourceFile): Promise<GraphFragment> {
    const res = spawnSync("scip", ["print", "--json", file.path], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (res.status !== 0) return { nodes: [], links: [] };
    return scipFragment(file.relPath, res.stdout);
  },
};

/** SCIP JSON → symbol nodes (documents[].symbols[].symbol), the testable half. */
export function scipFragment(rel: string, json: string): GraphFragment {
  const b = createBuilder();
  const fileId = fileNode(b, rel);
  try {
    const parsed = JSON.parse(json) as {
      documents?: Array<{ relative_path?: string; symbols?: Array<{ symbol?: string }> }>;
    };
    for (const doc of parsed.documents ?? []) {
      for (const sym of doc.symbols ?? []) {
        if (!sym.symbol) continue;
        const label = sym.symbol.split("/").pop() as string; // split() never yields [], so pop() is a string
        const id = scipId(rel, sym.symbol);
        addNode(b, id, label.slice(0, 120), "scip-symbol", doc.relative_path ?? rel);
        b.links.push({
          source: fileId,
          target: id,
          relation: "contains",
          confidence: Confidence.EXTRACTED,
        });
      }
    }
  } catch {
    // malformed scip output — empty fragment, never fatal
  }
  return { nodes: b.nodes, links: b.links };
}
