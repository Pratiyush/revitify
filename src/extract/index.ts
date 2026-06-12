import type { Extractor } from "./extractor.js";
import { javaExtractor } from "./java.js";
import { pythonExtractor } from "./python.js";
import { Registry } from "./registry.js";
import { typescriptExtractor } from "./typescript.js";

/**
 * Ordered extractor registrations — first match wins; dispatch order is part of the contract
 * (TS before the line grammars, mirroring the original switch). Adding a language = one entry
 * here. Phase 2 tree-sitter entries get `load()`-only thunks (no loadSync) so grammars stay
 * out of the sync path and out of `import { revitify }`.
 */
export const defaultExtractors = new Registry<Extractor>([
  {
    id: typescriptExtractor.id,
    detect: (f) => typescriptExtractor.detect(f),
    load: () => Promise.resolve(typescriptExtractor),
    loadSync: () => typescriptExtractor,
  },
  {
    id: pythonExtractor.id,
    extensions: [".py"],
    load: () => Promise.resolve(pythonExtractor),
    loadSync: () => pythonExtractor,
  },
  {
    id: javaExtractor.id,
    extensions: [".java"],
    load: () => Promise.resolve(javaExtractor),
    loadSync: () => javaExtractor,
  },
]);
