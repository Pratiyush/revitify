import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** install [--claude-code] [path] — drop the /revitify skill into the project's assistant dir. */
export async function run(args: string[]): Promise<number> {
  const positional = args.slice(1).filter((a) => !a.startsWith("-"));
  const root = resolve(positional[0] ?? ".");
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
