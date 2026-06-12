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
    for (const reg of this.registrations) {
      if (reg.extensions && !reg.extensions.some((ext) => file.relPath.endsWith(ext))) continue;
      if (reg.detect && !reg.detect(file)) continue;
      return reg;
    }
    return undefined;
  }

  async resolve(reg: Registration<T>): Promise<T> {
    const hit = this.cache.get(reg.id);
    if (hit !== undefined) return hit;
    const loaded = await reg.load();
    this.cache.set(reg.id, loaded);
    return loaded;
  }

  /** Undefined when the registration has no sync loader (heavy/lazy modules). */
  resolveSync(reg: Registration<T>): T | undefined {
    const hit = this.cache.get(reg.id);
    if (hit !== undefined) return hit;
    const loaded = reg.loadSync?.();
    if (loaded !== undefined) this.cache.set(reg.id, loaded);
    return loaded;
  }
}
