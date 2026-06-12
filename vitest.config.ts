import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Ratchet: set just under measured coverage; raise as phases land, never lower.
      // Measured at Phase 0: stmts 89 / branch 70.8 / funcs 96.9 / lines 94.2.
      thresholds: { lines: 90, functions: 90, branches: 70, statements: 85 },
    },
  },
});
