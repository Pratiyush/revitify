import { spawnSync } from "node:child_process";
import { affected } from "../../query/affected.js";
import { appendQueryLog } from "../../query/querylog.js";
import { loadOrBuild } from "../load.js";

/**
 * prs [base] — diff impact (port of graphify prs.py): changed files since base (default HEAD~1,
 * or the merge-base with main) → their symbols → transitive blast radius, as markdown.
 */
export async function run(args: string[]): Promise<number> {
  const base = args[1] ?? "HEAD~1";
  const { root, index } = await loadOrBuild(undefined);
  const diff = spawnSync("git", ["diff", "--name-only", `${base}...HEAD`], {
    cwd: root,
    encoding: "utf8",
  });
  if (diff.status !== 0) {
    console.error(`git diff failed: ${diff.stderr.trim()}`);
    return 1;
  }
  const changed = diff.stdout.split("\n").filter(Boolean);
  if (!changed.length) {
    console.log(`No changes vs ${base}.`);
    return 0;
  }
  const lines = [`# PR impact vs ${base}`, "", `${changed.length} changed file(s):`, ""];
  const blastTotal = new Set<string>();
  for (const file of changed) {
    const fileId = `file:${file}`;
    if (!index.byId.has(fileId)) {
      lines.push(`- \`${file}\` — not in graph (new, deleted, or unindexed type)`);
      continue;
    }
    const blast = affected(index, fileId);
    for (const id of blast) blastTotal.add(id);
    lines.push(`- \`${file}\` → ${blast.length} dependent(s)`);
    for (const id of blast.slice(0, 6)) {
      const n = index.byId.get(id);
      lines.push(`  - ${n?.label ?? id} (\`${n?.source_file ?? ""}\`)`);
    }
    if (blast.length > 6) lines.push(`  - … ${blast.length - 6} more`);
  }
  lines.push("", `**Total blast radius: ${blastTotal.size} node(s).**`);
  appendQueryLog(root, "prs", base, blastTotal.size);
  console.log(lines.join("\n"));
  return 0;
}
