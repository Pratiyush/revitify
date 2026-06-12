import type { Extractor } from "../extractor.js";
import { createTreeSitterExtractor, type LanguageConfig } from "./factory.js";

/**
 * The widened language wave (graphify's remaining list, minus Swift — its npm package ships no
 * wasm yet). Each config is data against the official grammar's node types; depth follows the
 * Java precedent: members, constructors/initializers, and why-comments everywhere applicable.
 */

const RUBY: LanguageConfig = {
  id: "treesitter-ruby",
  language: "ruby",
  wasm: "tree-sitter-ruby/tree-sitter-ruby.wasm",
  extensions: [".rb"],
  definitions: [
    { type: "class", kind: "class", container: true },
    { type: "module", kind: "module", container: true },
    { type: "method", kind: "method" },
    { type: "singleton_method", kind: "method" },
  ],
  calls: [{ type: "call", calleeField: "method" }],
  comments: { types: ["comment"] },
};

const C: LanguageConfig = {
  id: "treesitter-c",
  language: "c",
  wasm: "tree-sitter-c/tree-sitter-c.wasm",
  extensions: [".c", ".h"],
  definitions: [
    {
      type: "function_definition",
      kind: "function",
      nameField: "declarator",
      nameStrategy: "declarator",
    },
    { type: "struct_specifier", kind: "struct" },
    { type: "enum_specifier", kind: "enum" },
    { type: "union_specifier", kind: "struct" },
  ],
  calls: [{ type: "call_expression" }],
  comments: { types: ["comment"] },
};

const CPP: LanguageConfig = {
  id: "treesitter-cpp",
  language: "cpp",
  wasm: "tree-sitter-cpp/tree-sitter-cpp.wasm",
  extensions: [".cc", ".cpp", ".cxx", ".hpp", ".hh"],
  definitions: [
    { type: "class_specifier", kind: "class", container: true },
    { type: "struct_specifier", kind: "struct", container: true },
    { type: "namespace_definition", kind: "module", container: true },
    {
      type: "function_definition",
      kind: "function",
      nameField: "declarator",
      nameStrategy: "declarator",
    },
    { type: "enum_specifier", kind: "enum" },
  ],
  calls: [{ type: "call_expression" }],
  comments: { types: ["comment"] },
};

const CSHARP: LanguageConfig = {
  id: "treesitter-csharp",
  language: "csharp",
  wasm: "tree-sitter-c-sharp/tree-sitter-c_sharp.wasm",
  extensions: [".cs"],
  definitions: [
    { type: "class_declaration", kind: "class", container: true },
    { type: "interface_declaration", kind: "interface", container: true },
    { type: "struct_declaration", kind: "struct", container: true },
    { type: "record_declaration", kind: "record", container: true },
    { type: "enum_declaration", kind: "enum", container: true },
    { type: "method_declaration", kind: "method" },
    { type: "constructor_declaration", kind: "constructor" },
    { type: "property_declaration", kind: "field" },
    { type: "field_declaration", kind: "field", nameChildType: "variable_declarator" },
    { type: "enum_member_declaration", kind: "const" },
  ],
  calls: [{ type: "invocation_expression" }],
  comments: { types: ["comment"] },
};

const BASH: LanguageConfig = {
  id: "treesitter-bash",
  language: "bash",
  wasm: "tree-sitter-bash/tree-sitter-bash.wasm",
  extensions: [".sh", ".bash"],
  definitions: [{ type: "function_definition", kind: "function" }],
  // Every command is a call site; only in-project function names survive resolution.
  calls: [{ type: "command", calleeField: "name" }],
  comments: { types: ["comment"] },
};

const PHP: LanguageConfig = {
  id: "treesitter-php",
  language: "php",
  wasm: "tree-sitter-php/tree-sitter-php.wasm",
  extensions: [".php"],
  definitions: [
    { type: "class_declaration", kind: "class", container: true },
    { type: "interface_declaration", kind: "interface", container: true },
    { type: "trait_declaration", kind: "trait", container: true },
    { type: "function_definition", kind: "function" },
    { type: "method_declaration", kind: "method" },
  ],
  calls: [
    { type: "function_call_expression", calleeField: "function" },
    { type: "member_call_expression", calleeField: "name" },
  ],
  comments: { types: ["comment"] },
};

const SCALA: LanguageConfig = {
  id: "treesitter-scala",
  language: "scala",
  wasm: "tree-sitter-scala/tree-sitter-scala.wasm",
  extensions: [".scala"],
  definitions: [
    { type: "class_definition", kind: "class", container: true },
    { type: "object_definition", kind: "object", container: true },
    { type: "trait_definition", kind: "trait", container: true },
    { type: "function_definition", kind: "function" },
  ],
  calls: [{ type: "call_expression" }],
  comments: { types: ["comment", "block_comment"] },
};

const KOTLIN: LanguageConfig = {
  id: "treesitter-kotlin",
  language: "kotlin",
  wasm: "@tree-sitter-grammars/tree-sitter-kotlin/tree-sitter-kotlin.wasm",
  extensions: [".kt", ".kts"],
  definitions: [
    { type: "class_declaration", kind: "class", container: true },
    { type: "object_declaration", kind: "object", container: true },
    { type: "function_declaration", kind: "function" },
    { type: "secondary_constructor", kind: "constructor" },
  ],
  calls: [{ type: "call_expression" }],
  comments: { types: ["line_comment", "multiline_comment"] },
};

const CONFIGS: Record<string, LanguageConfig> = {
  ruby: RUBY,
  c: C,
  cpp: CPP,
  csharp: CSHARP,
  bash: BASH,
  php: PHP,
  scala: SCALA,
  kotlin: KOTLIN,
};

export const WIDENED_LANGUAGES = Object.keys(CONFIGS);

export function create(language: string): Promise<Extractor> {
  const config = CONFIGS[language];
  if (!config) throw new Error(`no widened config for ${language}`);
  return createTreeSitterExtractor(config);
}
