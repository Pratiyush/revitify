import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { extraExporters } from "../../export/index.js";
import { loadOrBuild } from "../load.js";

/** export [ids…] — render the opt-in exporters (all four when no ids given). */
export async function run(args: string[]): Promise<number> {
  const wanted = args.slice(1).filter((a) => !a.startsWith("-"));
  const { root, index } = await loadOrBuild(undefined);
  const out = join(root, "revitify-out");
  const selected = wanted.length
    ? extraExporters.filter((e) => wanted.includes(e.id))
    : extraExporters;
  if (!selected.length) {
    console.error(
      `unknown exporter(s): ${wanted.join(", ")} — have: ${extraExporters.map((e) => e.id).join(", ")}`,
    );
    return 1;
  }
  for (const exporter of selected) {
    const path = join(out, exporter.filename);
    writeFileSync(path, exporter.render(index.graph, { rootDir: root, outDir: out }));
    console.log(`→ ${path}`);
  }
  return 0;
}
