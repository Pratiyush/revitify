import { EXTENSION_LANGUAGES } from "./detect.js";
import type { Extractor } from "./extractor.js";
import { javaExtractor } from "./java.js";
import { pythonExtractor } from "./python.js";
import { Registry } from "./registry.js";
import { typescriptExtractor } from "./typescript.js";

/** detect.ts is the single source of truth for extension → language. */
const extensionsFor = (language: string): string[] =>
  Object.entries(EXTENSION_LANGUAGES)
    .filter(([, lang]) => lang === language)
    .map(([ext]) => ext);

/**
 * Ordered extractor registrations — first match wins per path; matchAll() yields the fallback
 * chain. Tree-sitter entries are load()-only (no loadSync): the synchronous facade skips them
 * and falls back to the regex extractors, while buildGraphAsync gets the full grammars. A
 * failed wasm load also falls back — degraded, never fatal, offline invariant intact.
 */
export const defaultExtractors = new Registry<Extractor>([
  {
    id: typescriptExtractor.id,
    detect: (f) => typescriptExtractor.detect(f),
    load: () => Promise.resolve(typescriptExtractor),
    loadSync: () => typescriptExtractor,
  },
  {
    id: "treesitter-python",
    extensions: extensionsFor("python"),
    load: () => import("./treesitter/python.js").then((m) => m.create()),
  },
  {
    id: "treesitter-java",
    extensions: extensionsFor("java"),
    load: () => import("./treesitter/java.js").then((m) => m.create()),
  },
  {
    id: "treesitter-go",
    extensions: extensionsFor("go"),
    load: () => import("./treesitter/go.js").then((m) => m.create()),
  },
  {
    id: "treesitter-rust",
    extensions: extensionsFor("rust"),
    load: () => import("./treesitter/rust.js").then((m) => m.create()),
  },
  // The widened wave — one shared module, per-language configs (Swift: blocked on upstream wasm).
  ...["ruby", "c", "cpp", "csharp", "bash", "php", "scala", "kotlin"].map((language) => ({
    id: `treesitter-${language}`,
    extensions: extensionsFor(language),
    load: () => import("./treesitter/widened.js").then((m) => m.create(language)),
  })),
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
