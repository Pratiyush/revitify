import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { revitifyAsync } from "../index.js";
import { assertGraphContract } from "../model/contract.js";
import type { RevitifyGraph } from "../model/graph.js";
import { GraphIndex } from "../query/graph.js";

/** Parse + validate a graph.json, with an actionable error instead of a raw SyntaxError. */
export function loadGraph(graphJsonPath: string): RevitifyGraph {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(graphJsonPath, "utf8"));
    assertGraphContract(parsed);
  } catch (err) {
    throw new Error(
      `failed to load graph at ${graphJsonPath} — run 'revitify build' to regenerate it: ${String(err)}`,
    );
  }
  return parsed;
}

/** Load revitify-out/graph.json when present, else build fresh (full async engine). */
export async function loadOrBuild(rootArg?: string): Promise<{ root: string; index: GraphIndex }> {
  const root = resolve(rootArg ?? ".");
  const graphJson = join(root, "revitify-out", "graph.json");
  if (!existsSync(graphJson)) await revitifyAsync(root);
  return { root, index: new GraphIndex(loadGraph(graphJson)) };
}
