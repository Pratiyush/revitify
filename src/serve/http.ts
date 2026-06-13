import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { join, normalize } from "node:path";
import { godNodes } from "../enrich/god-nodes.js";
import { communities } from "../query/communities.js";
import { explain, searchNodes } from "../query/explain.js";
import { appendQueryLog } from "../query/querylog.js";
import { shortestPath } from "../query/traverse.js";
import { GraphState } from "./state.js";

/**
 * Local HTTP server (port of graphify serve.py): the interactive viewer at /, a JSON API under
 * /api/*. Static serving is allowlisted to the three artifacts — the path-traversal guard from
 * upstream security.py, by construction rather than sanitization.
 */
const ARTIFACTS = new Set(["graph.html", "graph.json", "GRAPH_REPORT.md"]);

export function createHttpServer(rootDir: string): Server {
  const state = new GraphState(rootDir);
  return createServer((req, res) => {
    try {
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
      const index = state.get();

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
        const q = param("q");
        const hits = searchNodes(index, q).map((h) => ({ score: h.score, ...h.node }));
        appendQueryLog(rootDir, "http_query", q, hits.length);
        return send(200, JSON.stringify(hits));
      }
      if (url.pathname === "/api/explain") {
        const q = param("q");
        appendQueryLog(rootDir, "http_explain", q, 1);
        return send(200, JSON.stringify({ text: explain(index, q) }));
      }
      if (url.pathname === "/api/node") {
        const node = index.byId.get(param("id"));
        return node ? send(200, JSON.stringify(node)) : send(404, `{"error":"not found"}`);
      }
      if (url.pathname === "/api/neighbors") {
        const id = param("id");
        if (!index.byId.has(id)) return send(404, `{"error":"not found"}`);
        return send(200, JSON.stringify(index.neighbors(id).map((n) => index.byId.get(n))));
      }
      if (url.pathname === "/api/path") {
        const path = shortestPath(index, param("from"), param("to"));
        return send(200, JSON.stringify({ path: path ?? null }));
      }
      if (url.pathname === "/api/communities") {
        return send(
          200,
          JSON.stringify(
            communities(index).map((c) => ({ id: c.id, size: c.size, cohesion: c.cohesion })),
          ),
        );
      }
      if (url.pathname === "/api/stats") {
        const g = index.graph;
        return send(
          200,
          JSON.stringify({
            nodes: g.nodes.length,
            links: g.links.length,
            communities: new Set(g.nodes.map((n) => n.community)).size,
            god_nodes: godNodes(g, 5).map((x) => ({ label: x.node.label, degree: x.degree })),
            built_at_commit: g.built_at_commit ?? null,
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
