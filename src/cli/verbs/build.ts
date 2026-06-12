import { resolve } from "node:path";
import { revitifyAsync } from "../../index.js";

export async function run(args: string[]): Promise<number> {
  const root = resolve(args[1] ?? ".");
  const stats: { cacheHits?: number; cacheMisses?: number } = {};
  const t0 = Date.now();
  const result = await revitifyAsync(root, undefined, { stats });
  console.log(
    `revitify: ${result.counts.nodes} nodes, ${result.counts.links} links in ${Date.now() - t0}ms ` +
      `(cache: ${stats.cacheHits ?? 0} hits, ${stats.cacheMisses ?? 0} misses)\n→ ${result.graphJsonPath}`,
  );
  return 0;
}
