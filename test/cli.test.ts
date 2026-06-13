import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** Phase 6 — CLI smoke per verb against dist (graphify's CLI surface at revitify's depth). */

const CLI = fileURLToPath(new URL("../dist/cli/main.js", import.meta.url));

function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-cli-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(
    join(dir, "src", "core.ts"),
    "export function engine(): void {}\nexport function helper(): void { engine(); }",
  );
  writeFileSync(
    join(dir, "src", "api.ts"),
    `import { helper } from "./core.js";\nexport function handle(): void { helper(); }`,
  );
  return dir;
}

const cli = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" });

describe.skipIf(!existsSync(CLI))("revitify CLI", () => {
  it("help lists every verb; unknown verb exits 1", () => {
    const help = cli(tmpdir(), "--help");
    expect(help.status).toBe(0);
    for (const verb of ["build", "query", "affected", "watch", "global", "prs", "validate"]) {
      expect(help.stdout).toContain(verb);
    }
    expect(cli(tmpdir(), "frobnicate").status).toBe(1);
  });

  it("build → query → path → affected → communities → export → validate, end to end", () => {
    const dir = fixture();
    const build = cli(dir, "build");
    expect(build.status, build.stderr).toBe(0);
    expect(build.stdout).toMatch(/\d+ nodes, \d+ links/);

    const query = cli(dir, "query", "engine");
    expect(query.status, query.stderr).toBe(0);
    expect(query.stdout).toContain("engine");

    const path = cli(dir, "path", "handle", "engine");
    expect(path.status, path.stderr).toBe(0);
    expect(path.stdout).toContain("sym:src/core.ts#engine");

    const blast = cli(dir, "affected", "engine");
    expect(blast.status, blast.stderr).toBe(0);
    expect(blast.stdout).toContain("helper");

    const communities = cli(dir, "communities");
    expect(communities.status, communities.stderr).toBe(0);
    expect(communities.stdout).toMatch(/community \d+: \d+ nodes, cohesion/);

    const exp = cli(dir, "export", "wiki", "mermaid");
    expect(exp.status, exp.stderr).toBe(0);
    expect(existsSync(join(dir, "revitify-out", "WIKI.md"))).toBe(true);
    expect(existsSync(join(dir, "revitify-out", "graph.mmd"))).toBe(true);

    const validate = cli(dir, "validate");
    expect(validate.status, validate.stderr).toBe(0);
    expect(validate.stdout).toContain("contract holds");

    // The query log recorded the session.
    const log = readFileSync(join(dir, ".revitify", "query-log.jsonl"), "utf8")
      .trim()
      .split("\n");
    expect(log.length).toBeGreaterThanOrEqual(4);
  });

  it("prs reports diff impact in a git repo", () => {
    const dir = fixture();
    const git = (...a: string[]) => spawnSync("git", a, { cwd: dir, encoding: "utf8" });
    git("init", "-q");
    git("add", "-A");
    git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "base");
    writeFileSync(
      join(dir, "src", "core.ts"),
      "export function engine(): void {}\nexport function helper(): void { engine(); }\nexport const extra = 1;",
    );
    git("add", "-A");
    git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "change core");
    cli(dir, "build"); // refresh graph post-commit
    const prs = cli(dir, "prs", "HEAD~1");
    expect(prs.status, prs.stderr).toBe(0);
    expect(prs.stdout).toContain("src/core.ts");
    expect(prs.stdout).toMatch(/Total blast radius: \d+/);
  });

  it("global merges repos with repo: prefixes", () => {
    const a = fixture();
    const b = fixture();
    const out = cli(tmpdir(), "global", a, b);
    expect(out.status, out.stderr).toBe(0);
    expect(out.stdout).toMatch(/global graph: \d+ nodes/);
    const globalPath = `${process.env.HOME}/.revitify/global/graph.json`;
    const merged = JSON.parse(readFileSync(globalPath, "utf8"));
    expect(merged.nodes.every((n: { id: string }) => n.id.includes(":"))).toBe(true);
  });
});

describe.skipIf(!existsSync(CLI))("watch verb", () => {
  it("rebuilds on change (initial build, then incremental)", async () => {
    const { spawn } = await import("node:child_process");
    const dir = fixture();
    const proc = spawn(process.execPath, [CLI, "watch", "."], { cwd: dir });
    let output = "";
    proc.stdout.on("data", (d) => {
      output += String(d);
    });
    const waitFor = (pattern: RegExp, ms: number) =>
      new Promise<boolean>((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (pattern.test(output)) return resolve(true);
          if (Date.now() - start > ms) return resolve(false);
          setTimeout(tick, 100);
        };
        tick();
      });
    try {
      expect(await waitFor(/\[watch\] initial: \d+ nodes/, 10_000)).toBe(true);
      writeFileSync(join(dir, "src", "fresh.ts"), "export const fresh = 1;");
      expect(await waitFor(/\[watch\] (add|change).*fresh\.ts: \d+ nodes/s, 10_000)).toBe(true);
    } finally {
      proc.kill();
    }
  }, 25_000);
});
