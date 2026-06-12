import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildGraphAsync } from "../src/index.js";

/** Phase 2 — per-file fragment cache with stat fastpath (upstream: graphify cache.py). */

function project(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-cache-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src", "a.ts"), "export function alpha(): void {}");
  writeFileSync(join(dir, "src", "b.py"), "def beta():\n    pass\n");
  writeFileSync(join(dir, "README.md"), "# Cached\n");
  return dir;
}

describe("ast cache", () => {
  it("second run is all hits; edits invalidate exactly one file; output identical", async () => {
    const dir = project();
    const cold: { cacheHits?: number; cacheMisses?: number } = {};
    const first = await buildGraphAsync(dir, { stats: cold });
    expect(cold.cacheMisses).toBeGreaterThan(0);
    expect(cold.cacheHits).toBe(0);

    const warm: { cacheHits?: number; cacheMisses?: number } = {};
    const second = await buildGraphAsync(dir, { stats: warm });
    expect(warm.cacheMisses).toBe(0);
    expect(warm.cacheHits).toBe(cold.cacheMisses);
    expect(second).toEqual(first); // cached fragments reproduce the graph exactly

    writeFileSync(join(dir, "src", "a.ts"), "export function alphaPrime(): void {}");
    const edited: { cacheHits?: number; cacheMisses?: number } = {};
    const third = await buildGraphAsync(dir, { stats: edited });
    expect(edited.cacheMisses).toBe(1); // only the edited file re-extracts
    expect(third.nodes.some((n) => n.label === "alphaPrime")).toBe(true);
  });

  it("adding a file invalidates the set (import resolution depends on the walked set)", async () => {
    const dir = project();
    await buildGraphAsync(dir);
    writeFileSync(join(dir, "src", "new.ts"), "export const fresh = 1;");
    const stats: { cacheHits?: number; cacheMisses?: number } = {};
    await buildGraphAsync(dir, { stats });
    expect(stats.cacheHits).toBe(0); // set hash changed — full honest invalidation
  });

  it("cache: false bypasses everything", async () => {
    const dir = project();
    const stats: { cacheHits?: number; cacheMisses?: number } = {};
    await buildGraphAsync(dir, { cache: false, stats });
    expect(stats.cacheHits).toBe(0);
    expect(stats.cacheMisses).toBe(0);
  });
});

describe("ast cache resilience", () => {
  it("recovers from a corrupt stat-index and from evicted fragment files", async () => {
    const dir = project();
    await buildGraphAsync(dir);
    // Corrupt the index — loader must start fresh, not crash.
    writeFileSync(join(dir, ".revitify", "cache", "stat-index.json"), "{nope");
    const afterCorrupt: { cacheHits?: number; cacheMisses?: number } = {};
    const g1 = await buildGraphAsync(dir, { stats: afterCorrupt });
    expect(g1.nodes.length).toBeGreaterThan(0);
    // Index lost, but content-keyed fragment files survive: hits via contentGet, no recompute.
    expect(afterCorrupt.cacheMisses).toBe(0);
    expect(afterCorrupt.cacheHits).toBeGreaterThan(0);

    // Evict the fragment files but keep the index — statGet must miss cleanly.
    rmSync(join(dir, ".revitify", "cache", "ast"), { recursive: true, force: true });
    const afterEvict: { cacheHits?: number; cacheMisses?: number } = {};
    const g2 = await buildGraphAsync(dir, { stats: afterEvict });
    expect(g2).toEqual(g1);
    expect(afterEvict.cacheMisses).toBeGreaterThan(0);
  });
});
