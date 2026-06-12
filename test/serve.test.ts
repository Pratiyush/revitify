import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { revitify } from "../src/index.js";

/** Phase 7 — HTTP server + MCP server (upstream serve.py) + install/diagnose verbs. */

const CLI = fileURLToPath(new URL("../dist/cli/main.js", import.meta.url));

function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-serve-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(
    join(dir, "src", "core.ts"),
    "export function engine(): void {}\nexport function helper(): void { engine(); }",
  );
  writeFileSync(
    join(dir, "src", "api.ts"),
    `import { helper } from "./core.js";\nexport function handle(): void { helper(); }`,
  );
  revitify(dir);
  return dir;
}

describe("http server", async () => {
  const dir = fixture();
  const { createHttpServer } = await import("../src/serve/http.js");
  const server = createHttpServer(dir);
  await new Promise<void>((ready) => server.listen(0, "127.0.0.1", ready));
  const port = (server.address() as AddressInfo).port;
  const get = (path: string) => fetch(`http://127.0.0.1:${port}${path}`);
  afterAll(() => server.close());

  it("serves the viewer and the allowlisted artifacts; blocks traversal", async () => {
    const home = await get("/");
    expect(home.status).toBe(200);
    expect(await home.text()).toContain("<canvas");
    expect((await get("/graph.json")).status).toBe(200);
    expect((await get("/../package.json")).status).toBe(404); // traversal-proof by allowlist
    expect((await get("/etc/passwd")).status).toBe(404);
  });

  it("answers the API routes", async () => {
    const query = await (await get("/api/query?q=engine")).json();
    expect(query[0].label).toBe("engine");
    const node = await (await get("/api/node?id=sym:src/core.ts%23engine")).json();
    expect(node.kind).toBe("function");
    const neighbors = await (await get("/api/neighbors?id=sym:src/core.ts%23engine")).json();
    expect(neighbors.length).toBeGreaterThan(0);
    const path = await (
      await get("/api/path?from=sym:src/api.ts%23handle&to=sym:src/core.ts%23engine")
    ).json();
    expect(path.path?.at(-1)).toBe("sym:src/core.ts#engine");
    const stats = await (await get("/api/stats")).json();
    expect(stats.nodes).toBeGreaterThan(4);
    const explain = await (await get("/api/explain?q=engine")).json();
    expect(explain.text).toContain("engine");
    const communities = await (await get("/api/communities")).json();
    expect(communities.length).toBeGreaterThan(0);
    expect(communities[0]).toHaveProperty("cohesion");
    expect((await get("/api/unknown")).status).toBe(404);
    expect((await get("/api/node?id=missing")).status).toBe(404);
    expect((await get("/api/neighbors?id=missing")).status).toBe(404);
  });
});

describe("mcp server (in-memory transport)", async () => {
  const dir = fixture();
  const { createMcpServer } = await import("../src/serve/mcp.js");
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");

  it("lists the 7 graphify tools and answers query_graph + shortest_path", async () => {
    const server = createMcpServer(dir);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: "test", version: "0.0.0" });
    await client.connect(clientTransport);

    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "get_community",
      "get_neighbors",
      "get_node",
      "god_nodes",
      "graph_stats",
      "query_graph",
      "shortest_path",
    ]);

    const result = await client.callTool({ name: "query_graph", arguments: { query: "engine" } });
    const payload = JSON.parse(
      (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "{}",
    );
    expect(payload.hits[0].label).toBe("engine");
    expect(payload.explain).toContain("engine");

    const path = await client.callTool({
      name: "shortest_path",
      arguments: { from: "sym:src/api.ts#handle", to: "sym:src/core.ts#engine" },
    });
    const pathPayload = JSON.parse(
      (path.content as Array<{ type: string; text: string }>)[0]?.text ?? "{}",
    );
    expect(pathPayload.path?.at(-1)).toBe("sym:src/core.ts#engine");

    const unwrap = (r: unknown) =>
      JSON.parse(((r as { content: Array<{ text: string }> }).content[0] as { text: string }).text);
    const node = unwrap(
      await client.callTool({ name: "get_node", arguments: { id: "sym:src/core.ts#engine" } }),
    );
    expect(node.kind).toBe("function");
    const neighbors = unwrap(
      await client.callTool({ name: "get_neighbors", arguments: { id: "sym:src/core.ts#engine" } }),
    );
    expect(neighbors.length).toBeGreaterThan(0);
    const community = unwrap(
      await client.callTool({ name: "get_community", arguments: { community: node.community } }),
    );
    expect(community.length).toBeGreaterThan(0);
    const gods = unwrap(await client.callTool({ name: "god_nodes", arguments: {} }));
    expect(gods[0]).toHaveProperty("degree");
    const stats = unwrap(await client.callTool({ name: "graph_stats", arguments: {} }));
    expect(stats.nodes).toBeGreaterThan(4);
    const missing = unwrap(await client.callTool({ name: "get_node", arguments: { id: "nope" } }));
    expect(missing.error).toBe("not found");
    const noPath = unwrap(
      await client.callTool({ name: "shortest_path", arguments: { from: "nope", to: "nada" } }),
    );
    expect(noPath.path).toBeNull();
    await client.close();
  });
});

describe.skipIf(!existsSync(CLI))("install + diagnose verbs", () => {
  it("install drops the skill; diagnose reports grammars", () => {
    const dir = fixture();
    const install = spawnSync(process.execPath, [CLI, "install", dir], { encoding: "utf8" });
    expect(install.status, install.stderr).toBe(0);
    expect(existsSync(join(dir, ".claude", "skills", "revitify", "SKILL.md"))).toBe(true);

    const diagnose = spawnSync(process.execPath, [CLI, "diagnose", dir], { encoding: "utf8" });
    expect(diagnose.status, diagnose.stderr).toBe(0);
    expect(diagnose.stdout).toContain("grammar python");
    expect(diagnose.stdout).toContain("graph present");
  });
});

describe("graph state freshness", () => {
  it("reloads when graph.json changes on disk (watch-next-door pattern)", async () => {
    const dir = fixture();
    const { GraphState } = await import("../src/serve/state.js");
    const state = new GraphState(dir);
    const first = state.get();
    expect(state.get()).toBe(first); // mtime unchanged — cached index
    writeFileSync(join(dir, "src", "extra.ts"), "export const extra = 1;");
    revitify(dir); // rewrites graph.json
    const second = state.get();
    expect(second).not.toBe(first);
    expect(second.byId.has("sym:src/extra.ts#extra")).toBe(true);
  });
});

describe.skipIf(!existsSync(CLI))("install --git-hook", () => {
  it("writes an executable post-commit hook once, refuses overwrite, requires git", () => {
    const dir = fixture();
    spawnSync("git", ["init", "-q"], { cwd: dir });
    const first = spawnSync(process.execPath, [CLI, "install", dir, "--git-hook"], {
      encoding: "utf8",
    });
    expect(first.status, first.stderr).toBe(0);
    const hook = join(dir, ".git", "hooks", "post-commit");
    expect(existsSync(hook)).toBe(true);
    const again = spawnSync(process.execPath, [CLI, "install", dir, "--git-hook"], {
      encoding: "utf8",
    });
    expect(again.status).toBe(1); // overwrite-shy
    const noGit = spawnSync(process.execPath, [CLI, "install", fixture(), "--git-hook"], {
      encoding: "utf8",
    });
    expect(noGit.status).toBe(1);
  });
});
