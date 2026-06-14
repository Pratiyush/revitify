import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { buildGraphAsync, revitify, revitifyAsync } from "../src/index.js";
import { createHttpServer } from "../src/serve/http.js";

/** Edge-case coverage for the async entry, the worker gate, and the HTTP error/default paths. */

describe("index/revitifyAsync", () => {
  it("writes the artifacts to the default outDir", async () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-async-"));
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src", "a.ts"), "export const a = 1;");
    const res = await revitifyAsync(dir);
    expect(res.counts.nodes).toBeGreaterThan(0);
    expect(existsSync(join(dir, "revitify-out", "graph.json"))).toBe(true);
    expect(res.graphJsonPath).toBe(join(dir, "revitify-out", "graph.json"));
  });
});

describe("passes/pipeline-async worker gate", () => {
  it("a numeric parallel threshold evaluates the worker-eligibility check (sequential under vitest)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "revitify-par-"));
    writeFileSync(join(dir, "a.ts"), "export const a = 1;");
    writeFileSync(join(dir, "b.ts"), "export const b = 2;");
    const graph = await buildGraphAsync(dir, { parallel: 2, cache: false });
    expect(graph.nodes.length).toBeGreaterThan(0);
  });
});

describe("serve/http edges", async () => {
  const dir = mkdtempSync(join(tmpdir(), "revitify-http-edge-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src", "a.ts"), "export function f(): void {}");
  revitify(dir);
  const server = createHttpServer(dir);
  await new Promise<void>((ready) => server.listen(0, "127.0.0.1", ready));
  const port = (server.address() as AddressInfo).port;
  const get = (path: string) => fetch(`http://127.0.0.1:${port}${path}`);
  afterAll(() => server.close());

  it("serves GRAPH_REPORT.md as text/plain", async () => {
    const res = await get("/GRAPH_REPORT.md");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
  });

  it("a paramless query returns an empty result", async () => {
    expect(await (await get("/api/query")).json()).toEqual([]);
  });

  it("a path between unconnected ids is null", async () => {
    expect(await (await get("/api/path?from=nope&to=nada")).json()).toEqual({ path: null });
  });

  it("returns a generic 500 when the viewer artifact is missing (handler throws)", async () => {
    rmSync(join(dir, "revitify-out", "graph.html")); // must run last — removes the artifact
    const res = await get("/");
    expect(res.status).toBe(500);
    expect(await res.text()).toBe('{"error":"internal"}');
  });
});
