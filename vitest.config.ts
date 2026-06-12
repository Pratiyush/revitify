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
      // Ratchet: set just under measured coverage; raise as phases land, never lower.
      // Measured at Phase 1a: stmts 97.6 / branch 88.2 / funcs 94.4 / lines 97.9.
      thresholds: { lines: 95, functions: 92, branches: 85, statements: 95 },
    },
  },
});
