import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/** diagnose — environment self-check: grammars loadable, cache state, versions. */
export async function run(args: string[]): Promise<number> {
  const root = resolve(args[1] ?? ".");
  console.log(`revitify diagnose — node ${process.version}`);
  let failures = 0;

  const wasmSpecs: Record<string, string> = {
    python: "tree-sitter-python/tree-sitter-python.wasm",
    java: "tree-sitter-java/tree-sitter-java.wasm",
    go: "tree-sitter-go/tree-sitter-go.wasm",
    rust: "tree-sitter-rust/tree-sitter-rust.wasm",
    ruby: "tree-sitter-ruby/tree-sitter-ruby.wasm",
    c: "tree-sitter-c/tree-sitter-c.wasm",
    cpp: "tree-sitter-cpp/tree-sitter-cpp.wasm",
    csharp: "tree-sitter-c-sharp/tree-sitter-c_sharp.wasm",
    bash: "tree-sitter-bash/tree-sitter-bash.wasm",
    php: "tree-sitter-php/tree-sitter-php.wasm",
    scala: "tree-sitter-scala/tree-sitter-scala.wasm",
    kotlin: "@tree-sitter-grammars/tree-sitter-kotlin/tree-sitter-kotlin.wasm",
  };
  for (const [lang, spec] of Object.entries(wasmSpecs)) {
    try {
      const { loadLanguage } = await import("../../extract/treesitter/loader.js");
      await loadLanguage(spec);
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
