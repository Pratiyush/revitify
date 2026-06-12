import { resolve } from "node:path";
import { watch } from "chokidar";
import { revitifyAsync } from "../../index.js";

/**
 * watch [path] — incremental re-index on change (port of graphify watch.py). The fragment
 * cache makes rebuilds proportional to the edit; debounce coalesces editor save bursts.
 */
export async function run(args: string[]): Promise<number> {
  const root = resolve(args[1] ?? ".");
  let timer: NodeJS.Timeout | undefined;
  let building = false;

  const rebuild = async (reason: string): Promise<void> => {
    if (building) return;
    building = true;
    try {
      const stats: { cacheHits?: number; cacheMisses?: number } = {};
      const t0 = Date.now();
      const result = await revitifyAsync(root, undefined, { stats });
      console.log(
        `[watch] ${reason}: ${result.counts.nodes} nodes, ${result.counts.links} links in ${Date.now() - t0}ms (${stats.cacheMisses ?? 0} re-extracted)`,
      );
    } catch (err) {
      console.error(`[watch] rebuild failed: ${String(err)}`);
    } finally {
      building = false;
    }
  };

  await rebuild("initial");
  const watcher = watch(root, {
    ignored: (path) => /node_modules|\.git\b|revitify-out|graphify-out|\.revitify/.test(path),
    ignoreInitial: true,
  });
  watcher.on("all", (event, path) => {
    clearTimeout(timer);
    timer = setTimeout(() => void rebuild(`${event} ${path}`), 200);
  });
  console.log(`[watch] watching ${root} — ctrl-c to stop`);
  return new Promise<number>(() => {}); // runs until killed
}
