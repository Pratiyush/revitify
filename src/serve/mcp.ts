import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { godNodes } from "../enrich/god-nodes.js";
import { communities } from "../query/communities.js";
import { explain, searchNodes } from "../query/explain.js";
import { appendQueryLog } from "../query/querylog.js";
import { shortestPath } from "../query/traverse.js";
import { GraphState } from "./state.js";

/**
 * MCP server (port of graphify serve.py's stdio MCP): the query surface as tools an assistant
 * can call. This module is reachable ONLY via dynamic import (dependency-cruiser enforces it)
 * so the SDK never loads for library or non-MCP CLI use.
 */
export function createMcpServer(rootDir: string): McpServer {
  const state = new GraphState(rootDir);
  const server = new McpServer({ name: "revitify", version: "0.1.0" });
  const text = (value: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  });

  server.tool(
    "query_graph",
    "Search the code knowledge graph (idf-ranked) and narrate the best seeds with neighbors.",
    { query: z.string() },
    async ({ query }) => {
      const index = state.get();
      const hits = searchNodes(index, query, 8);
      appendQueryLog(rootDir, "mcp_query", query, hits.length);
      return text({
        hits: hits.map((h) => ({ score: h.score, ...h.node })),
        explain: explain(index, query),
      });
    },
  );
  server.tool("get_node", "Fetch one node by id.", { id: z.string() }, async ({ id }) => {
    appendQueryLog(rootDir, "mcp_get_node", id, 1);
    return text(state.get().byId.get(id) ?? { error: "not found" });
  });
  server.tool("get_neighbors", "Neighbor nodes of an id.", { id: z.string() }, async ({ id }) => {
    const index = state.get();
    appendQueryLog(rootDir, "mcp_neighbors", id, index.neighbors(id).length);
    return text(index.neighbors(id).map((n) => index.byId.get(n)));
  });
  server.tool(
    "get_community",
    "Members of one community.",
    { community: z.number() },
    async ({ community }) => {
      const members = state.get().graph.nodes.filter((n) => n.community === community);
      appendQueryLog(rootDir, "mcp_community", String(community), members.length);
      return text(members);
    },
  );
  server.tool("god_nodes", "Most-connected symbols.", {}, async () => {
    const gods = godNodes(state.get().graph, 10);
    appendQueryLog(rootDir, "mcp_god_nodes", "", gods.length);
    return text(gods.map((g) => ({ degree: g.degree, ...g.node })));
  });
  server.tool("graph_stats", "Node/link/community counts and freshness.", {}, async () => {
    const g = state.get().graph;
    appendQueryLog(rootDir, "mcp_stats", "", 1);
    return text({
      nodes: g.nodes.length,
      links: g.links.length,
      communities: communities(state.get()).length,
      built_at_commit: g.built_at_commit ?? null,
    });
  });
  server.tool(
    "shortest_path",
    "BFS path between two node ids.",
    { from: z.string(), to: z.string() },
    async ({ from, to }) => {
      const path = shortestPath(state.get(), from, to);
      appendQueryLog(rootDir, "mcp_path", `${from} → ${to}`, path?.length ?? 0);
      return text({ path: path ?? null });
    },
  );
  return server;
}
