import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { revitifyAsync } from "../../index.js";
import type { RevitifyGraph } from "../../model/graph.js";
import { loadGraph } from "../load.js";

/**
 * global <paths…> — multi-corpus graph (port of graphify global_graph.py): each repo's graph
 * merges with `repo:` id prefixes so cross-repo collisions are impossible; communities re-offset
 * per repo. Output: ~/.revitify/global/graph.json (+ a tiny report).
 */
export async function run(args: string[]): Promise<number> {
  const roots = args.slice(1).filter((a) => !a.startsWith("-"));
  if (roots.length < 2) {
    console.error("usage: revitify global <path> <path> [...]");
    return 1;
  }
  const merged: RevitifyGraph = { nodes: [], links: [] };
  let communityOffset = 0;
  for (const rootArg of roots) {
    const root = resolve(rootArg);
    const repo = basename(root);
    const graphJson = join(root, "revitify-out", "graph.json");
    if (!existsSync(graphJson)) await revitifyAsync(root);
    const parsed = loadGraph(graphJson);
    let maxCommunity = 0;
    for (const n of parsed.nodes) {
      merged.nodes.push({
        ...n,
        id: `${repo}:${n.id}`,
        ...(n.community === undefined ? {} : { community: n.community + communityOffset }),
      });
      maxCommunity = Math.max(maxCommunity, n.community ?? 0);
    }
    for (const l of parsed.links) {
      merged.links.push({ ...l, source: `${repo}:${l.source}`, target: `${repo}:${l.target}` });
    }
    communityOffset += maxCommunity + 1;
    console.log(`+ ${repo}: ${parsed.nodes.length} nodes`);
  }
  const outDir = join(homedir(), ".revitify", "global");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "graph.json");
  writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(
    `global graph: ${merged.nodes.length} nodes, ${merged.links.length} links → ${outPath}`,
  );
  return 0;
}
