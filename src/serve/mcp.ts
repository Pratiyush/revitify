import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { appendQueryLog } from "../query/querylog.js";
import { queryHandlers } from "./handlers.js";
import { GraphState } from "./state.js";

/**
 * MCP server (port of graphify serve.py's stdio MCP): the query surface as tools an assistant
 * can call. This module is reachable ONLY via dynamic import (dependency-cruiser enforces it)
 * so the SDK never loads for library or non-MCP CLI use. The query surface itself lives in
 * serve/handlers.ts (shared with the HTTP server, so the two cannot drift).
 */
export function createMcpServer(rootDir: string): McpServer {
  const state = new GraphState(rootDir);
  const q = queryHandlers(state);
  const server = new McpServer({ name: "revitify", version: "0.1.0" });
  const text = (value: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  });

  server.tool(
    "query_graph",
    "Search the code knowledge graph (idf-ranked) and narrate the best seeds with neighbors.",
    { query: z.string() },
    async ({ query }) => {
      const hits = q.search(query);
      appendQueryLog(rootDir, "mcp_query", query, hits.length);
      return text({ hits, explain: q.explain(query) });
    },
  );
  server.tool("get_node", "Fetch one node by id.", { id: z.string() }, async ({ id }) => {
    appendQueryLog(rootDir, "mcp_get_node", id, 1);
    return text(q.node(id) ?? { error: "not found" });
  });
  server.tool("get_neighbors", "Neighbor nodes of an id.", { id: z.string() }, async ({ id }) => {
    const ns = q.neighbors(id) ?? [];
    appendQueryLog(rootDir, "mcp_neighbors", id, ns.length);
    return text(ns);
  });
  server.tool(
    "get_community",
    "Members of one community.",
    { community: z.number() },
    async ({ community }) => {
      const members = q.community(community);
      appendQueryLog(rootDir, "mcp_community", String(community), members.length);
      return text(members);
    },
  );
  server.tool("god_nodes", "Most-connected symbols.", {}, async () => {
    const gods = q.godNodes();
    appendQueryLog(rootDir, "mcp_god_nodes", "", gods.length);
    return text(gods.map((g) => ({ degree: g.degree, ...g.node })));
  });
  server.tool("graph_stats", "Node/link/community counts and freshness.", {}, async () => {
    appendQueryLog(rootDir, "mcp_stats", "", 1);
    return text(q.stats());
  });
  server.tool(
    "shortest_path",
    "BFS path between two node ids.",
    { from: z.string(), to: z.string() },
    async ({ from, to }) => {
      const path = q.path(from, to);
      appendQueryLog(rootDir, "mcp_path", `${from} → ${to}`, path?.length ?? 0);
      return text({ path });
    },
  );
  return server;
}
