import { addNode, createBuilder, fileNode } from "../../extract/fragment-builder.js";
import { Confidence } from "../../model/confidence.js";
import type { GraphFragment, SourceFile } from "../../model/fragment.js";
import type { Ingestor } from "../ingestor.js";

/**
 * Cargo dependency ingestion (offline half of graphify's cargo introspection): hand-parsed
 * Cargo.toml [dependencies]/[dev-dependencies] tables → crate node + depends_on edges.
 * `cargo metadata` enrichment can layer on later; this never needs the toolchain.
 */
function ingestSync(file: SourceFile): GraphFragment {
  const b = createBuilder();
  const rel = file.relPath;
  const fileId = fileNode(b, rel);
  const lines = file.content.split("\n");
  let section = "";
  let crate = rel;
  for (const line of lines) {
    const header = line.match(/^\s*\[([^\]]+)\]/);
    if (header) {
      section = (header[1] as string).trim();
      continue;
    }
    const kv = line.match(/^\s*([\w-]+)\s*=\s*(.+?)\s*(?:#.*)?$/);
    if (!kv) continue;
    if (section === "package" && kv[1] === "name") {
      crate = (kv[2] as string).replace(/["']/g, "");
      const crateId = `sym:${rel}#${crate}`;
      addNode(b, crateId, crate, "crate", rel);
      b.links.push({
        source: fileId,
        target: crateId,
        relation: "contains",
        confidence: Confidence.EXTRACTED,
      });
    }
    if (section === "dependencies" || section === "dev-dependencies") {
      const dep = kv[1] as string;
      const depId = `dep:${rel}#${dep}`;
      addNode(b, depId, dep, "dependency", rel);
      b.links.push({
        source: `sym:${rel}#${crate}`,
        target: depId,
        relation: "depends_on",
        confidence: Confidence.EXTRACTED,
      });
    }
  }
  // A Cargo.toml without [package] (workspace root): hang deps off the file node instead.
  const crateId = `sym:${rel}#${crate}`;
  if (!b.seen.has(crateId)) {
    for (const l of b.links) {
      if (String(l.source) === crateId) l.source = fileId;
    }
  }
  return { nodes: b.nodes, links: b.links };
}

export const cargoIngestor: Ingestor = {
  id: "cargo",
  mode: "offline",
  detect: (file) => file.relPath.endsWith("Cargo.toml"),
  available: () => true,
  ingest: (file) => Promise.resolve(ingestSync(file)),
  ingestSync,
};
