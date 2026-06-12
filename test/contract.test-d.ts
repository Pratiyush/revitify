import { expectTypeOf, test } from "vitest";
import type { RevitifyGraph } from "../src/index.js";

/**
 * Type-level contract pin. RivetReadGraph is copied VERBATIM from the reader in
 * ~/Github/llm-dev-kit/src/engine/graphify/index.ts (RawGraph + loadCodeGraph's field accesses).
 * If RevitifyGraph ever stops being assignable to what Rivet reads, this fails at compile time —
 * before any runtime test even runs.
 */
interface RivetReadGraph {
  built_at_commit?: string;
  nodes?: Array<{
    id?: string;
    name?: string;
    label?: string;
    source_file?: string;
    source_location?: string;
    community?: number;
  }>;
  links?: Array<{ source?: unknown; target?: unknown; relation?: string }>;
}

test("RevitifyGraph stays assignable to the shape Rivet's loadCodeGraph reads", () => {
  expectTypeOf<RevitifyGraph>().toExtend<RivetReadGraph>();
});
