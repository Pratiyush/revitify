import type { Extractor } from "../extractor.js";
import { createTreeSitterExtractor, type LanguageConfig } from "./factory.js";

/** Python via tree-sitter: classes, functions, methods (nested defs), import file-resolution. */
const PYTHON: LanguageConfig = {
  id: "treesitter-python",
  language: "python",
  wasm: "tree-sitter-python/tree-sitter-python.wasm",
  extensions: [".py", ".pyi"],
  definitions: [
    { type: "class_definition", kind: "class", container: true },
    { type: "function_definition", kind: "function" },
  ],
  calls: [{ type: "call" }],
  imports: [
    {
      type: "import_statement",
      moduleField: "name",
      filePatterns: ["$1.py", "$1/__init__.py"],
    },
    {
      type: "import_from_statement",
      moduleField: "module_name",
      filePatterns: ["$1.py", "$1/__init__.py"],
      nameTypes: ["dotted_name", "aliased_import"],
    },
  ],
};

export const create = (): Promise<Extractor> => createTreeSitterExtractor(PYTHON);
