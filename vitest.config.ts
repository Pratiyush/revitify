import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: { enabled: true },
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Spawned-process code is invisible to in-process v8 coverage: workers are exercised by
      // lazy-boundary.test.ts, the CLI (thin shells over covered query/export layers) by
      // cli.test.ts — both against dist in child processes.
      exclude: ["src/passes/worker.ts", "src/passes/worker-pool.ts", "src/cli/**"],
      // 100% across the board — every reachable line/branch is tested; the genuinely-unreachable
      // defensive code (TOCTOU guards, the dist-only worker path, web-tree-sitter nullable-children
      // guards, the LSH false-positive floor) is marked with justified `/* v8 ignore */`. Never lower.
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
