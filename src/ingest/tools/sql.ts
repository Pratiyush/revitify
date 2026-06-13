import { addNode, createBuilder, fileNode } from "../../extract/fragment-builder.js";
import { Confidence } from "../../model/confidence.js";
import type { GraphFragment, SourceFile } from "../../model/fragment.js";
import { nameRef, symId } from "../../model/ids.js";
import type { Ingestor } from "../ingestor.js";

/**
 * SQL schema ingestion (offline half of graphify's Postgres introspection): CREATE TABLE DDL →
 * table nodes with column fields; REFERENCES → relation edges between tables. Zero deps, zero
 * keys. Live-database introspection stays out of scope until a psql-backed ingestor lands.
 */
const CREATE_TABLE =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?["'`]?(\w+)["'`]?\s*\(([\s\S]*?)\)\s*;/gi;
const REFERENCES = /references\s+["'`]?(\w+)["'`]?/i;

function ingestSync(file: SourceFile): GraphFragment {
  const b = createBuilder();
  const rel = file.relPath;
  const fileId = fileNode(b, rel);
  for (const stmt of file.content.matchAll(CREATE_TABLE)) {
    const table = stmt[1] as string;
    const tableId = symId(rel, table);
    const line = file.content.slice(0, stmt.index).split("\n").length;
    addNode(b, tableId, table, "table", rel, line);
    b.links.push({
      source: fileId,
      target: tableId,
      relation: "contains",
      confidence: Confidence.EXTRACTED,
    });
    for (const columnLine of (stmt[2] as string).split(",")) {
      const column = columnLine.trim().match(/^["'`]?(\w+)["'`]?\s+\w+/);
      if (!column || /^(primary|foreign|constraint|unique|check|index)$/i.test(column[1] as string))
        continue;
      const columnId = symId(rel, `${table}.${column[1]}`);
      addNode(b, columnId, column[1] as string, "column", rel, line);
      b.links.push({
        source: tableId,
        target: columnId,
        relation: "contains",
        confidence: Confidence.EXTRACTED,
      });
      const ref = columnLine.match(REFERENCES);
      if (ref) {
        b.links.push({
          source: tableId,
          target: nameRef(ref[1] as string),
          relation: "references",
        });
      }
    }
  }
  return { nodes: b.nodes, links: b.links };
}

export const sqlIngestor: Ingestor = {
  id: "sql",
  mode: "offline",
  detect: (file) => file.relPath.endsWith(".sql"),
  available: () => true,
  ingest: (file) => Promise.resolve(ingestSync(file)),
  ingestSync,
};
