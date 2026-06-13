import { Confidence } from "../model/confidence.js";
import type { GraphFragment } from "../model/fragment.js";
import type { RevitifyNode } from "../model/graph.js";
import { fileId, whyId } from "../model/ids.js";

/**
 * Per-file fragment builder — preserves the exact node/link shapes and insertion order the
 * output contract pins (communities are assigned later by passes/cluster, appending the
 * `community` key last, exactly where it has always serialized).
 */
export interface FragmentBuilder extends GraphFragment {
  seen: Map<string, RevitifyNode>;
}

export function createBuilder(): FragmentBuilder {
  return { nodes: [], links: [], seen: new Map() };
}

export function addNode(
  b: FragmentBuilder,
  id: string,
  label: string,
  kind: string,
  sourceFile: string,
  line?: number,
): void {
  if (b.seen.has(id)) return;
  const node: RevitifyNode = {
    id,
    label,
    name: label,
    kind,
    source_file: sourceFile,
    ...(line !== undefined ? { source_location: `${sourceFile}:${line}` } : {}),
  };
  b.seen.set(id, node);
  b.nodes.push(node);
}

export function fileNode(b: FragmentBuilder, rel: string): string {
  const id = fileId(rel);
  addNode(b, id, rel, "file", rel);
  return id;
}

/** Shared why-node emitter — also used by the TypeScript compiler extractor. */
const WHY_MARKER = /(?:^|\W)(NOTE|WHY|HACK):\s*(.+)/;

export function addWhyNode(
  b: FragmentBuilder,
  rel: string,
  commentText: string,
  line: number,
  enclosingId: string,
): void {
  const match = commentText.match(WHY_MARKER);
  if (!match) return;
  const label = `${match[1]}: ${(match[2] as string).replace(/\s*\*\/\s*$/, "").trim()}`.slice(
    0,
    160,
  );
  const id = whyId(rel, line);
  addNode(b, id, label, "why", rel, line);
  b.links.push({
    source: enclosingId,
    target: id,
    relation: "rationale_for",
    confidence: Confidence.EXTRACTED,
  });
}
