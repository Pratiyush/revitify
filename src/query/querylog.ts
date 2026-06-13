import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Append-only JSONL query log (port of graphify querylog.py) — every query/path/affected/MCP
 * call lands here so usage patterns are auditable. Lives next to the cache, never walked.
 */
export interface QueryLogEntry {
  ts: string;
  kind: string;
  query: string;
  results: number;
}

let warnedLogFailure = false;

export function appendQueryLog(
  rootDir: string,
  kind: string,
  query: string,
  results: number,
): void {
  const path = join(rootDir, ".revitify", "query-log.jsonl");
  const entry: QueryLogEntry = { ts: new Date().toISOString(), kind, query, results };
  try {
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify(entry)}\n`);
  } catch (err) {
    // Logging must never break a query — but a permanently-broken log shouldn't be invisible.
    // One breadcrumb, then silence, so it never spams.
    if (!warnedLogFailure) {
      warnedLogFailure = true;
      console.error(
        `revitify: query log unwritable (${path}) — queries still work: ${String(err)}`,
      );
    }
  }
}
