import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { FileRef } from "../model/fragment.js";

const DEFAULT_EXCLUDES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  "graphify-out",
  "revitify-out",
  ".rivet",
  "_ref",
  ".claude",
  ".worktrees",
  ".husky",
  "__pycache__",
  "target",
  ".venv",
  "venv",
]);

/** Deterministic walk: sorted entries, default excludes, dot-dirs skipped, 2MB file cap. */
export function walkFileRefs(rootDir: string): FileRef[] {
  const out: FileRef[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      if (DEFAULT_EXCLUDES.has(entry) || entry.startsWith(".")) continue;
      const path = join(dir, entry);
      const st = statSync(path);
      if (st.isDirectory()) walk(path);
      else if (st.isFile() && st.size < 2_000_000) {
        out.push({
          path,
          relPath: relative(rootDir, path).split("\\").join("/"),
          size: st.size,
          mtimeMs: st.mtimeMs,
        });
      }
    }
  };
  walk(rootDir);
  return out;
}

export function walkFiles(rootDir: string): string[] {
  return walkFileRefs(rootDir).map((f) => f.path);
}
