import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The layer-boundary negative floor (REQUIREMENT_MOD-02 scenario): a forbidden cross-layer
 * import must fail the dependency-cruiser gate in CI, naming the edge — not slip through to a
 * code-review comment. This is the discipline that makes revitify "measurably more modular than
 * graphify" mechanical rather than aspirational; an assertion, not a convention.
 */
// The package's exports map blocks deep-subpath resolution; the .bin shim is always present.
const DEPCRUISE = fileURLToPath(new URL("../node_modules/.bin/depcruise", import.meta.url));

describe("layer-boundary enforcement (negative floor)", () => {
  it("a forbidden src/model → src/export import fails depcruise, naming the violated rule", () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-boundary-"));
    mkdirSync(join(dir, "src", "model"), { recursive: true });
    mkdirSync(join(dir, "src", "export"), { recursive: true });
    writeFileSync(join(dir, "src", "export", "thing.js"), "export const thing = 1;\n");
    // model is the purest layer — it may import nothing else. This violates that.
    writeFileSync(
      join(dir, "src", "model", "bad.js"),
      "import { thing } from '../export/thing.js';\nexport const x = thing;\n",
    );
    // Mirror the model-isolation rule from the real .dependency-cruiser.cjs.
    writeFileSync(
      join(dir, ".dependency-cruiser.cjs"),
      "module.exports = { forbidden: [{ name: 'layer-model', severity: 'error', comment: 'src/model may import nothing', from: { path: '^src/model/' }, to: { path: '^src/export/' } }] };\n",
    );
    const res = spawnSync(DEPCRUISE, ["src", "--config", ".dependency-cruiser.cjs"], {
      cwd: dir,
      encoding: "utf8",
    });
    expect(res.status, res.stderr).not.toBe(0); // CI fails — not a review nit
    expect(`${res.stdout}${res.stderr}`).toContain("layer-model"); // names the violating edge
  });
});
