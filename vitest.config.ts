import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: { enabled: true },
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Ratchet: set just under measured coverage; raise as phases land, never lower.
      // Measured at Phase 1a: stmts 97.6 / branch 88.2 / funcs 94.4 / lines 97.9.
      thresholds: { lines: 95, functions: 92, branches: 85, statements: 95 },
    },
  },
});
