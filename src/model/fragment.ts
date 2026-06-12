import type { RevitifyLink, RevitifyNode } from "./graph.js";

/** A file as the walker sees it — enough for cheap detect() without reading content. */
export interface FileRef {
  path: string;
  relPath: string;
  size: number;
}

/** A file with its content loaded, ready for extraction/ingestion. */
export interface SourceFile extends FileRef {
  content: string;
}

/** What one extractor/ingestor contributes for one file; the pipeline merges fragments. */
export interface GraphFragment {
  nodes: RevitifyNode[];
  links: RevitifyLink[];
}
