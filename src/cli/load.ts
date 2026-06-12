import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { revitifyAsync } from "../index.js";
import { assertGraphContract } from "../model/contract.js";
import type { RevitifyGraph } from "../model/graph.js";
import { GraphIndex } from "../query/graph.js";

/** Load revitify-out/graph.json when present, else build fresh (full async engine). */
export async function loadOrBuild(rootArg?: string): Promise<{ root: string; index: GraphIndex }> {
  const root = resolve(rootArg ?? ".");
  const graphJson = join(root, "revitify-out", "graph.json");
  let graph: RevitifyGraph;
  if (existsSync(graphJson)) {
    const parsed: unknown = JSON.parse(readFileSync(graphJson, "utf8"));
    assertGraphContract(parsed);
    graph = parsed;
  } else {
    await revitifyAsync(root);
    const parsed: unknown = JSON.parse(readFileSync(graphJson, "utf8"));
    assertGraphContract(parsed);
    graph = parsed;
  }
  return { root, index: new GraphIndex(graph) };
}
