import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { revitifyAsync } from "../../index.js";
import { parseArgs } from "../args.js";

/** serve [path] [--port N] — HTTP viewer + JSON API; mcp — stdio MCP server. */
export async function run(args: string[]): Promise<number> {
  const [verb, ...rest] = args;
  const parsed = parseArgs(rest);
  const root = resolve(parsed.positional[0] ?? ".");
  if (!existsSync(resolve(root, "revitify-out", "graph.json"))) await revitifyAsync(root);

  if (verb === "mcp") {
    const { createMcpServer } = await import("../../serve/mcp.js");
    const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
    const server = createMcpServer(root);
    await server.connect(new StdioServerTransport());
    console.error(`revitify MCP server on stdio (root: ${root})`);
    return new Promise<number>(() => {});
  }

  const portValue = parsed.value("port");
  const port = portValue ? Number(portValue) : 7077;
  const { createHttpServer } = await import("../../serve/http.js");
  const server = createHttpServer(root);
  await new Promise<void>((ready) => server.listen(port, "127.0.0.1", ready));
  console.log(`revitify serving http://127.0.0.1:${port} (root: ${root}) — ctrl-c to stop`);
  return new Promise<number>(() => {});
}
