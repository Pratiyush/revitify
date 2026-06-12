import type { Extractor } from "../extractor.js";
import { createTreeSitterExtractor, type LanguageConfig } from "./factory.js";

/** Go via tree-sitter: functions, methods, and named types (struct/interface via type_spec). */
const GO: LanguageConfig = {
  id: "treesitter-go",
  language: "go",
  wasm: "tree-sitter-go/tree-sitter-go.wasm",
  extensions: [".go"],
  definitions: [
    { type: "function_declaration", kind: "function" },
    { type: "method_declaration", kind: "method" },
    { type: "type_spec", kind: "type" },
  ],
  calls: [{ type: "call_expression" }],
  comments: { types: ["comment"] },
};

export const create = (): Promise<Extractor> => createTreeSitterExtractor(GO);
