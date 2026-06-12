import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertGraphContract } from "../../model/contract.js";

/** validate [graph.json] — the loud contract validator as a verb (CONTRACT backs it). */
export async function run(args: string[]): Promise<number> {
  const path = resolve(args[1] ?? "revitify-out/graph.json");
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    assertGraphContract(parsed);
    console.log(
      `✔ ${path}: ${parsed.nodes.length} nodes, ${parsed.links.length} links — contract holds`,
    );
    return 0;
  } catch (err) {
    console.error(`✖ ${path}: ${String(err)}`);
    return 1;
  }
}
