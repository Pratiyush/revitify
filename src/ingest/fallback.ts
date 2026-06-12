import { createBuilder, fileNode } from "../extract/fragment-builder.js";
import { defaultExtractors } from "../extract/index.js";
import type { FileRef, GraphFragment, SourceFile } from "../model/fragment.js";
import type { IngestContext, Ingestor } from "./ingestor.js";

/**
 * Catch-all file ingestor (parity with graphify, which nodes every walked file): any file no
 * richer ingestor claims still becomes a `file` node. Extensionless scripts get one more
 * chance: a shebang (#!/usr/bin/env python …) routes them through the matching extractor
 * (detect.py's sniffing, done here where content is already in hand).
 */
const SHEBANG_LANGUAGES: ReadonlyArray<[RegExp, string]> = [
  [/python/, ".py"],
  [/node|deno|bun/, ".js"],
  [/bash|sh|zsh/, ".sh"],
  [/ruby/, ".rb"],
  [/php/, ".php"],
];

function shebangAlias(file: SourceFile): FileRef | undefined {
  if (!file.content.startsWith("#!")) return undefined;
  const firstLine = file.content.slice(0, file.content.indexOf("\n") + 1 || undefined);
  const hit = SHEBANG_LANGUAGES.find(([re]) => re.test(firstLine));
  return hit ? { ...file, relPath: file.relPath + hit[1] } : undefined;
}

function bareNode(file: SourceFile): GraphFragment {
  const b = createBuilder();
  fileNode(b, file.relPath);
  return { nodes: b.nodes, links: b.links };
}

/** Re-key a shebang-extracted fragment back to the real (extensionless) path. */
function rekey(fragment: GraphFragment, aliasRel: string, realRel: string): GraphFragment {
  const fix = (s: string) => s.split(aliasRel).join(realRel);
  return {
    nodes: fragment.nodes.map((n) => ({
      ...n,
      id: fix(n.id),
      source_file: realRel,
      ...(n.source_location ? { source_location: fix(n.source_location) } : {}),
    })),
    links: fragment.links.map((l) => ({
      ...l,
      source: fix(String(l.source)),
      target: fix(String(l.target)),
    })),
  };
}

function syncExtract(file: SourceFile, ctx: IngestContext): GraphFragment {
  const alias = shebangAlias(file);
  if (alias) {
    for (const reg of defaultExtractors.matchAll(alias)) {
      const extractor = defaultExtractors.resolveSync(reg);
      if (extractor) {
        const aliased = extractor.extract({ ...file, relPath: alias.relPath }, ctx);
        return rekey(aliased, alias.relPath, file.relPath);
      }
    }
  }
  return bareNode(file);
}

export const fallbackFileIngestor: Ingestor = {
  id: "file",
  mode: "offline",
  detect: () => true,
  available: () => true,
  async ingest(file, ctx) {
    const alias = shebangAlias(file);
    if (alias) {
      for (const reg of defaultExtractors.matchAll(alias)) {
        try {
          const extractor = await defaultExtractors.resolve(reg);
          const aliased = extractor.extract({ ...file, relPath: alias.relPath }, ctx);
          return rekey(aliased, alias.relPath, file.relPath);
        } catch {
          // grammar unavailable — try the next candidate
        }
      }
    }
    return bareNode(file);
  },
  ingestSync: syncExtract,
};
