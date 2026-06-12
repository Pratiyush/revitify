import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/** diagnose — environment self-check: grammars loadable, cache state, versions. */
export async function run(args: string[]): Promise<number> {
  const root = resolve(args[1] ?? ".");
  console.log(`revitify diagnose — node ${process.version}`);
  let failures = 0;

  for (const lang of ["python", "java", "go", "rust"]) {
    try {
      const { loadLanguage } = await import("../../extract/treesitter/loader.js");
      await loadLanguage(`tree-sitter-${lang}/tree-sitter-${lang}.wasm`);
      console.log(`  ✔ grammar ${lang}`);
    } catch (err) {
      failures++;
      console.log(`  ✖ grammar ${lang}: ${String(err).slice(0, 100)} (regex fallback active)`);
    }
  }
  const cacheIndex = join(root, ".revitify", "cache", "stat-index.json");
  console.log(
    existsSync(cacheIndex)
      ? `  ✔ cache present (${cacheIndex})`
      : "  · no cache yet (first build creates it)",
  );
  const graph = join(root, "revitify-out", "graph.json");
  console.log(
    existsSync(graph) ? `  ✔ graph present (${graph})` : "  · no graph yet — run: revitify build",
  );
  console.log(
    failures ? `${failures} grammar(s) unavailable — degraded, never fatal.` : "all systems go.",
  );
  return 0;
}
