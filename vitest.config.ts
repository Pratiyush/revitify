import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: { enabled: true },
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Worker code runs only in spawned dist processes (invisible to v8 here); it is
      // exercised by the dist integration tests in lazy-boundary.test.ts.
      exclude: ["src/passes/worker.ts", "src/passes/worker-pool.ts"],
      // Ratchet: set just under measured coverage; raise as phases land, never lower.
      // Measured at Phase 1a: stmts 97.6 / branch 88.2 / funcs 94.4 / lines 97.9.
      thresholds: { lines: 95, functions: 92, branches: 85, statements: 95 },
    },
  },
});
