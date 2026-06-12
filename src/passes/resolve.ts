import { Confidence } from "../model/confidence.js";
import type { RevitifyLink, RevitifyNode } from "../model/graph.js";

/**
 * Pass 2 — reference resolution, ported in spirit from graphify's symbol_resolution.py at
 * revitify's current granularity (file → symbol; symbol → symbol lands in Phase 3).
 * `name:X` targets resolve to a symbol node: exactly one candidate ⇒ INFERRED; several ⇒ a
 * deterministic pick (same-directory candidates first, then lexicographic id) tagged AMBIGUOUS;
 * none ⇒ the link is dropped. Dangling endpoints are filtered; `file:` ids pass because the
 * extractor verified them against the walked-file set (Phase 1b) — they exist on disk even when
 * no node was produced for them (e.g. an imported .json).
 */
export function resolveReferences(
  nodes: ReadonlyMap<string, RevitifyNode>,
  links: readonly RevitifyLink[],
): RevitifyLink[] {
  const byName = new Map<string, string[]>();
  for (const n of nodes.values()) {
    if (!n.id.startsWith("sym:")) continue;
    (byName.get(n.label) ?? byName.set(n.label, []).get(n.label)!).push(n.id);
  }
  return links
    .map((l) => {
      if (!String(l.target).startsWith("name:")) return l;
      const candidates = byName.get(String(l.target).slice(5));
      if (!candidates?.length) return null;
      const target = pick(candidates, String(l.source));
      const confidence = candidates.length > 1 ? Confidence.AMBIGUOUS : Confidence.INFERRED;
      return { ...l, target, confidence };
    })
    .filter((l): l is RevitifyLink => l !== null)
    .filter((l) => nodes.has(String(l.source)) || String(l.source).startsWith("file:"))
    .filter((l) => nodes.has(String(l.target)) || String(l.target).startsWith("file:"));
}

/** Same directory as the referencing file wins; ties break on lexicographic id — never on
 *  insertion order, so the pick is stable under any walk/merge reshuffle. */
function pick(candidates: readonly string[], sourceId: string): string {
  const fromDir = dirOf(sourceId.startsWith("file:") ? sourceId.slice(5) : "");
  return [...candidates].sort((a, b) => {
    const aSame = dirOf(symRel(a)) === fromDir ? 0 : 1;
    const bSame = dirOf(symRel(b)) === fromDir ? 0 : 1;
    return aSame - bSame || (a < b ? -1 : a > b ? 1 : 0);
  })[0]!;
}

const symRel = (id: string): string => id.slice(4, id.indexOf("#"));
const dirOf = (rel: string): string =>
  rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
