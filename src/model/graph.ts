import type { Confidence } from "./confidence.js";

/**
 * Revitify's graph shape IS graphify's output contract (the shape dev-spec-kit's loadCodeGraph was
 * verified against): nodes carry id/name/label/source_file/source_location/community; links carry
 * source/target/relation; built_at_commit stamps freshness. Changing this shape breaks every
 * downstream consumer — don't.
 */

export interface RevitifyNode {
  id: string;
  name?: string;
  label: string;
  kind?: string;
  source_file: string;
  source_location?: string;
  community?: number;
  /** Additive: first line of the symbol's docstring (viewer detail panel). */
  summary?: string;
}

export interface RevitifyLink {
  source: string;
  target: string;
  relation?: string;
  /** Additive (Phase 1b): EXTRACTED structural · INFERRED unique resolution · AMBIGUOUS multi. */
  confidence?: Confidence;
}

export interface RevitifyGraph {
  built_at_commit?: string;
  nodes: RevitifyNode[];
  links: RevitifyLink[];
}
