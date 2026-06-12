import type { FileRef } from "../model/fragment.js";

/**
 * One generic registry shape for extractors, ingestors, and (later) exporters. Dispatch is an
 * ordered-array match — adding a language/ingestor is a new Registration literal, never an edit
 * to a switch. No side-effect self-registration: default arrays are plain data, so import order
 * is never load-bearing and unused registrations tree-shake away.
 *
 * `load()` is THE lazy boundary: heavy modules (tree-sitter WASM, MCP SDK, LLM backends) hide
 * behind dynamic-import thunks that fire on first match. `loadSync` exists only on
 * zero-heavy-dep entries — it is what keeps the classic `buildGraph()`/`revitify()` synchronous.
 */
export interface Registration<T> {
  readonly id: string;
  /** Fast pre-filter on file suffix, checked before detect(). Omit to accept any extension. */
  readonly extensions?: readonly string[];
  detect?(file: FileRef): boolean;
  load(): Promise<T>;
  loadSync?(): T;
}

export class Registry<T> {
  private readonly cache = new Map<string, T>();

  constructor(private readonly registrations: readonly Registration<T>[]) {}

  /** First registration whose extension pre-filter AND detect() accept the file. */
  match(file: FileRef): Registration<T> | undefined {
    return this.matchAll(file)[0];
  }

  /**
   * Every matching registration, in order — the fallback chain. The sync path naturally skips
   * load()-only entries (resolveSync → undefined) and lands on the next match (e.g. tree-sitter
   * python → regex python); the async path tries resolve() and falls through on load failure.
   */
  matchAll(file: FileRef): Registration<T>[] {
    const out: Registration<T>[] = [];
    for (const reg of this.registrations) {
      if (reg.extensions && !reg.extensions.some((ext) => file.relPath.endsWith(ext))) continue;
      if (reg.detect && !reg.detect(file)) continue;
      out.push(reg);
    }
    return out;
  }

  async resolve(reg: Registration<T>): Promise<T> {
    const hit = this.cache.get(reg.id);
    if (hit !== undefined) return hit;
    const loaded = await reg.load();
    this.cache.set(reg.id, loaded);
    return loaded;
  }

  /**
   * Undefined when the registration has no sync loader (heavy/lazy modules) — even if the
   * async path already loaded it. The sync facade's output must be deterministic regardless
   * of process history; an earlier buildGraphAsync must never upgrade a later buildGraph.
   */
  resolveSync(reg: Registration<T>): T | undefined {
    if (!reg.loadSync) return undefined;
    const hit = this.cache.get(reg.id);
    if (hit !== undefined) return hit;
    const loaded = reg.loadSync();
    this.cache.set(reg.id, loaded);
    return loaded;
  }
}
