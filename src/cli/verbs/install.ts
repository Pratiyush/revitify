import { chmodSync, copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * install [path] [--git-hook] — drop the /revitify skill into the project's assistant dir;
 * --git-hook additionally writes a post-commit hook that refreshes the graph (hooks.py's
 * automation, opt-in and overwrite-shy).
 */
export async function run(args: string[]): Promise<number> {
  const positional = args.slice(1).filter((a) => !a.startsWith("-"));
  const root = resolve(positional[0] ?? ".");
  if (args.includes("--git-hook")) {
    const hookDir = join(root, ".git", "hooks");
    if (!existsSync(hookDir)) {
      console.error(`not a git repository (no ${hookDir})`);
      return 1;
    }
    const hookPath = join(hookDir, "post-commit");
    if (existsSync(hookPath)) {
      console.error(`refusing to overwrite existing hook: ${hookPath}`);
      return 1;
    }
    writeFileSync(
      hookPath,
      "#!/bin/sh\n# revitify: refresh the code graph after every commit (installed by `revitify install --git-hook`)\nnpx --no-install revitify build . >/dev/null 2>&1 || true\n",
    );
    chmodSync(hookPath, 0o755);
    console.log(`installed post-commit graph refresh → ${hookPath}`);
  }
  // dist/cli/verbs/install.js → package root is three levels up.
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  const source = join(packageRoot, "skills", "revitify", "SKILL.md");
  if (!existsSync(source)) {
    console.error(`skill source missing: ${source}`);
    return 1;
  }
  const target = join(root, ".claude", "skills", "revitify", "SKILL.md");
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  console.log(`installed /revitify skill → ${target}`);
  return 0;
}
