import { Confidence } from "./confidence.js";
import type { RevitifyGraph } from "./graph.js";

/**
 * The output contract, runtime-checkable. These are the exact fields Rivet's loadCodeGraph reads
 * (llm-dev-kit src/engine/graphify/index.ts) — renaming or removing any of them breaks the
 * consumer. Additive fields are fine. This validator backs the contract test today and the
 * `validate` CLI verb later (Phase 7).
 */
export const CONTRACT = {
  artifacts: ["graph.json", "graph.html", "GRAPH_REPORT.md"],
  nodeRequired: ["id", "label", "source_file"],
  nodeOptional: ["name", "kind", "source_location", "community"],
  linkRequired: ["source", "target"],
  linkOptional: ["relation", "confidence"],
} as const;

/** Throws naming the first offending index + field — contract drift fails loudly, never silently. */
export function assertGraphContract(value: unknown): asserts value is RevitifyGraph {
  const fail = (msg: string): never => {
    throw new Error(`graph contract violation: ${msg}`);
  };
  if (typeof value !== "object" || value === null) fail("graph is not an object");
  const g = value as Record<string, unknown>;
  if (!Array.isArray(g.nodes)) fail("nodes is not an array");
  if (!Array.isArray(g.links)) fail("links is not an array");
  if (g.built_at_commit !== undefined && typeof g.built_at_commit !== "string")
    fail("built_at_commit is not a string");
  (g.nodes as unknown[]).forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null) fail(`nodes[${i}] is not an object`);
    const n = raw as Record<string, unknown>;
    if (typeof n.id !== "string") fail(`nodes[${i}].id is missing or not a string`);
    if (typeof n.label !== "string") fail(`nodes[${i}].label is missing or not a string`);
    if (typeof n.source_file !== "string")
      fail(`nodes[${i}].source_file is missing or not a string`);
    if (n.community !== undefined && typeof n.community !== "number")
      fail(`nodes[${i}].community is not a number`);
  });
  (g.links as unknown[]).forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null) fail(`links[${i}] is not an object`);
    const l = raw as Record<string, unknown>;
    if (typeof l.source !== "string") fail(`links[${i}].source is missing or not a string`);
    if (typeof l.target !== "string") fail(`links[${i}].target is missing or not a string`);
    if (l.relation !== undefined && typeof l.relation !== "string")
      fail(`links[${i}].relation is not a string`);
    if (
      l.confidence !== undefined &&
      !Object.values(Confidence).includes(l.confidence as Confidence)
    )
      fail(`links[${i}].confidence is not one of ${Object.values(Confidence).join("/")}`);
  });
}
