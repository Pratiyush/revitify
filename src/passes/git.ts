import { spawnSync } from "node:child_process";

/** HEAD sha for built_at_commit freshness stamping; undefined outside a git checkout. */
export function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}
