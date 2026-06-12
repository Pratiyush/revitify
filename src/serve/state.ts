import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { assertGraphContract } from "../model/contract.js";
import { GraphIndex } from "../query/graph.js";

/**
 * Shared graph state for the HTTP and MCP servers: loads revitify-out/graph.json and reloads
 * when its mtime moves (port of serve.py's freshness check) — a `revitify watch` next door
 * keeps both servers live.
 */
export class GraphState {
  private index: GraphIndex | undefined;
  private loadedMtime = 0;

  constructor(readonly rootDir: string) {}

  get(): GraphIndex {
    const path = join(this.rootDir, "revitify-out", "graph.json");
    const mtime = statSync(path).mtimeMs;
    if (!this.index || mtime !== this.loadedMtime) {
      const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
      assertGraphContract(parsed);
      this.index = new GraphIndex(parsed);
      this.loadedMtime = mtime;
    }
    return this.index;
  }
}
