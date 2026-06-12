import { resolve } from "node:path";
import { revitifyAsync } from "../../index.js";

/** build [path] [--out <dir>] — full graph + artifacts (default outDir: revitify-out). */
export async function run(args: string[]): Promise<number> {
  const positional = args.slice(1).filter((a) => !a.startsWith("-"));
  const outFlag = args.indexOf("--out");
  const outDir = outFlag !== -1 ? args[outFlag + 1] : undefined;
  const root = resolve(positional[0] ?? ".");
  const stats: { cacheHits?: number; cacheMisses?: number } = {};
  const t0 = Date.now();
  const result = await revitifyAsync(root, outDir, { stats });
  console.log(
    `revitify: ${result.counts.nodes} nodes, ${result.counts.links} links in ${Date.now() - t0}ms ` +
      `(cache: ${stats.cacheHits ?? 0} hits, ${stats.cacheMisses ?? 0} misses)\n→ ${result.graphJsonPath}`,
  );
  return 0;
}
