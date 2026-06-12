import type { Extractor } from "../extractor.js";
import { createTreeSitterExtractor, type LanguageConfig } from "./factory.js";

/**
 * Java via tree-sitter — deliberately richer than type declarations: constructors, methods,
 * and fields are first-class symbols (sym:<rel>#Class.member), per the parity requirement.
 */
const JAVA: LanguageConfig = {
  id: "treesitter-java",
  language: "java",
  wasm: "tree-sitter-java/tree-sitter-java.wasm",
  extensions: [".java"],
  definitions: [
    { type: "class_declaration", kind: "class", container: true },
    { type: "interface_declaration", kind: "interface", container: true },
    { type: "enum_declaration", kind: "enum", container: true },
    { type: "record_declaration", kind: "record", container: true },
    { type: "annotation_type_declaration", kind: "annotation", container: true },
    { type: "constructor_declaration", kind: "constructor" },
    { type: "method_declaration", kind: "method" },
    { type: "field_declaration", kind: "field", nameChildType: "variable_declarator" },
    { type: "enum_constant", kind: "const" },
  ],
  calls: [
    { type: "method_invocation", calleeField: "name" },
    { type: "object_creation_expression", calleeField: "type" },
  ],
  imports: [
    // import a.b.C; → reference to C (resolved by passes/resolve when C is in the graph).
    { type: "import_declaration", nameTypes: ["scoped_identifier", "identifier"] },
  ],
};

export const create = (): Promise<Extractor> => createTreeSitterExtractor(JAVA);
