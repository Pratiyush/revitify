import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { join, normalize } from "node:path";
import { appendQueryLog } from "../query/querylog.js";
import { queryHandlers } from "./handlers.js";
import { GraphState } from "./state.js";

/**
 * Local HTTP server (port of graphify serve.py): the interactive viewer at /, a JSON API under
 * /api/*. Static serving is allowlisted to the three artifacts — the path-traversal guard from
 * upstream security.py, by construction rather than sanitization. The query surface itself lives in
 * serve/handlers.ts (shared with the MCP server, so the two cannot drift).
 */
const ARTIFACTS = new Set(["graph.html", "graph.json", "GRAPH_REPORT.md"]);

export function createHttpServer(rootDir: string): Server {
  const state = new GraphState(rootDir);
  const q = queryHandlers(state);
  return createServer((req, res) => {
    try {
      /* v8 ignore next -- node's http parser always sets req.url for a parsable request */
      const url = new URL(req.url ?? "/", "http://localhost");
      const send = (status: number, body: string, type = "application/json"): void => {
        res.writeHead(status, { "content-type": `${type}; charset=utf-8` });
        res.end(body);
      };
      // Read-only API: reject anything but GET/HEAD up front.
      if (req.method && req.method !== "GET" && req.method !== "HEAD") {
        return send(405, `{"error":"method not allowed"}`);
      }
      // Cap query params so a giant value can't turn a linear scan into a local CPU-spin.
      const param = (name: string): string => (url.searchParams.get(name) ?? "").slice(0, 512);

      if (url.pathname === "/" || url.pathname === "/graph.html") {
        return send(
          200,
          readFileSync(join(rootDir, "revitify-out", "graph.html"), "utf8"),
          "text/html",
        );
      }
      const file = normalize(url.pathname).replace(/^\/+/, "");
      if (ARTIFACTS.has(file)) {
        return send(
          200,
          readFileSync(join(rootDir, "revitify-out", file), "utf8"),
          file.endsWith(".json") ? "application/json" : "text/plain",
        );
      }
      if (url.pathname === "/api/query") {
        const term = param("q");
        const hits = q.search(term);
        appendQueryLog(rootDir, "http_query", term, hits.length);
        return send(200, JSON.stringify(hits));
      }
      if (url.pathname === "/api/explain") {
        const term = param("q");
        appendQueryLog(rootDir, "http_explain", term, 1);
        return send(200, JSON.stringify({ text: q.explain(term) }));
      }
      if (url.pathname === "/api/node") {
        const node = q.node(param("id"));
        return node ? send(200, JSON.stringify(node)) : send(404, `{"error":"not found"}`);
      }
      if (url.pathname === "/api/neighbors") {
        const ns = q.neighbors(param("id"));
        return ns === undefined
          ? send(404, `{"error":"not found"}`)
          : send(200, JSON.stringify(ns));
      }
      if (url.pathname === "/api/path") {
        return send(200, JSON.stringify({ path: q.path(param("from"), param("to")) }));
      }
      if (url.pathname === "/api/communities") {
        return send(200, JSON.stringify(q.communities()));
      }
      if (url.pathname === "/api/stats") {
        return send(
          200,
          JSON.stringify({
            ...q.stats(),
            god_nodes: q.godNodes().map((x) => ({ label: x.node.label, degree: x.degree })),
          }),
        );
      }
      send(404, `{"error":"unknown route"}`);
    } catch (err) {
      // Log the detail server-side; never reflect it (can leak a filesystem path) to the client.
      console.error(`revitify serve: ${String(err)}`);
      res.writeHead(500, { "content-type": "application/json" });
      res.end(`{"error":"internal"}`);
    }
  });
}
