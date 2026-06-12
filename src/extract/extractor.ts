import type { FileRef, GraphFragment, SourceFile } from "../model/fragment.js";

export interface ExtractContext {
  rootDir: string;
  /** Relative paths of every walked file — import specs resolve against this, never guessed. */
  knownFiles: ReadonlySet<string>;
}

/**
 * One per-language symbol+reference extractor. detect() must be cheap (extension/shebang —
 * no content reads); extract() returns this file's nodes/links as a fragment the pipeline merges.
 * Node ids follow the shared scheme: `file:<rel>`, `sym:<rel>#<name>`, `doc:<rel>#<heading>`.
 */
export interface Extractor {
  readonly id: string;
  readonly languages: readonly string[];
  detect(file: FileRef): boolean;
  extract(file: SourceFile, ctx: ExtractContext): GraphFragment;
}
