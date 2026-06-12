import type { Extractor } from "../extractor.js";
import { createTreeSitterExtractor, type LanguageConfig } from "./factory.js";

/** Rust via tree-sitter: fns, structs, enums, traits, impl methods, modules, consts, types. */
const RUST: LanguageConfig = {
  id: "treesitter-rust",
  language: "rust",
  wasm: "tree-sitter-rust/tree-sitter-rust.wasm",
  extensions: [".rs"],
  definitions: [
    { type: "function_item", kind: "function" },
    { type: "struct_item", kind: "struct", container: true },
    { type: "enum_item", kind: "enum" },
    { type: "trait_item", kind: "trait", container: true },
    { type: "impl_item", kind: "impl", nameField: "type", container: true },
    { type: "mod_item", kind: "module", container: true },
    { type: "const_item", kind: "const" },
    { type: "static_item", kind: "const" },
    { type: "type_item", kind: "type" },
  ],
  calls: [{ type: "call_expression" }],
  comments: { types: ["line_comment", "block_comment"] },
  imports: [{ type: "use_declaration", nameTypes: ["identifier"] }],
};

export const create = (): Promise<Extractor> => createTreeSitterExtractor(RUST);
