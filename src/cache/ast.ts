import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { FileRef, GraphFragment } from "../model/fragment.js";

/**
 * Per-file fragment cache (port of graphify cache.py): content key = sha256 of
 * version | file-set hash | relPath | content, with a stat (size+mtime) fastpath that skips
 * reading unchanged files entirely. The file-set hash is in the key because fragments embed
 * import resolution against the walked set — adding/removing files invalidates honestly.
 * Lives in <root>/.revitify/cache/ (dot-dir: never walked). Used by the async pipeline.
 */

const AST_VERSION = 1;

interface StatEntry {
  size: number;
  mtimeMs: number;
  key: string;
}

interface StatIndex {
  version: number;
  setHash: string;
  entries: Record<string, StatEntry>;
}

export interface CacheStats {
  hits: number;
  misses: number;
}

const sha256 = (s: string): string => createHash("sha256").update(s).digest("hex");

export class AstCache {
  private readonly dir: string;
  private readonly indexPath: string;
  private readonly setHash: string;
  private index: StatIndex;
  readonly stats: CacheStats = { hits: 0, misses: 0 };

  constructor(rootDir: string, knownFiles: ReadonlySet<string>) {
    const base = join(rootDir, ".revitify", "cache");
    this.dir = join(base, "ast");
    this.indexPath = join(base, "stat-index.json");
    this.setHash = sha256([...knownFiles].sort().join("\n")).slice(0, 16);
    this.index = this.loadIndex();
  }

  private loadIndex(): StatIndex {
    try {
      const raw = JSON.parse(readFileSync(this.indexPath, "utf8")) as StatIndex;
      if (raw.version === AST_VERSION && raw.setHash === this.setHash) return raw;
    } catch {
      // missing/corrupt index — start fresh
    }
    return { version: AST_VERSION, setHash: this.setHash, entries: {} };
  }

  private key(relPath: string, content: string): string {
    return sha256(`v${AST_VERSION}|${this.setHash}|${relPath}|${content}`);
  }

  private read(key: string): GraphFragment | undefined {
    try {
      return JSON.parse(readFileSync(join(this.dir, `${key}.json`), "utf8")) as GraphFragment;
    } catch {
      return undefined;
    }
  }

  /** Stat fastpath — fragment without reading the file (size+mtime unchanged since last put). */
  statGet(ref: FileRef): GraphFragment | undefined {
    const entry = this.index.entries[ref.relPath];
    if (!entry || entry.size !== ref.size || entry.mtimeMs !== ref.mtimeMs) return undefined;
    const fragment = this.read(entry.key);
    if (fragment) this.stats.hits++;
    return fragment;
  }

  /** Content path — hashes the (already-read) content; refreshes the stat entry on hit. */
  contentGet(ref: FileRef, content: string): GraphFragment | undefined {
    const key = this.key(ref.relPath, content);
    const fragment = this.read(key);
    if (fragment) {
      this.stats.hits++;
      this.index.entries[ref.relPath] = { size: ref.size, mtimeMs: ref.mtimeMs ?? 0, key };
    }
    return fragment;
  }

  put(ref: FileRef, content: string, fragment: GraphFragment): void {
    this.stats.misses++;
    const key = this.key(ref.relPath, content);
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(join(this.dir, `${key}.json`), JSON.stringify(fragment));
    this.index.entries[ref.relPath] = { size: ref.size, mtimeMs: ref.mtimeMs ?? 0, key };
  }

  flush(): void {
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(this.indexPath, `${JSON.stringify(this.index)}\n`);
  }
}
