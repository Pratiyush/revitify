import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The lazy-boundary proof (hard invariant #5): `import { revitify }` and a sync build must
 * NEVER load web-tree-sitter or any grammar. A module-resolution hook in a child process
 * records every resolved specifier; the async path doubles as the positive control proving
 * the hook actually records (a silent hook failure cannot fake a pass).
 */

const DIST = fileURLToPath(new URL("../dist/index.js", import.meta.url));

function resolvedSpecifiers(body: string): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-lazy-"));
  const log = join(dir, "resolved.log");
  writeFileSync(log, "");
  writeFileSync(
    join(dir, "hook.mjs"),
    [
      'import { appendFileSync } from "node:fs";',
      "export async function resolve(specifier, context, next) {",
      "  appendFileSync(process.env.LAZY_LOG, `${specifier}\\n`);",
      "  return next(specifier, context);",
      "}",
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "register.mjs"),
    ['import { register } from "node:module";', 'register("./hook.mjs", import.meta.url);'].join(
      "\n",
    ),
  );
  mkdirSync(join(dir, "proj"));
  writeFileSync(join(dir, "proj", "a.ts"), "export const a = 1;");
  writeFileSync(join(dir, "proj", "b.py"), "def beta():\n    pass\n");
  const res = spawnSync(
    process.execPath,
    ["--import", join(dir, "register.mjs"), "--input-type=module", "-e", body],
    {
      env: { ...process.env, LAZY_LOG: log, DIST, PROJ: join(dir, "proj") },
      encoding: "utf8",
    },
  );
  expect(res.status, res.stderr).toBe(0);
  return readFileSync(log, "utf8");
}

describe.skipIf(!existsSync(DIST))("lazy boundary (dist child process)", () => {
  it("sync revitify never resolves web-tree-sitter or grammar packages", () => {
    const log = resolvedSpecifiers(
      "const { revitify } = await import(process.env.DIST); revitify(process.env.PROJ);",
    );
    expect(log).not.toMatch(/web-tree-sitter|tree-sitter-(python|java|go|rust)/);
    expect(log).toContain("typescript"); // sanity: the sync path did load its real deps
  });

  it("positive control: the async path DOES resolve web-tree-sitter through the same hook", () => {
    const log = resolvedSpecifiers(
      "const { buildGraphAsync } = await import(process.env.DIST); await buildGraphAsync(process.env.PROJ, { cache: false });",
    );
    expect(log).toMatch(/web-tree-sitter/);
  });
});

describe.skipIf(!existsSync(DIST))("parallel extraction (dist child process)", () => {
  it("worker-pool output matches sequential output exactly", () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-parallel-"));
    for (let i = 0; i < 6; i++) {
      writeFileSync(join(dir, `m${i}.py`), `def fn_${i}():\n    pass\n\nclass C${i}:\n    pass\n`);
    }
    const body = `
      const { buildGraphAsync } = await import(process.env.DIST);
      const seq = await buildGraphAsync(process.env.PROJ, { cache: false, parallel: false });
      const par = await buildGraphAsync(process.env.PROJ, { cache: false, parallel: 2 });
      if (JSON.stringify(seq) !== JSON.stringify(par)) { console.error("MISMATCH"); process.exit(1); }
      console.log("nodes=" + par.nodes.length);
    `;
    const res = spawnSync(process.execPath, ["--input-type=module", "-e", body], {
      env: { ...process.env, PROJ: dir, DIST },
      encoding: "utf8",
    });
    expect(res.status, res.stderr).toBe(0);
    expect(res.stdout).toMatch(/nodes=\d+/);
    expect(Number(res.stdout.match(/nodes=(\d+)/)?.[1])).toBeGreaterThan(12);
  });
});
